const express = require('express');
const mysql = require('mysql2/promise');
const pool = require("../../Config/db_pool");
exports.paggingQuery = async (query_count, query, cond, limit, page) => {

  limit = (limit === "" || !limit) ? 10 : Number(limit);
  page = (page === "" || !page) ? 1 : Number(page);
  var total_pages = 0;
  var total_records = 0;
  var next = true;
  var prev = true;
  var start = (page - 1) * limit;

  try {
    // Total Records Count Query - START //
    var totalCount = await pool.query(query_count, cond);
    total_records = totalCount[0][0].total_records;
    // Total Records Count Query - END //
    cond.push(start);
    cond.push(limit);
    // Sorted Records Query - START //
    var dataRows = await pool.query(query, cond);
    // Sorted Records Query - START //

    total_pages = Math.ceil(total_records / limit);
    var next = page >= total_pages ? false : true;
    var prev = page <= 1 ? false : true;
    return {
      success: true,
      total_records: total_records,
      total_pages: total_pages,
      page: page,
      next: next,
      prev: prev,
      data: dataRows[0],
    };
  } catch (error) {
    return { success: false, error: error };
  }

}