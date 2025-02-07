const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, handleLogout } = require('../middleware/authMiddleware');

router.post('/register', userController.createUser);
router.post('/login', userController.login);
router.post('/verify-token', verifyToken);
router.post('/logout', handleLogout);
router.post('/check-email', userController.checkEmail);
router.post('/verify-code', userController.verifyCode);
router.post('/reset-password', userController.resetPassword);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.use('/uploads', express.static('public/uploads'));

module.exports = router;
