const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const users = await User.find(); // Truy vấn tất cả sản phẩm

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.json(users); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving users:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving users', error: err });
  }
});

module.exports = router;
