const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem'
    }],
    total_amount: {
        type: Number,
        required: true
    },
    shipping_fee: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    final_amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'shipping', 'completed', 'cancelled'],
        default: 'pending'
    },
    payment_method: {
        type: String,
        enum: ['cod', 'bank', 'pending'],
        default: 'pending'
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    user_profile: {
        fullName: String,
        phone: String,
        address: String
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Order', orderSchema);