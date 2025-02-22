const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');

// Define controller functions
const getUserOrders = async (req, res) => {
    try {
        console.log('Fetching orders for user:', req.params.userId);

        // Find orders with populated items
        const orders = await Order.find({ 
            user_id: req.params.userId 
        })
        .populate({
            path: 'items',
            model: 'OrderItem',
            populate: {
                path: 'product_id',
                model: 'Product',
                select: 'name images ram storage trademark baseProductName price'
            }
        })
        .sort({ createdAt: -1 });

        if (!orders) {
            return res.json({
                success: true,
                data: []
            });
        }

        const formattedOrders = orders.map(order => {
            const formattedItems = order.items.map(item => {
                return {
                    id: item._id,
                    name: item.product_id?.name || '',
                    price: item.price,
                    quantity: item.quantity,
                    image: item.product_id?.images?.[0] || '',
                    color: item.color || 'default',
                    product_id: {
                        ram: item.product_id?.ram || '',
                        storage: item.product_id?.storage || '',
                        trademark: item.product_id?.trademark || '',
                        baseProductName: item.product_id?.baseProductName || ''
                    }
                };
            });

            return {
                id: order._id,
                date: order.createdAt || order.order_date,
                total: order.total_amount,
                final_amount: order.final_amount,
                discount: order.discount,
                shipping_fee: order.shipping_fee,
                status: order.status,
                payment_method: order.payment_method,
                payment_status: order.payment_status,
                user_profile: {
                    fullName: order.user_profile?.fullName || '',
                    phone: order.user_profile?.phone || '',
                    address: order.user_profile?.address || ''
                },
                items: formattedItems
            };
        });

        console.log('Sending formatted orders:', JSON.stringify(formattedOrders, null, 2));

        return res.json({
            success: true,
            data: formattedOrders
        });

    } catch (error) {
        console.error('Get user orders error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

const getOrderDetail = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId)
            .populate({
                path: 'items',
                populate: {
                    path: 'product_id',
                    select: 'name images price warranty ram storage trademark baseProductName'
                }
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Format the response data
        const formattedOrder = {
            id: order._id,
            status: order.status,
            createdAt: order.createdAt,
            order_date: order.createdAt,
            items: order.items.map(item => ({
                _id: item._id,
                product_id: {
                    name: item.product_id.name,
                    images: item.product_id.images,
                    price: item.product_id.price,
                    warranty: item.product_id.warranty,
                    ram: item.product_id.ram,
                    storage: item.product_id.storage,
                    trademark: item.product_id.trademark,
                    baseProductName: item.product_id.baseProductName
                },
                quantity: item.quantity,
                price: item.price,
                color: ''
            })),
            total_amount: order.total_amount,
            shipping_fee: order.shipping_fee,
            discount: order.discount,
            final_amount: order.final_amount,
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            paid_amount: order.paid_amount,
            user_profile: {
                fullName: order.user_profile?.fullName || '',
                phone: order.user_profile?.phone || '',
                address: order.user_profile?.address || ''
            }
        };

        console.log('Sending formatted order:', JSON.stringify(formattedOrder, null, 2));

        return res.json({
            success: true,
            data: formattedOrder
        });

    } catch (error) {
        console.error('Get order detail error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết đơn hàng',
            error: error.message
        });
    }
};

const createOrder = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const orderData = req.body;

        console.log('Creating order with data:', { userId, orderData });

        // Validate required data
        if (!userId || !orderData.shipping_info || !orderData.items || orderData.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required order data'
            });
        }

        // Create order first without items
        const order = new Order({
            user_id: userId,
            total_amount: orderData.total_amount,
            shipping_fee: orderData.shipping_fee || 0,
            discount: orderData.discount || 0,
            final_amount: orderData.final_amount,
            payment_method: orderData.payment_method,
            payment_status: 'pending',
            status: 'pending',
            user_profile: {
                fullName: orderData.shipping_info.fullName,
                phone: orderData.shipping_info.phone,
                address: orderData.shipping_info.address
            }
        });

        // Save order to get _id
        await order.save();

        console.log('Order created:', order);

        // Create OrderItems
        const orderItemsToCreate = orderData.items.map(item => ({
            order_id: order._id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            color: item.color || 'default',
            link: item.link || ''
        }));

        console.log('Creating order items:', orderItemsToCreate);

        // Create all order items
        const createdOrderItems = await OrderItem.insertMany(orderItemsToCreate);

        console.log('Created order items:', createdOrderItems);

        // Update order with item references
        order.items = createdOrderItems.map(item => item._id);
        await order.save();

        console.log('Updated order with items:', order);

        // Clear user's cart
        // Add any cart clearing logic here if needed

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                id: order._id,
                status: order.status
            }
        });

    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error creating order'
        });
    }
};

// Export as a module
module.exports = {
    getUserOrders,
    getOrderDetail,
    createOrder,
};