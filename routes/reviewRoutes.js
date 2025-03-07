const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');

router.get('/product/:productId/can-review', auth, reviewController.canUserReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.post('/product/:productId', auth, upload.array('images', 3), handleUploadError, reviewController.addReview);

router.delete('/product/:productId/review/:reviewId', auth, reviewController.deleteReview);

module.exports = router;