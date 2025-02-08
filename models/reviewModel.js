const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5 
    },
    comment: { 
        type: String, 
        required: true,
        trim: true 
    },
    images: [{ 
        type: String  // URLs của ảnh đánh giá
    }],
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    is_verified_purchase: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index để tối ưu query
reviewSchema.index({ product_id: 1, created_at: -1 });
reviewSchema.index({ user_id: 1, created_at: -1 });

const Review = mongoose.model('Review', reviewSchema, 'reviews');

module.exports = Review;