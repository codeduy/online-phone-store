const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const mongoose = require('mongoose');

const reviewController = {
    // Check if user can review
    canUserReview: async (req, res) => {
        try {
            const { productId } = req.params;
            const userId = req.user.id;

            console.log('Checking review permission:', { productId, userId });

            // Check if user has already reviewed
            const existingReview = await Review.findOne({
                product_id: productId,
                user_id: userId,
                parent_id: null
            });

            if (existingReview) {
                return res.json({
                    success: true,
                    canReview: false,
                    message: 'Bạn đã đánh giá sản phẩm này'
                });
            }

            // Verify purchase
            const hasPurchased = await OrderItem.verifyPurchase(productId, userId);

            return res.json({
                success: true,
                canReview: hasPurchased,
                message: hasPurchased ? 
                    'Bạn có thể đánh giá sản phẩm này' : 
                    'Bạn cần mua sản phẩm để đánh giá'
            });

        } catch (error) {
            console.error('Error checking review permission:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    

    // Get reviews with pagination and stats
    getProductReviews: async (req, res) => {
        try {
            const { productId } = req.params;
            const { page = 1, limit = 10, sort = 'newest' } = req.query;
            
            console.log('Getting reviews for product:', { productId, page, limit, sort });
            
            const productObjectId = new mongoose.Types.ObjectId(productId);
            
            // Build sort options
            let sortOption = {};
            switch (sort) {
                case 'newest':
                    sortOption = { createdAt: -1 };
                    break;
                case 'oldest':
                    sortOption = { createdAt: 1 };
                    break;
                case 'highest':
                    sortOption = { rating: -1 };
                    break;
                case 'lowest':
                    sortOption = { rating: 1 };
                    break;
                default:
                    sortOption = { createdAt: -1 };
            }

            // Get paginated reviews
            const reviews = await Review.find({ 
                product_id: productObjectId,
                parent_id: null,
                status: 'approved'
            })
            .populate('user_id', 'name')
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

            // Get total count
            const totalReviews = await Review.countDocuments({
                product_id: productObjectId,
                parent_id: null,
                status: 'approved'
            });

            // Calculate stats
            const stats = await Review.aggregate([
                { 
                    $match: { 
                        product_id: productObjectId,
                        parent_id: null,
                        status: 'approved'
                    } 
                },
                {
                    $group: {
                        _id: null,
                        average: { $avg: '$rating' },
                        total: { $sum: 1 },
                        five: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                        four: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                        three: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                        two: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                        one: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                    }
                }
            ]);

            res.json({
                success: true,
                data: {
                    reviews,
                    stats: stats[0] || {
                        average: 0,
                        total: 0,
                        five: 0,
                        four: 0,
                        three: 0,
                        two: 0,
                        one: 0
                    },
                    pagination: {
                        currentPage: Number(page),
                        totalPages: Math.ceil(totalReviews / limit),
                        totalReviews,
                        limit: Number(limit)
                    }
                }
            });

        } catch (error) {
            console.error('Error getting product reviews:', error);
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
            const { rating, comment } = req.body;

            // Check existing review first
            const existingReview = await Review.findOne({
                product_id: productId,
                user_id: userId,
                parent_id: null
            });

            if (existingReview) {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn đã đánh giá sản phẩm này'
                });
            }

            // Verify purchase
            const hasPurchased = await OrderItem.verifyPurchase(productId, userId);
            if (!hasPurchased) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn cần mua sản phẩm trước khi đánh giá'
                });
            }

            // Handle uploaded files
            const images = req.files ? req.files.map(file => `/uploads/reviews/${file.filename}`) : [];

            // Create review
            const review = await Review.create({
                product_id: productId,
                user_id: userId,
                rating,
                comment,
                images,
                is_verified_purchase: true,
                status: 'approved'
            });

            // Return populated review
            const populatedReview = await Review.findById(review._id)
                .populate('user_id', 'name');

            return res.json({
                success: true,
                data: populatedReview
            });

        } catch (error) {
            console.error('Add review error:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    deleteReview: async (req, res) => {
        try {
            const { reviewId, productId } = req.params;
            const userId = req.user.id;
    
            // Kiểm tra review tồn tại và thuộc về user
            const review = await Review.findOne({
                _id: reviewId,
                product_id: productId,
                user_id: userId
            });
    
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa'
                });
            }
    
            // Xóa review
            await Review.findByIdAndDelete(reviewId);
    
            return res.json({
                success: true,
                message: 'Đã xóa đánh giá thành công'
            });
    
        } catch (error) {
            console.error('Delete review error:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
};

module.exports = reviewController;