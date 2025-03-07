const mongoose = require("mongoose");

// Schema for Users
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password_hash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'customer'],
        default: 'customer'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    favorite_products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserProfile'
    },  
    purchased_products: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        purchase_date: {
            type: Date,
            default: Date.now
        },
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    }],
}, { timestamps: true });

// Methods để quản lý sản phẩm yêu thích
userSchema.methods.addFavorite = async function(productId) {
    if (!this.favorite_products.includes(productId)) {
        this.favorite_products.push(productId);
        await this.save();
    }
};

userSchema.methods.removeFavorite = async function(productId) {
    this.favorite_products = this.favorite_products.filter(id => 
        id.toString() !== productId.toString()
    );
    await this.save();
};

userSchema.methods.isFavorite = function(productId) {
    return this.favorite_products.some(id => 
        id.toString() === productId.toString()
    );
};

userSchema.methods.addPurchasedProduct = async function(productId, orderId) {
    try {
        console.log('Adding purchased product:', { productId, orderId });
        
        // Check if product already exists in purchased_products
        const exists = this.purchased_products.some(item => 
            item.product_id.toString() === productId.toString()
        );

        if (!exists) {
            console.log('Product not found in purchased products, adding it');
            this.purchased_products.push({
                product_id: productId,
                purchase_date: new Date(),
                order_id: orderId
            });
            await this.save();
            console.log('Successfully added product to purchased products');
        } else {
            console.log('Product already exists in purchased products');
        }
    } catch (error) {
        console.error('Error adding purchased product:', error);
        throw error;
    }
};

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
