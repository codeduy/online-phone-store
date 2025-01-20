const express = require("express");
const Staff = require("../models/Staff");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const staffs = await Staff.find(); // Truy vấn tất cả sản phẩm

    if (staffs.length === 0) {
      return res.status(404).json({ message: 'No staffs found' });
    }
    res.json(staffs); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving staffs:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving staffs', error: err });
  }
});

module.exports = router;
