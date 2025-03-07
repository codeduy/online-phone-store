const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW']
    },
    module: {
        type: String,
        required: true,
        enum: ['AUTH', 'PRODUCTS', 'ORDERS', 'CUSTOMERS', 'COUPONS', 'NEWS']
    },
    details: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Add TTL index - documents will be automatically deleted after 30 days
logSchema.index({ timestamp: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days
});

module.exports = mongoose.model('Log', logSchema);