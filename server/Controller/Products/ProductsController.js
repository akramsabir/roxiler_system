const pool = require("../../Config/db_pool");
const { paggingQuery } = require("../Helper/QueryHelper");
const axios = require("axios");


exports.GetProducts = async (req, res) => {
  try {
    var query_count = `SELECT COUNT(*) AS total_records FROM products`;
    var query = `SELECT *,
          CASE
              WHEN products.product_sold = 1 THEN 'Sold'
              WHEN products.product_sold = 0 THEN 'Not Sold'
          END AS product_sold_label,
          CASE
              WHEN products.product_sold = 1 THEN 'success'
              WHEN products.product_sold = 0 THEN 'danger'
          END AS product_sold_class
          FROM products`;


    var condValues = new Array();
    var condCols = new Array();
    if (req.query.keyword) {
      if (!isNaN(req.query.keyword)) {
        condCols.push(`products.product_price BETWEEN 0 AND ?`);
        condValues.push(req.query.keyword);
      } else {
        condCols.push(`( products.product_title LIKE ? OR products.product_description LIKE ? )`);
        condValues.push(`%${req.query.keyword}%`);
        condValues.push(`%${req.query.keyword}%`);
      }
    }

    if (req.query.month) {
      condCols.push(`MONTH(products.product_date_of_sale) = ?`);
      condValues.push(req.query.month);
    }

    if (condCols.length > 0) {
      query += " WHERE " + condCols.join(" AND ");
      query_count += " WHERE " + condCols.join(" AND ");
    }

    query += " ORDER BY products.product_title ASC";
    query += " LIMIT ?, ?";

    var response = await paggingQuery(query_count, query, condValues, req.query.limit, req.query.page);
    return res.status(200).json(response);

  } catch (error) {
    return res.json({ success: false, message: "Oops an error occurred!" });
  }
};

exports.StoreProductsByApi = async (req, res) => {
  const url = `https://s3.amazonaws.com/roxiler.com/product_transaction.json`;

  try {
    const response = await axios.get(url);
    let data = response.data;

    if (data) {
      for (let i = 0; i < data.length; i++) {
        let fields = {
          product_category: data[i].category,
          product_title: data[i].title,
          product_description: data[i].description,
          product_image: data[i].image,
          product_price: data[i].price,
          product_sold: data[i].sold,
          product_date_of_sale: data[i].dateOfSale,
        }
        await pool.query('INSERT INTO products SET ?', [fields]);
      }
    } else {
      return res.json({ success: false, message: "Sorry Data Not Found..!" });
    }

    return res.json({ success: true, message: "Data Inserted Successfully..!" });
  } catch (error) {
    console.error('Error fetching address:', error);
    return res.json({ success: false, message: "Oops an error occurred!" });
  }
};

exports.GetProductsStatistics = async (req, res) => {
  try {

    if (!req.query.month) {
      return res.status(400).json({ success: false, message: "Please Select Month!" });
    }

    var query = `SELECT SUM(product_price)AS total_amount,SUM(product_sold=1)AS total_sold, SUM(product_sold = 0)AS total_not_sold FROM products WHERE MONTH(products.product_date_of_sale) = ?`;
    var [result] = await pool.query(query, [req.query.month]);

    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.log(`error`, error);
    return res.json({ success: false, message: "Oops an error occurred!" });
  }
};

exports.GetProductsBarChart = async (req, res) => {
  try {
    if (!req.query.month) {
      return res.status(400).json({ success: false, message: "Please Select Month!" });
    }

    var query = `
      SELECT
        CASE
          WHEN product_price BETWEEN 0 AND 100 THEN '0-100'
          WHEN product_price BETWEEN 101 AND 200 THEN '101-200'
          WHEN product_price BETWEEN 201 AND 300 THEN '201-300'
          WHEN product_price BETWEEN 301 AND 400 THEN '301-400'
          WHEN product_price BETWEEN 401 AND 500 THEN '401-500'
          WHEN product_price BETWEEN 501 AND 600 THEN '501-600'
          WHEN product_price BETWEEN 601 AND 700 THEN '601-700'
          WHEN product_price BETWEEN 701 AND 800 THEN '701-800'
          WHEN product_price BETWEEN 801 AND 900 THEN '801-900'
          ELSE '901-above'
        END AS price_range,
        COUNT(*) AS count
      FROM products
      WHERE MONTH(product_date_of_sale) = ?
      GROUP BY price_range
      ORDER BY FIELD(price_range, '0-100', '101-200', '201-300', '301-400', '401-500', '501-600', '601-700', '701-800', '801-900', '901-above')`;

    var [result] = await pool.query(query, [req.query.month]);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log(`error`, error);
    return res.json({ success: false, message: "Oops an error occurred!" });
  }
};

exports.GetProductsPieChart = async (req, res) => {
  try {
    if (!req.query.month) {
      return res.status(400).json({ success: false, message: "Please Select Month!" });
    }

    var query = `
      SELECT 
        SUM(products.product_category = 'electronics') AS total_electronics,
        SUM(products.product_category = 'jewelery') AS total_jewelry,
        SUM(products.product_category = "men's clothing") AS total_mens_clothing,
        SUM(products.product_category = "women's clothing") AS total_womens_clothing,
        COUNT(*) AS total_products
      FROM products
      WHERE MONTH(product_date_of_sale) = ?
    `;

    var [result] = await pool.query(query, [req.query.month]);

    if (result.length > 0) {
      const { total_electronics, total_jewelry, total_mens_clothing, total_womens_clothing, total_products } = result[0];

      // Calculate percentages
      const electronics_percentage = ((total_electronics / total_products) * 100).toFixed(2);
      const jewelry_percentage = ((total_jewelry / total_products) * 100).toFixed(2);
      const mens_clothing_percentage = ((total_mens_clothing / total_products) * 100).toFixed(2);
      const womens_clothing_percentage = ((total_womens_clothing / total_products) * 100).toFixed(2);

      return res.status(200).json({
        success: true,
        data: {
          total_electronics,
          electronics_percentage,
          total_jewelry,
          jewelry_percentage,
          total_mens_clothing,
          mens_clothing_percentage,
          total_womens_clothing,
          womens_clothing_percentage,
        }
      });
    } else {
      return res.status(200).json({ success: true, data: [] });
    }

  } catch (error) {
    console.log(`error`, error);
    return res.json({ success: false, message: "Oops an error occurred!" });
  }
};

