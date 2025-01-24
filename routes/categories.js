const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find(); // Truy vấn tất cả sản phẩm

    if (categories.length === 0) {
      return res.status(404).json({ message: 'No categories found' });
    }
    res.json(categories); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving products:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving products', error: err });
  }
});

module.exports = router;
