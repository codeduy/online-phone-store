const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/authMiddleware');

// Define routes
router.get('/user/:userId', auth, orderController.getUserOrders);
router.get('/detail/:orderId', auth, orderController.getOrderDetail);
router.post('/create', auth, orderController.createOrder);
router.put('/:orderId/status', auth, orderController.updateOrderStatus);

module.exports = router;