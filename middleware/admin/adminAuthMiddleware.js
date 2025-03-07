const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');

const adminAuthMiddleware = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authorization.split(' ')[1];
        
        // Debug log
        console.log('Verifying token:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Debug log
        console.log('Decoded token:', decoded);

        const admin = await User.findOne({
            _id: decoded.userId,
            role: 'admin',
            status: 'active'
        });

        if (!admin) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        // Set user info in request
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        // Debug log
        console.log('Request user set:', req.user);

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

const verifyAdminToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để thực hiện thao tác này'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user exists and is an active admin
        const admin = await User.findOne({
            _id: decoded.userId,
            role: 'admin',
            status: 'active'
        });

        if (!admin) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện thao tác này'
            });
        }

        // Add admin info to request object
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            name: admin.name,
            email: admin.email
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Phiên đăng nhập đã hết hạn'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }
        console.error('Admin verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi xác thực người dùng'
        });
    }
};

module.exports = {
    adminAuthMiddleware,
    verifyAdminToken
};