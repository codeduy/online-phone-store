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

module.exports = adminAuthMiddleware;