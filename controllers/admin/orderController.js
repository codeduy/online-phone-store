const Order = require('../../models/orderModel');
const OrderItem = require('../../models/orderItemModel');

exports.getOrders = async (req, res) => {
    try {
        // Fetch orders with populated items and user info
        const orders = await Order.find()
            .populate('user_id', 'username email')
            .populate({
                path: 'items',
                populate: {
                    path: 'product_id',
                    select: 'name images price'
                }
            })
            .sort({ createdAt: -1 });

        // Format response data
        const formattedOrders = orders.map(order => ({
            id: order._id,
            username: order.user_id.username,
            products: order.items.map(item => ({
                name: item.product_id.name,
                quantity: item.quantity,
                price: item.price,
                image: item.link,
                color: item.color
            })),
            totalAmount: order.final_amount,
            orderDate: order.createdAt,
            status: order.status,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            customerInfo: order.user_profile
        }));

        res.json({
            success: true,
            data: formattedOrders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await Order.findById(orderId)
            .populate('user_id', 'username email')
            .populate({
                path: 'items',
                populate: {
                    path: 'product_id',
                    select: 'name images price warranty'
                }
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const orderDetails = {
            id: order._id,
            status: order.status,
            orderDate: order.createdAt,
            products: order.items.map(item => ({
                image: item.link,
                name: item.product_id.name,
                warranty: item.product_id.warranty || '12 tháng',
                quantity: item.quantity,
                price: item.price,
                color: item.color
            })),
            paymentInfo: {
                totalAmount: order.total_amount,
                discount: order.discount,
                shippingFee: order.shipping_fee,
                amountToPay: order.final_amount,
                amountPaid: order.payment_status === 'paid' ? order.final_amount : 0,
                paymentMethod: order.payment_method,
                paymentStatus: order.payment_status
            },
            customerInfo: {
                fullName: order.user_profile.fullName,
                phoneNumber: order.user_profile.phone,
                address: order.user_profile.address
            }
        };

        res.json({
            success: true,
            data: orderDetails
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order details'
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'paid', 'shipping', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate('user_id', 'username email')
         .populate({
             path: 'items',
             populate: {
                 path: 'product_id',
                 select: 'name images price warranty'
             }
         });

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Format the response data to match getOrderDetails format
        const formattedOrder = {
            id: updatedOrder._id,
            status: updatedOrder.status,
            orderDate: updatedOrder.createdAt,
            products: updatedOrder.items.map(item => ({
                image: item.link,
                name: item.product_id.name,
                warranty: item.product_id.warranty || '12 tháng',
                quantity: item.quantity,
                price: item.price,
                color: item.color
            })),
            paymentInfo: {
                totalAmount: updatedOrder.total_amount,
                discount: updatedOrder.discount,
                shippingFee: updatedOrder.shipping_fee,
                amountToPay: updatedOrder.final_amount,
                amountPaid: updatedOrder.payment_status === 'paid' ? updatedOrder.final_amount : 0,
                paymentMethod: updatedOrder.payment_method,
                paymentStatus: updatedOrder.payment_status
            },
            customerInfo: {
                fullName: updatedOrder.user_profile.fullName,
                phoneNumber: updatedOrder.user_profile.phone,
                address: updatedOrder.user_profile.address
            }
        };

        res.json({
            success: true,
            data: formattedOrder
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
        });
    }
};

exports.filterOrdersByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Both startDate and endDate are required'
            });
        }

        // Convert string dates to Date objects and set hours
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const orders = await Order.find({
            createdAt: {
                $gte: start,
                $lte: end
            }
        })
        .populate('user_id', 'username email')
        .populate({
            path: 'items',
            populate: {
                path: 'product_id',
                select: 'name images price'
            }
        })
        .sort({ createdAt: -1 });

        // Format the response to match the expected structure
        const formattedOrders = orders.map(order => ({
            id: order._id,
            customerInfo: order.user_profile,
            products: order.items.map(item => ({
                name: item.product_id.name,
                quantity: item.quantity,
                price: item.price,
                image: item.product_id.images[0]
            })),
            totalAmount: order.final_amount,
            orderDate: order.createdAt,
            status: order.status,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status
        }));

        res.json({
            success: true,
            data: formattedOrders
        });
    } catch (error) {
        console.error('Error filtering orders by date:', error);
        res.status(500).json({
            success: false,
            message: 'Error filtering orders by date'
        });
    }
};