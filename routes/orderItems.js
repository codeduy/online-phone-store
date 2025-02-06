const express = require("express");
const OrderItem = require("../models/orderItemModel");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const orderItems = await OrderItem.find(); // Truy vấn tất cả sản phẩm

    if (orderItems.length === 0) {
      return res.status(404).json({ message: 'No orderItems found' });
    }
    res.json(orderItems); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving orderItems:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving orderItems', error: err });
  }
});

module.exports = router;
