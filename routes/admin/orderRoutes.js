const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/orderController');
const adminAuthMiddleware = require('../../middleware/admin/adminAuthMiddleware');

router.get('/filter/date', adminAuthMiddleware, orderController.filterOrdersByDate);

// Get all orders
router.get('/', adminAuthMiddleware, orderController.getOrders);

// Get order details
router.get('/:id', adminAuthMiddleware, orderController.getOrderDetails);

// Update order status
router.put('/:orderId/status', adminAuthMiddleware, orderController.updateOrderStatus);



module.exports = router;