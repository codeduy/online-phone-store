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

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
