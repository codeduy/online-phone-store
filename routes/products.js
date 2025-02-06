const express = require("express");
const Product = require("../models/Product");
const Category = require('../models/Category');

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await Product.find() // Truy vấn tất cả sản phẩm
      .populate('category_id', 'name') // Populate trường category_id với chỉ trường 'name' từ bảng Category
      .exec();
      
    console.log(products); 
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }
    res.json(products); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving products:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving products', error: err });
  }
});

module.exports = router;
