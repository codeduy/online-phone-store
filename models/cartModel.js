const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    total_amount: {
        type: Number,
        default: 0
    },
    discount_amount: {
        type: Number,
        default: 0
    },
    final_amount: {
        type: Number,
        default: 0
    },
    applied_voucher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voucher',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'abandoned'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Remove compound index and add single index on user_id
cartSchema.index({ user_id: 1 }, { unique: true });

cartSchema.pre('save', function(next) {
    // Ensure amounts are not negative
    this.total_amount = Math.max(0, this.total_amount);
    this.discount_amount = Math.max(0, this.discount_amount);
    this.final_amount = Math.max(0, this.final_amount);
    next();
});

module.exports = mongoose.model('Cart', cartSchema);