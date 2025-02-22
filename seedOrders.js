const mongoose = require('mongoose');
const Order = require('./models/orderModel');
const OrderItem = require('./models/orderItemModel');
const User = require('./models/userModel');
const UserProfile = require('./models/userProfileModel');
const { Product } = require('./models/productModel');

const generateOrderData = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/mobileshop');
        console.log('Connected to MongoDB');

        // Clear existing orders and order items
        await Order.deleteMany({});
        await OrderItem.deleteMany({});
        console.log('Cleared existing orders and order items');

        // Get users with their profiles
        const users = await User.find().lean();
        if (!users.length) throw new Error('No users found');

        const userProfiles = await UserProfile.find({
            user_id: { $in: users.map(u => u._id) }
        }).lean();
        const profileMap = new Map(userProfiles.map(profile => [profile.user_id.toString(), profile]));

        // Get products with variants
        const products = await Product.find().lean();
        if (!products.length) throw new Error('No products found');

        console.log(`Loaded ${users.length} users and ${products.length} products`);

        // Generate orders
        for (let i = 0; i < 20; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const userProfile = profileMap.get(user._id.toString());

            if (!userProfile) {
                console.log(`Skipping order for user ${user._id} - no profile found`);
                continue;
            }

            // Create order
            const order = new Order({
                user_id: user._id,
                user_profile: userProfile._id,
                order_date: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
                status: ['pending', 'paid', 'shipping', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)],
                items: [],
                total_amount: 0,
                shipping_fee: 30000,
                discount: 0,
                final_amount: 0,
                payment_method: Math.random() < 0.7 ? 'COD' : 'Banking',
                payment_status: 'pending',
                paid_amount: 0,
                link: `order-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                meta: `Order for ${user.name}`
            });

            // Generate 1-3 order items
            const numberOfItems = Math.floor(Math.random() * 3) + 1;
            let totalAmount = 0;

            for (let j = 0; j < numberOfItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                
                // Generate random color for the product
                const colors = ['Space Black', 'Silver', 'Gold', 'Deep Purple', 'Blue'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
                const orderItem = new OrderItem({
                    order_id: order._id,
                    product_id: product._id,
                    quantity: quantity,
                    price: product.price, // Use product price directly
                    color: randomColor,   // Use random color
                    link: `order-item-${Date.now()}-${j}-${Math.random().toString(36).substring(7)}`,
                    meta: `Item for order ${order._id}`
                });
            
                await orderItem.save();
                order.items.push(orderItem._id);
                totalAmount += product.price * quantity;
            }

            // Update order totals and dates
            order.total_amount = totalAmount;
            order.final_amount = totalAmount + order.shipping_fee - order.discount;

            // Set dates based on status
            if (order.status !== 'pending') {
                order.confirmed_at = new Date(order.order_date.getTime() + 24 * 60 * 60 * 1000);
                order.payment_status = 'paid';
                order.paid_amount = order.final_amount;
            }
            if (['shipping', 'delivered'].includes(order.status)) {
                order.shipped_at = new Date(order.order_date.getTime() + 2 * 24 * 60 * 60 * 1000);
            }
            if (order.status === 'delivered') {
                order.delivered_at = new Date(order.order_date.getTime() + 4 * 24 * 60 * 60 * 1000);
            }
            if (order.status === 'cancelled') {
                order.cancelled_at = new Date(order.order_date.getTime() + 12 * 60 * 60 * 1000);
            }

            await order.save();
            console.log(`Created order ${i + 1}/20 with ${numberOfItems} items for user ${user.name}`);
        }

        console.log('Seed completed successfully');
    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
};

generateOrderData();