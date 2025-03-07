const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/customerController');
const { adminAuthMiddleware } = require('../../middleware/admin/adminAuthMiddleware');

router.get('/', adminAuthMiddleware, userController.getAllCustomers);
router.put('/:id', adminAuthMiddleware, userController.updateCustomer);
router.get('/search', adminAuthMiddleware, userController.searchCustomers);

module.exports = router;