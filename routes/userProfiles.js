const express = require("express");
const UserProfile = require("../models/userProfileModel");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const userProfiles = await UserProfile.find(); // Truy vấn tất cả sản phẩm

    if (userProfiles.length === 0) {
      return res.status(404).json({ message: 'No userProfiles found' });
    }
    res.json(userProfiles); // Trả về dữ liệu
  } catch (err) {
    console.log("Error retrieving userProfiles:", err); // Log lỗi nếu có
    res.status(500).json({ message: 'Error retrieving userProfiles', error: err });
  }
});

module.exports = router;
