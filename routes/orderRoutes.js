const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/authMiddleware');

// Define routes
router.get('/user/:userId', orderController.getUserOrders);
router.get('/detail/:orderId', orderController.getOrderDetail);
router.post('/create', auth, orderController.createOrder);

module.exports = router;