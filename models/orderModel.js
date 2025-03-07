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
        enum: ['pending', 'paid', 'shipping', 'delivered', 'cancelled'],
        default: 'pending'
    },
    payment_method: {
        type: String,
        enum: ['cod', 'vnpay', 'pending'],
        default: 'pending'
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    vnpay_transaction_no: String,
    paid_amount: {
        type: Number,
        default: 0
    },
    cancelled_at: {
        type: Date,
        default: null
    },
    user_profile: {
        fullName: String,
        phone: String,
        address: String
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

orderSchema.pre('save', async function(next) {
    try {
        // Only proceed if status is being modified to 'delivered'
        if (this.isModified('status') && this.status === 'delivered') {
            console.log('Order status changed to delivered, updating user purchased products');
            
            const User = mongoose.model('User');
            const OrderItem = mongoose.model('OrderItem');

            // Find the user
            const user = await User.findById(this.user_id);
            if (!user) {
                console.error('User not found:', this.user_id);
                throw new Error('User not found');
            }

            // Get all items from this order with product details
            const orderItems = await OrderItem.find({ 
                order_id: this._id 
            }).populate('product_id');

            console.log('Found order items:', orderItems);

            // Add each product to user's purchased products
            for (const item of orderItems) {
                if (!item.product_id) {
                    console.warn('Product not found for item:', item);
                    continue;
                }

                console.log('Adding product to user purchased products:', {
                    userId: user._id,
                    productId: item.product_id._id,
                    orderId: this._id
                });

                await user.addPurchasedProduct(item.product_id._id, this._id);
            }

            console.log('Successfully updated user purchased products');
        }
        next();
    } catch (error) {
        console.error('Error in order pre-save middleware:', error);
        next(error);
    }
});

// Add this function to orderSchema methods
orderSchema.methods.markAsDelivered = async function() {
    this.status = 'delivered';
    await this.save();
};

module.exports = mongoose.model('Order', orderSchema);