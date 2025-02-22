const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products grouped by brand
router.get('/by-brand', productController.getAllProductsByBrand);

// Get products for specific brand
router.get('/brand/:brand', productController.getProductsByBrand);

// Get filtered products
router.get('/filter', productController.getFilteredProducts);

router.get('/hot', productController.getHotProducts);

router.get('/detail/:link', productController.getProductByLink);
router.get('/', productController.getProductsByName);

// Search products
router.get('/search', productController.searchProducts);

module.exports = router;