const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        index: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    color: {
        type: String,
        default: ''
    },
    link: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true }
});

// Add virtual for order
// orderItemSchema.virtual('order', {
//     ref: 'Order',
//     localField: 'order_id',
//     foreignField: '_id',
//     justOne: true
// });

// // Static method to find delivered order items for a product and user
// orderItemSchema.statics.findDeliveredOrderItems = async function(productId, userId) {
//     return this.find({
//         product_id: productId
//     }).populate({
//         path: 'order_id',
//         match: { 
//             user_id: userId,
//             status: 'delivered'
//         }
//     });
// };

// Static method to verify purchase
orderItemSchema.statics.verifyPurchase = async function(productId, userId) {
    try {
        // Find order items with the product and populate order details
        const orderItems = await this.find({ product_id: productId })
            .populate({
                path: 'order_id',
                select: 'user_id status',
                match: {
                    user_id: userId,
                    status: 'delivered'
                }
            });

        // Check if any order item has a valid delivered order
        return orderItems.some(item => item.order_id !== null);
    } catch (error) {
        console.error('Error in verifyPurchase:', error);
        return false;
    }
};

// Add indexes
orderItemSchema.index({ order_id: 1, product_id: 1 });

module.exports = mongoose.model("OrderItem", orderItemSchema);