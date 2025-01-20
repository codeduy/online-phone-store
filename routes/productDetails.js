const express = require("express");
const ProductDetail = require("../models/ProductDetail");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const productDetails = await ProductDetail.find(); // Truy vấn tất cả sản phẩm

    if (productDetails.length === 0) {
      return res.status(404).json({ message: 'No productDetails found' });
    }
    res.json(productDetails); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving productDetails:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving productDetails', error: err });
  }
});

module.exports = router;
