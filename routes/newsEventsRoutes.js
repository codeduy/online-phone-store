const express = require('express');
const router = express.Router();
const newsEventController = require('../controllers/newsEventController');

// Get all active promotions
router.get('/promotions', newsEventController.getPromotions);

// Get all tech news
router.get('/tech', newsEventController.getTechNews);


module.exports = router;