const express = require("express");
const Report = require("../models/Report");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find(); // Truy vấn tất cả sản phẩm

    if (reports.length === 0) {
      return res.status(404).json({ message: 'No reports found' });
    }
    res.json(reports); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving reports:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving reports', error: err });
  }
});

module.exports = router;
