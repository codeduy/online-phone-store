const express = require("express");
const Promotion = require("../models/promotionModel");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const promotions = await Promotion.find(); // Truy vấn tất cả sản phẩm

    if (promotions.length === 0) {
      return res.status(404).json({ message: 'No promotions found' });
    }
    res.json(promotions); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving promotions:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving promotions', error: err });
  }
});

module.exports = router;
