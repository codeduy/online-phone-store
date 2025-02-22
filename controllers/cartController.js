const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const mongoose = require('mongoose');
const Voucher = require('../models/voucherModel');
const { Product } = require('../models/productModel');

const cartController = {
    // Get cart and items for a user
    getCart: async (req, res) => {
        try {
            console.log('Request user:', req.user);
            const userId = req.user.userId;
            console.log('UserId:', userId);

            // Find active cart
            let cart = await Cart.findOne({ 
                user_id: new mongoose.Types.ObjectId(userId), 
                status: 'active' 
            }).populate('applied_voucher');
            
            console.log('Found cart:', cart);

            // Create new cart if none exists
            if (!cart) {
                cart = new Cart({
                    user_id: new mongoose.Types.ObjectId(userId),
                    status: 'active',
                    total_amount: 0,
                    discount_amount: 0,
                    final_amount: 0
                });
                await cart.save();
                console.log('Created new cart:', cart);
            }

            // Get cart items with product details
            const cartItems = await CartItem.find({ 
                cart_id: cart._id 
            }).populate({
                path: 'product_id', // Added price field
            });

            console.log('Cart items found:', cartItems);

            // Calculate totals safely
            const total = cartItems && cartItems.length > 0
                ? cartItems.reduce((sum, item) => {
                    const price = item?.price || 0;
                    const quantity = item?.quantity || 0;
                    return sum + (price * quantity);
                }, 0)
                : 0;

            // Update cart totals
            cart.total_amount = total;
            cart.final_amount = total - (cart.discount_amount || 0);
            await cart.save();

            return res.json({
                success: true,
                data: {
                    cart,
                    items: cartItems || []
                }
            });

        } catch (error) {
            console.error('Cart fetch error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Internal server error',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },

    // Add item to cart
    addToCart: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { productId, quantity, formattedName } = req.body;
    
            console.log('Adding to cart:', { productId, quantity, userId, formattedName });
    
            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: 'ProductId is required'
                });
            }
    
            // Validate product existence first
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Sản phẩm không tồn tại'
                });
            }
    
            // Find or create active cart
            let cart = await Cart.findOne({ 
                user_id: new mongoose.Types.ObjectId(userId), 
                status: 'active' 
            }).populate('applied_voucher');
    
            if (!cart) {
                cart = await Cart.create({
                    user_id: new mongoose.Types.ObjectId(userId),
                    status: 'active',
                    total_amount: 0,
                    discount_amount: 0,
                    final_amount: 0
                });
            }
    
            // Check if item exists in cart
            let cartItem = await CartItem.findOne({
                cart_id: cart._id,
                product_id: new mongoose.Types.ObjectId(productId)
            });
    
            if (cartItem) {
                // Update existing item
                cartItem.quantity += quantity;
                cartItem.subtotal = product.price * cartItem.quantity;
                await cartItem.save();
            } else {
                // Create new cart item
                cartItem = await CartItem.create({
                    cart_id: cart._id,
                    product_id: productId,
                    name: formattedName || product.name,
                    price: product.price,
                    quantity: quantity,
                    subtotal: product.price * quantity
                });
            }
    
            // Recalculate cart totals
            const cartItems = await CartItem.find({ cart_id: cart._id });
            const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    
            // Update cart with new totals
            cart.total_amount = total;
    
            // If there's an applied voucher, recalculate discount
            if (cart.applied_voucher) {
                const voucher = await Voucher.findById(cart.applied_voucher);
                if (voucher) {
                    let discountAmount = 0;
                    if (voucher.discountType === 'FIXED') {
                        discountAmount = voucher.discountValue;
                    } else if (voucher.discountType === 'PERCENTAGE') {
                        discountAmount = (total * voucher.discountValue) / 100;
                    }
                    cart.discount_amount = discountAmount;
                }
            }
    
            // Calculate final amount
            cart.final_amount = Math.max(0, cart.total_amount - (cart.discount_amount || 0));
            await cart.save();
    
            // Fetch updated cart data
            const updatedCart = await Cart.findById(cart._id).populate('applied_voucher');
            const updatedCartItems = await CartItem.find({ cart_id: cart._id }).populate('product_id');
    
            return res.json({
                success: true,
                message: 'Đã thêm sản phẩm vào giỏ hàng',
                data: {
                    cart: updatedCart,
                    items: updatedCartItems
                }
            });
    
        } catch (error) {
            console.error('Add to cart error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi thêm vào giỏ hàng'
            });
        }
    },

    // Update cart item quantity
    updateCartItem: async (req, res) => {
        try {
            const { itemId } = req.params;
            const { quantity } = req.body;
    
            if (quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Số lượng phải lớn hơn 0'
                });
            }
    
            const cartItem = await CartItem.findById(itemId);
            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm trong giỏ hàng'
                });
            }
    
            // Update quantity and recalculate subtotal
            cartItem.quantity = quantity;
            cartItem.subtotal = cartItem.price * quantity;
            await cartItem.save();
    
            // Update cart totals
            const cart = await Cart.findById(cartItem.cart_id).populate('applied_voucher');
            const cartItems = await CartItem.find({ cart_id: cart._id });
            
            // Calculate new total
            const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
            cart.total_amount = total;
    
            // Recalculate discount if voucher exists
            if (cart.applied_voucher) {
                const voucher = await Voucher.findById(cart.applied_voucher);
                if (voucher) {
                    let discountAmount = 0;
                    if (voucher.discountType === 'FIXED') {
                        discountAmount = voucher.discountValue;
                    } else if (voucher.discountType === 'PERCENTAGE') {
                        discountAmount = (total * voucher.discountValue) / 100;
                    }
                    cart.discount_amount = discountAmount;
                }
            }
    
            // Calculate final amount and ensure it's not negative
            cart.final_amount = Math.max(0, cart.total_amount - (cart.discount_amount || 0));
            await cart.save();
    
            // Return updated cart data
            const updatedCart = await Cart.findById(cart._id)
                .populate('applied_voucher');
            const updatedItems = await CartItem.find({ cart_id: cart._id })
                .populate('product_id');
    
            res.json({
                success: true,
                message: 'Đã cập nhật số lượng',
                data: {
                    cart: updatedCart,
                    items: updatedItems
                }
            });
        } catch (error) {
            console.error('Update cart item error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi cập nhật số lượng'
            });
        }
    },

    // Remove item from cart
    removeFromCart: async (req, res) => {
        try {
            const { itemId } = req.params;
    
            const cartItem = await CartItem.findById(itemId);
            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm trong giỏ hàng'
                });
            }
    
            const cartId = cartItem.cart_id;
    
            // Delete the cart item
            await CartItem.findByIdAndDelete(itemId);
    
            // Check remaining items in cart
            const remainingItems = await CartItem.find({ cart_id: cartId });
    
            if (remainingItems.length === 0) {
                // If no items left, delete the cart
                await Cart.findByIdAndDelete(cartId);
                return res.json({
                    success: true,
                    message: 'Đã xóa sản phẩm và giỏ hàng trống',
                    cartDeleted: true
                });
            } else {
                // Update cart totals if items remain
                const cart = await Cart.findById(cartId).populate('applied_voucher');
                if (!cart) {
                    return res.status(404).json({
                        success: false,
                        message: 'Không tìm thấy giỏ hàng'
                    });
                }
    
                // Calculate new total
                const total = remainingItems.reduce((sum, item) => sum + item.subtotal, 0);
                cart.total_amount = total;
    
                // Recalculate discount if voucher exists
                if (cart.applied_voucher) {
                    const voucher = await Voucher.findById(cart.applied_voucher);
                    if (voucher) {
                        let discountAmount = 0;
                        if (voucher.discountType === 'FIXED') {
                            discountAmount = voucher.discountValue;
                        } else if (voucher.discountType === 'PERCENTAGE') {
                            discountAmount = (total * voucher.discountValue) / 100;
                        }
                        
                        // Ensure final_amount is not negative
                        if (total < discountAmount) {
                            cart.discount_amount = 0;
                            cart.applied_voucher = null;
                            cart.final_amount = total;
                        } else {
                            cart.discount_amount = discountAmount;
                            cart.final_amount = total - discountAmount;
                        }
                    }
                } else {
                    cart.final_amount = total;
                }
    
                await cart.save();
    
                // Fetch updated cart data with populated items
                const updatedCart = await Cart.findById(cartId)
                    .populate('applied_voucher');
                const updatedItems = await CartItem.find({ cart_id: cartId })
                    .populate('product_id');
    
                return res.json({
                    success: true,
                    message: 'Đã xóa sản phẩm khỏi giỏ hàng',
                    cartDeleted: false,
                    data: {
                        cart: updatedCart,
                        items: updatedItems
                    }
                });
            }
        } catch (error) {
            console.error('Remove from cart error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi xóa sản phẩm'
            });
        }
    },

    applyVoucher: async (req, res) => {
        try {
            const { code } = req.body;
            const userId = req.user.userId;
    
            // Debug log
            console.log('Applying voucher:', code);
    
            const cart = await Cart.findOne({ 
                user_id: new mongoose.Types.ObjectId(userId), 
                status: 'active' 
            });
    
            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy giỏ hàng'
                });
            }
    
            // Find voucher and log it
            const voucher = await Voucher.findOne({
                code: code.toUpperCase(),
                isActive: true,
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            });
    
            console.log('Found voucher:', voucher);
    
            if (!voucher) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn'
                });
            }
    
            // Check minimum order value
            if (cart.total_amount < voucher.minOrderValue) {
                return res.status(400).json({
                    success: false,
                    message: `Giá trị đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này`
                });
            }
    
            // Calculate discount
            let discountAmount = 0;
            if (voucher.discountType === 'FIXED') {
                discountAmount = voucher.discountValue;
            } else if (voucher.discountType === 'PERCENTAGE') {
                discountAmount = (cart.total_amount * voucher.discountValue) / 100;
            }
    
            // Update cart with voucher
            cart.applied_voucher = voucher._id;
            cart.discount_amount = discountAmount;
            cart.final_amount = cart.total_amount - discountAmount;
            await cart.save();
    
            return res.json({
                success: true,
                message: 'Áp dụng mã giảm giá thành công',
                data: {
                    cart,
                    voucher
                }
            });
    
        } catch (error) {
            console.error('Error applying voucher:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi áp dụng mã giảm giá'
            });
        }
    },

    removeVoucher: async (req, res) => {
        try {
            const userId = req.user.userId;

            // Find active cart
            const cart = await Cart.findOne({ 
                user_id: userId, 
                status: 'active' 
            });

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy giỏ hàng'
                });
            }

            // Remove voucher from cart
            cart.applied_voucher = null;
            cart.discount_amount = 0;
            cart.final_amount = cart.total_amount;
            await cart.save();

            res.json({
                success: true,
                message: 'Đã hủy mã giảm giá',
                data: cart
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi hủy mã giảm giá'
            });
        }
    },

    
};

module.exports = cartController;