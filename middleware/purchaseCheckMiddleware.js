const Order = require('../models/orderModel');

const checkPurchaseStatus = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        const hasPurchased = await Order.exists({
            user_id: userId,
            'items.product_id': productId,
            status: 'delivered'
        });

        if (!hasPurchased) {
            return res.status(403).json({
                success: false,
                message: 'Bạn cần mua sản phẩm này trước khi đánh giá'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = checkPurchaseStatus;