const express = require("express");
const Shipment = require("../models/shipmentModel");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const shipments = await Shipment.find(); // Truy vấn tất cả sản phẩm

    if (shipments.length === 0) {
      return res.status(404).json({ message: 'No shipments found' });
    }
    res.json(shipments); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving shipments:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving shipments', error: err });
  }
});

module.exports = router;
