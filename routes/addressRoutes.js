const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

// Route để lấy danh sách tỉnh/thành phố
router.get('/provinces', addressController.getProvinces);

// Route để lấy danh sách quận/huyện dựa trên tỉnh/thành phố
router.get('/districts/:provinceCode', addressController.getDistricts);

// Route để lấy danh sách phường/xã dựa trên quận/huyện
router.get('/wards/:districtCode', addressController.getWards);

module.exports = router;