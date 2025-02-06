const express = require("express");
const ShipmentLog = require("../models/shipmentLogModel");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const shipmentLogs = await ShipmentLog.find(); // Truy vấn tất cả sản phẩm

    if (shipmentLogs.length === 0) {
      return res.status(404).json({ message: 'No shipments found' });
    }
    res.json(shipmentLogs); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving shipmentLogs:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving shipments', error: err });
  }
});

module.exports = router;
