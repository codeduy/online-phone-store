const mongoose = require('mongoose');
const Cart = require('./models/cartModel');
const CartItem = require('./models/cartItemModel');
const User = require('./models/userModel');
const { Product } = require('./models/productModel');
const Voucher = require('./models/voucherModel');
require('dotenv').config();

const generateCartData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/mobileshop');
        console.log('Connected to MongoDB...');

        // Fetch active users
        const users = await User.find({ status: 'active' });
        
        // Fetch products with stock > 0
        const products = await Product.find({ stock: { $gt: 0 } });
        
        // Fetch active vouchers
        const now = new Date();
        const vouchers = await Voucher.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        if (!users.length || !products.length) {
            throw new Error('No active users or available products found');
        }

        // Clear existing data
        await Cart.deleteMany({});
        await CartItem.deleteMany({});
        console.log('Cleared existing cart data...');

        // Generate carts for random users
        for (const user of users) {
            if (Math.random() < 0.5) continue;

            // Create cart
            const cart = await Cart.create({
                user_id: user._id,
                status: 'active',
                total_amount: 0,
                discount_amount: 0,
                final_amount: 0
            });

            // Generate 1-3 random items
            const numberOfItems = Math.floor(Math.random() * 3) + 1;
            let totalAmount = 0;

            for (let i = 0; i < numberOfItems; i++) {
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;

                if (randomProduct.stock >= quantity) {
                    // Create cart item with product name
                    const cartItem = await CartItem.create({
                        cart_id: cart._id,
                        product_id: randomProduct._id,
                        name: randomProduct.name, // Add product name
                        price: randomProduct.price,
                        quantity: quantity,
                        subtotal: randomProduct.price * quantity
                    });

                    totalAmount += cartItem.subtotal;
                }
            }

            // Apply voucher logic
            if (vouchers.length && totalAmount > 0) {
                const applicableVouchers = vouchers.filter(v => v.minOrderValue <= totalAmount);
                if (applicableVouchers.length && Math.random() < 0.3) {
                    const randomVoucher = applicableVouchers[Math.floor(Math.random() * applicableVouchers.length)];
                    let discountAmount = 0;

                    if (randomVoucher.discountType === 'FIXED') {
                        discountAmount = randomVoucher.discountValue;
                    } else {
                        discountAmount = Math.floor((totalAmount * randomVoucher.discountValue) / 100);
                    }

                    await Cart.findByIdAndUpdate(cart._id, {
                        total_amount: totalAmount,
                        applied_voucher: randomVoucher._id,
                        discount_amount: discountAmount,
                        final_amount: totalAmount - discountAmount,
                        last_modified: new Date()
                    });

                    console.log(`Applied voucher ${randomVoucher.code} to cart ${cart._id}`);
                } else {
                    await Cart.findByIdAndUpdate(cart._id, {
                        total_amount: totalAmount,
                        final_amount: totalAmount,
                        last_modified: new Date()
                    });
                }
            }

            console.log(`Created cart for user ${user.email} with ${numberOfItems} items`);
        }

        // Display summary
        console.log('\nGenerated Carts Summary:');
        const carts = await Cart.find()
            .populate('user_id', 'email')
            .populate('applied_voucher');

        for (const cart of carts) {
            const items = await CartItem.find({ cart_id: cart._id })
                .populate('product_id', 'name price ram storage');

            console.log(`\nCart ID: ${cart._id}`);
            console.log(`User: ${cart.user_id.email}`);
            console.log(`Status: ${cart.status}`);
            console.log(`Total Amount: ${cart.total_amount.toLocaleString('vi-VN')}đ`);
            
            if (cart.applied_voucher) {
                console.log(`Applied Voucher: ${cart.applied_voucher.code} (${
                    cart.applied_voucher.discountType === 'FIXED' 
                        ? cart.applied_voucher.discountValue.toLocaleString('vi-VN') + 'đ' 
                        : cart.applied_voucher.discountValue + '%'
                })`);
                console.log(`Discount Amount: ${cart.discount_amount.toLocaleString('vi-VN')}đ`);
            }
            
            console.log(`Final Amount: ${cart.final_amount.toLocaleString('vi-VN')}đ`);
            console.log('Items:');
            items.forEach(item => {
                const product = item.product_id;
                const isIphone = product.name.toLowerCase().includes('iphone');
                const displayName = isIphone
                    ? `${product.name} ${product.storage}GB`
                    : `${product.name} ${product.ram}GB/${product.storage}GB`;
                
                console.log(`- ${displayName} x${item.quantity} (${item.price.toLocaleString('vi-VN')}đ each)`);
            });
        }

    } catch (error) {
        console.error('Error generating cart data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed.');
    }
};

generateCartData();