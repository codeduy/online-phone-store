const express = require('express');
const router = express.Router();
const comparisonController = require('../controllers/comparisonController');

router.get('/', comparisonController.compareProducts);

module.exports = router;