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
    replies: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        comment: {
            type: String,
            required: true
        },
        created_at: {
            type: Date,
            default: Date.now
        }
    }],
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

reviewSchema.post('save', async function() {
    if (this.parent_id === null) { // Only update for parent reviews
        const Product = mongoose.model('Product');
        await Product.calculateAverageRating(this.product_id);
    }
});

reviewSchema.post(['updateOne', 'deleteOne'], async function() {
    const review = await this.findOne();
    if (review && review.parent_id === null) {
        const Product = mongoose.model('Product');
        await Product.calculateAverageRating(review.product_id);
    }
});

const Review = mongoose.model('Review', reviewSchema, 'reviews');

module.exports = Review;