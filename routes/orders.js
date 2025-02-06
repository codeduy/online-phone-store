const express = require("express");
const Order = require("../models/orderModel");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find(); // Truy vấn tất cả sản phẩm

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No Order found' });
    }
    res.json(orders); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving Order:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving Order', error: err });
  }
});

module.exports = router;
