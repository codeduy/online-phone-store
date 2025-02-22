const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/authMiddleware');

// Get user's cart
router.get('/', auth, cartController.getCart);

// Add item to cart
router.post('/add', auth, cartController.addToCart);

// Update cart item quantity
router.put('/item/:itemId', auth, cartController.updateCartItem);

// Remove item from cart
router.delete('/item/:itemId', auth, cartController.removeFromCart);

router.post('/apply-voucher', auth, cartController.applyVoucher);
router.delete('/remove-voucher', auth, cartController.removeVoucher);

module.exports = router;