const jwt = require('jsonwebtoken');

const verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ valid: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        return res.status(200).json({ valid: true, user: decoded });
    } catch (error) {
        return res.status(401).json({ valid: false });
    }
};

const handleLogout = (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { verifyToken, handleLogout };