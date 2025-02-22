const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
    cart_id: {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
        required: [true, 'Cart ID is required']
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    name: {
        type: String,
        required: [true, 'Product name is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    subtotal: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate subtotal
cartItemSchema.pre('save', function(next) {
    this.subtotal = this.price * this.quantity;
    next();
});

// Pre-save middleware to populate product name if not provided
cartItemSchema.pre('save', async function(next) {
    if (!this.name && this.product_id) {
        try {
            const Product = mongoose.model('Product');
            const product = await Product.findById(this.product_id);
            if (product) {
                this.name = product.name;
            }
        } catch (error) {
            next(error);
        }
    }
    next();
});

cartItemSchema.pre('save', async function(next) {
    if (this.isModified('quantity')) {
        try {
            const Product = mongoose.model('Product');
            const product = await Product.findById(this.product_id);
            
            if (!product) {
                throw new Error('Sản phẩm không tồn tại');
            }

            if (this.quantity > product.stock) {
                throw new Error(`Số lượng vượt quá hàng tồn kho (còn ${product.stock} sản phẩm)`);
            }
        } catch (error) {
            next(error);
        }
    }
    next();
});

// Index for faster queries
cartItemSchema.index({ cart_id: 1, product_id: 1 });

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;