exports.GetCombinedData = async (req, res) => {
  try {
    if (!req.query.month) {
      return res.status(400).json({ success: false, message: "Please Select Month!" });
    }

    // Get Products
    var query_count = `SELECT COUNT(*) AS total_records FROM products`;
    var query = `SELECT *,
          CASE
              WHEN products.product_sold = 1 THEN 'Sold'
              WHEN products.product_sold = 0 THEN 'Not Sold'
          END AS product_sold_label,
          CASE
              WHEN products.product_sold = 1 THEN 'success'
              WHEN products.product_sold = 0 THEN 'danger'
          END AS product_sold_class
          FROM products`;


    var condValues = new Array();
    var condCols = new Array();

    if (req.query.keyword) {
      condCols.push(`( products.product_title LIKE ? OR products.product_description LIKE ? OR products.product_price LIKE ? )`);
      condValues.push(`%${req.query.keyword}%`);
      condValues.push(`%${req.query.keyword}%`);
      condValues.push(`%${req.query.keyword}%`);
    }

    if (req.query.month) {
      condCols.push(`MONTH(products.product_date_of_sale) = ?`);
      condValues.push(req.query.month);
    }

    if (condCols.length > 0) {
      query += " WHERE " + condCols.join(" AND ");
      query_count += " WHERE " + condCols.join(" AND ");
    }

    query += " ORDER BY products.product_title ASC";
    query += " LIMIT ?, ?";

    var response = await paggingQuery(query_count, query, condValues, req.query.limit, req.query.page);

    // product statistics
    var query_statistics = `SELECT SUM(product_price)AS total_amount,SUM(product_sold=1)AS total_sold, SUM(product_sold = 0)AS total_not_sold FROM products WHERE MONTH(products.product_date_of_sale) = ?`;
    var [result_statistics] = await pool.query(query_statistics, [req.query.month]);

    // product bar chart
    var query_bar_chart = `
      SELECT
        CASE
          WHEN product_price BETWEEN 0 AND 100 THEN '0-100'
          WHEN product_price BETWEEN 101 AND 200 THEN '101-200'
          WHEN product_price BETWEEN 201 AND 300 THEN '201-300'
          WHEN product_price BETWEEN 301 AND 400 THEN '301-400'
          WHEN product_price BETWEEN 401 AND 500 THEN '401-500'
          WHEN product_price BETWEEN 501 AND 600 THEN '501-600'
          WHEN product_price BETWEEN 601 AND 700 THEN '601-700'
          WHEN product_price BETWEEN 701 AND 800 THEN '701-800'
          WHEN product_price BETWEEN 801 AND 900 THEN '801-900'
          ELSE '901-above'
        END AS price_range,
        COUNT(*) AS count
      FROM products
      WHERE MONTH(product_date_of_sale) = ?
      GROUP BY price_range
      ORDER BY FIELD(price_range, '0-100', '101-200', '201-300', '301-400', '401-500', '501-600', '601-700', '701-800', '801-900', '901-above')`;

    var [result_bar_chart] = await pool.query(query_bar_chart, [req.query.month]);


    var query_pie_chart = `
      SELECT 
        SUM(products.product_category = 'electronics') AS total_electronics,
        SUM(products.product_category = 'jewelery') AS total_jewelry,
        SUM(products.product_category = "men's clothing") AS total_mens_clothing,
        SUM(products.product_category = "women's clothing") AS total_womens_clothing,
        COUNT(*) AS total_products
      FROM products
      WHERE MONTH(product_date_of_sale) = ?
    `;

    var [result_pie_chart] = await pool.query(query_pie_chart, [req.query.month]);

    var result_pie_chart_data = {};

    if (result_pie_chart.length > 0) {
      const { total_electronics, total_jewelry, total_mens_clothing, total_womens_clothing, total_products } = result_pie_chart[0];
      const electronics_percentage = ((total_electronics / total_products) * 100).toFixed(2);
      const jewelry_percentage = ((total_jewelry / total_products) * 100).toFixed(2);
      const mens_clothing_percentage = ((total_mens_clothing / total_products) * 100).toFixed(2);
      const womens_clothing_percentage = ((total_womens_clothing / total_products) * 100).toFixed(2);
      result_pie_chart_data = {
        electronics_percentage: electronics_percentage,
        jewelry_percentage: jewelry_percentage,
        mens_clothing_percentage: mens_clothing_percentage,
        womens_clothing_percentage: womens_clothing_percentage,
      }

    }

    return res.status(200).json({ success: true, GetProducts: response, result_statistics: result_statistics, result_bar_chart: result_bar_chart, result_pie_chart_data: result_pie_chart_data });
  }
  catch (error) {
    console.log(`error`, error);
    return res.json({ success: false, message: "Oops an error occurred!" });
  }
};