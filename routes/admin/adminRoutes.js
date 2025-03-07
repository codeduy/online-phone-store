const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');
const { adminAuthMiddleware } = require('../../middleware/admin/adminAuthMiddleware');
const { verifyAdminToken } = require('../../middleware/admin/adminAuthMiddleware');


router.post('/login', adminController.login);

// Protected routes
router.get('/profile', adminAuthMiddleware, adminController.getProfile);
router.put('/profile', adminAuthMiddleware, adminController.updateProfile);
router.put('/change-password', adminAuthMiddleware, adminController.changePassword);
router.post('/logout', verifyAdminToken, adminController.logout);

module.exports = router;