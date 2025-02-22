const express = require('express');
const router = express.Router();
const { toggleFavorite, getFavorites } = require('../controllers/favoriteController');
const { auth } = require('../middleware/authMiddleware');

router.post('/toggle', auth, toggleFavorite);
router.get('/:userId', auth, getFavorites);

module.exports = router;