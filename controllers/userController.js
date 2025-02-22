const User = require('../models/userModel');
const UserProfile = require('../models/userProfileModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: './public/uploads/profile',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
}).single('profileImage');

// Store verification codes temporarily (should use Redis in production)
const verificationCodes = new Map();

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Check if email exists
const checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'Email không tồn tại trên hệ thống!' });
        }

        // Generate verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        verificationCodes.set(email, {
            code: verificationCode,
            timestamp: Date.now()
        });

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Verification Code',
            text: `Your verification code is: ${verificationCode}`,
            html: `
                <h2>Password Reset Request</h2>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>This code will expire in 5 minutes.</p>
            `
        });

        res.json({ message: 'Mã xác thực đã được gửi!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify code
const verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const storedData = verificationCodes.get(email);

        if (!storedData) {
            return res.status(400).json({ message: 'Không tìm thấy mã xác thực!' });
        }

        if (Date.now() - storedData.timestamp > 300000) { // 5 minutes expiration
            verificationCodes.delete(email);
            return res.status(400).json({ message: 'Mã xác thực đã hết hạn!' });
        }

        if (storedData.code !== code) {
            return res.status(400).json({ message: 'Mã xác thực không hợp lệ!' });
        }

        // Generate temporary token for password reset
        const resetToken = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ resetToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        
        // Verify reset token
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password_hash = hashedPassword;
        await user.save();

        // Clear verification code
        verificationCodes.delete(decoded.email);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;        
        // Find user by username
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Check user status
        if (user.status === 'inactive') {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị vô hiệu hóa'
            });
        }
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Get user profile data
        const userProfile = await UserProfile.findOne({ user_id: user._id });
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response
        res.json({
            success: true,
            token: token, // Use the generated token here
            user: {
                _id: user._id,
                username: user.name,
                email: user.email,
                role: user.role,
                profile: {
                    fullName: userProfile.full_name,
                    address: userProfile.address,
                    phone: userProfile.phone_number,
                    position: user.role
                }
            },
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Find user and their profile
        const user = await User.findById(userId);
        const userProfile = await UserProfile.findOne({ user_id: userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                username: user.name,
                email: user.email,
                role: user.role,
                profile: {
                    fullName: userProfile?.full_name || '',
                    address: userProfile?.address || '',
                    phone: userProfile?.phone_number || '',
                    position: user.role,
                    imageUrl: userProfile?.image_url || ''
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createUser = async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body;
        if (!username || !fullName || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }
        // const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        // if (!phoneRegex.test(phone)) {
        //     return res.status(400).json({
        //         status: 'error',
        //         message: 'Số điện thoại không hợp lệ'
        //     });
        // }
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                status: 'error',
                message: 'Email này đã được đăng ký'
            });
        }
        const existingUsername = await User.findOne({ name: username });
        if (existingUsername) {
            return res.status(400).json({
                status: 'error',
                message: 'Tên người dùng này đã tồn tại'
            });
        }
        // const existingPhone = await UserProfile.findOne({ phone_number: phone });
        // if (existingPhone) {
        //     return res.status(400).json({
        //         status: 'error',
        //         message: 'Số điện thoại này đã được đăng ký'
        //     });
        // }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            name: username,
            email: email,
            password_hash: hashedPassword,
            role: 'customer',
            status: 'active'
        });
        const savedUser = await user.save();
        const userProfile = new UserProfile({
            user_id: savedUser._id,
            full_name: fullName,
            phone_number: null,  
            address: null,      
            image_url: null
        });
        await userProfile.save();

        res.status(201).json({
            message: 'Đăng ký thành công',
            user: {
                id: savedUser._id,
                username: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                profile: {
                    fullName: userProfile.full_name,
                    address: '',
                    phone: '',
                    position: savedUser.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {    
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateProfile = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            const { fullName, address = '', phone = '' } = req.body;
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;

            const updateData = {
                full_name: fullName,
                address: address,
                phone_number: phone
            };

            // Add image URL if file was uploaded
            if (req.file) {
                updateData.image_url = `/uploads/profile/${req.file.filename}`;
            }

            const userProfile = await UserProfile.findOneAndUpdate(
                { user_id: userId },
                updateData,
                { new: true }
            );

            if (!userProfile) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
            }

            const user = await User.findById(userId);

            res.json({
                message: 'Cập nhật thông tin thành công',
                user: {
                    id: user._id,
                    username: user.name,
                    email: user.email,
                    role: user.role,
                    profile: {
                        fullName: userProfile.full_name,
                        address: userProfile.address,
                        phone: userProfile.phone_number,
                        position: user.role,
                        imageUrl: userProfile.image_url
                    }
                }
            });
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Lỗi cập nhật thông tin' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Verify old password
        const validPassword = await bcrypt.compare(oldPassword, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password
        user.password_hash = hashedPassword;
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Lỗi đổi mật khẩu' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        res.status(200).json({ message: 'User deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const handleLogout = async (req, res) => {
    try {
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error during logout' 
        });
    }
};

module.exports = {
    getUserProfile,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    login,
    checkEmail,
    verifyCode,
    resetPassword,
    updateProfile,
    changePassword,
    handleLogout
}