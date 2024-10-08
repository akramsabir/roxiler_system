const express = require("express");
var router = express.Router();

const ProductsController = require("../Controller/Products/ProductsController");
router.get("/GetProducts", ProductsController.GetProducts);
router.get("/GetProductsStatistics", ProductsController.GetProductsStatistics);
router.get("/GetProductsBarChart", ProductsController.GetProductsBarChart);
router.get("/GetProductsPieChart", ProductsController.GetProductsPieChart);
router.get("/GetCombinedData", ProductsController.GetCombinedData);
router.post("/StoreProductsByApi", ProductsController.StoreProductsByApi);

module.exports = router;