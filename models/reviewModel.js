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
        type: String
    }],
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        default: null
    },
    is_verified_purchase: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    }
}, {
    timestamps: true
});

// Thêm index cho các trường thường query
reviewSchema.index({ product_id: 1, status: 1 });
reviewSchema.index({ user_id: 1 });
reviewSchema.index({ parent_id: 1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;