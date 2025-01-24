const express = require("express");
const NewsEvent = require("../models/NewsEvent");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const newsEvents = await NewsEvent.find(); // Truy vấn tất cả sản phẩm

    if (newsEvents.length === 0) {
      return res.status(404).json({ message: 'No newsEvents found' });
    }
    res.json(newsEvents); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving newsEvents:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving newsEvents', error: err });
  }
});

module.exports = router;
