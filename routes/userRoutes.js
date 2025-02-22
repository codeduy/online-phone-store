const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, handleLogout, auth } = require('../middleware/authMiddleware');
const userProfileController = require('../controllers/userProfileController');

router.post('/register', userController.createUser);
router.post('/login', userController.login);
router.post('/verify-token', verifyToken);
router.post('/logout', handleLogout);
router.post('/check-email', userController.checkEmail);
router.post('/verify-code', userController.verifyCode);
router.post('/reset-password', userController.resetPassword);
// router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.use('/uploads', express.static('public/uploads'));
router.get('/profile', auth, userController.getUserProfile);
router.get('/verify', auth, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/profile/:id', userProfileController.getProfile);
router.put('/profile/:id/:address', userProfileController.updateAddress);
router.put('/profile/:id', userProfileController.updateProfile);

module.exports = router;
