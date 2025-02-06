const express = require("express");
const Log = require("../models/logModel");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const Logs = await Log.find(); // Truy vấn tất cả sản phẩm

    if (Logs.length === 0) {
      return res.status(404).json({ message: 'No Logs found' });
    }
    res.json(Logs); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving Logs:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving Logs', error: err });
  }
});

module.exports = router;
