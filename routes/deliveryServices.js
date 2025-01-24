const express = require("express");
const DeliveryService = require("../models/DeliveryService");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const deliveryServices = await DeliveryService.find(); // Truy vấn tất cả sản phẩm

    if (deliveryServices.length === 0) {
      return res.status(404).json({ message: 'No deliveryServices found' });
    }
    res.json(deliveryServices); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving deliveryServices:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving deliveryServices', error: err });
  }
});

module.exports = router;
