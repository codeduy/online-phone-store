const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

// Validate voucher
router.get('/validate/:code', voucherController.validateVoucher);

// Get all active vouchers
router.get('/', voucherController.getAllVouchers);

module.exports = router;