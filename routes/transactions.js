const express = require("express");
const Transaction = require("../models/transactionModel");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find(); // Truy vấn tất cả sản phẩm

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found' });
    }
    res.json(transactions); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving transactions:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving transactions', error: err });
  }
});

module.exports = router;
