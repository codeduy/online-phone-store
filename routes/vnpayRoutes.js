const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpayController');
const { auth } = require('../middleware/authMiddleware');

router.post('/create_payment_url', auth, vnpayController.createPaymentUrl);

router.get('/payment/return', vnpayController.vnpayReturn);
router.get('/payment/ipn', vnpayController.vnpayIPN);
// router.post('/verify-payment', vnpayController.verifyPayment);

module.exports = router;