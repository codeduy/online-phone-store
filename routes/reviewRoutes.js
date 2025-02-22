const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/authMiddleware');
const checkPurchaseStatus = require('../middleware/purchaseCheckMiddleware');
const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');

// Public routes 
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/product/:productId/stats', reviewController.getReviewStats);

router.use(auth);

// Routes cho người dùng đã xác thực
router.get('/user/reviews', reviewController.getUserReviews);

// Thêm review mới (cần kiểm tra đã mua hàng)
router.post('/product/:productId', 
    checkPurchaseStatus,  // Kiểm tra đã mua hàng
    reviewController.addReview
);

// Reply review
router.post('/product/:productId/reply/:reviewId', 
    async (req, res, next) => {
        try {
            const reviewId = req.params.reviewId;
            const userId = req.user.id; 

            const review = await Review.findById(reviewId);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đánh giá'
                });
            }

            // Kiểm tra đã mua hàng hoặc là người tạo review
            const hasPurchased = await Order.exists({
                user_id: userId,
                'items.product_id': review.product_id,
                status: 'delivered'
            });

            if (!hasPurchased && review.user_id.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn cần mua sản phẩm này để có thể trả lời đánh giá'
                });
            }

            // Thêm thông tin review vào request để controller sử dụng
            req.review = review;
            next();
        } catch (error) {
            next(error);
        }
    },
    reviewController.addReply
);

// Xóa review (admin hoặc người tạo)
router.delete('/:reviewId', 
    async (req, res, next) => {
        try {
            const user = req.user; // Từ auth middleware
            const review = await Review.findById(req.params.reviewId);
            
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đánh giá'
                });
            }

            // Kiểm tra quyền xóa
            if (user.role !== 'admin' && review.user_id.toString() !== user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền xóa đánh giá này'
                });
            }
            
            req.review = review;
            next();
        } catch (error) {
            next(error);
        }
    },
    reviewController.deleteReview
);

module.exports = router;