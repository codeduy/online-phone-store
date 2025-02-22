const Review = require('../models/reviewModel');
const Product = require('../models/productModel');

const reviewController = {
    // Get reviews for a product
    getProductReviews: async (req, res) => {
        try {
            const { productId } = req.params;
            
            // Get reviews
            const reviews = await Review.find({ product_id: productId })
                .populate('user_id', 'name')
                .sort({ createdAt: -1 })
                .limit(2);

            // Calculate stats
            const allReviews = await Review.find({ product_id: productId });
            const stats = {
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
                total: allReviews.length,
                average: 0
            };

            // Count ratings
            allReviews.forEach(review => {
                stats[review.rating] = (stats[review.rating] || 0) + 1;
            });

            // Calculate average
            const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
            stats.average = stats.total > 0 ? totalRating / stats.total : 0;

            res.json({
                success: true,
                data: {
                    reviews,
                    stats
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get review statistics
    getReviewStats: async (req, res) => {
        try {
            const { productId } = req.params;
            const stats = await Review.aggregate([
                { $match: { product_id: productId } },
                {
                    $group: {
                        _id: '$rating',
                        count: { $sum: 1 }
                    }
                }
            ]);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get user's reviews
    getUserReviews: async (req, res) => {
        try {
            const userId = req.user.id;
            const reviews = await Review.find({ user_id: userId })
                .populate('product_id', 'name')
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                data: reviews
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Add new review
    addReview: async (req, res) => {
        try {
            const { productId } = req.params;
            const userId = req.user.id;
            const { rating, comment, images } = req.body;

            const review = await Review.create({
                product_id: productId,
                user_id: userId,
                rating,
                comment,
                images,
                is_verified_purchase: true
            });

            res.json({
                success: true,
                data: review
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Add reply to review
    addReply: async (req, res) => {
        try {
            const { reviewId } = req.params;
            const { comment } = req.body;

            const review = req.review; // From middleware
            const reply = await Review.create({
                product_id: review.product_id,
                user_id: req.user.id,
                comment,
                parent_id: reviewId,
                is_verified_purchase: true
            });

            res.json({
                success: true,
                data: reply
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Delete review
    deleteReview: async (req, res) => {
        try {
            const review = req.review; // From middleware
            await review.remove();

            res.json({
                success: true,
                message: 'Đã xóa đánh giá thành công'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = reviewController;