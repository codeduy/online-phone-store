const User = require('../../models/userModel');
const UserProfile = require('../../models/userProfileModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const logger = require('../../middleware/loggerMiddleware');


const storage = multer.diskStorage({
    destination: './public/uploads/admin',
    filename: (req, file, cb) => {
        cb(null, `admin-${Date.now()}${path.extname(file.originalname)}`);
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

const adminController = {

    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            
            // Debug logs
            console.log('Login attempt:', {
                username,
                receivedPassword: password ? 'YES' : 'NO'
            });

            // Find admin user - remove email field from query first
            const admin = await User.findOne({
                $or: [
                    { email: username },
                    { name: username }
                ],
                role: 'admin',
                status: 'active'
            });

            // Debug log
            console.log('Found admin:', admin ? 'YES' : 'NO');
            if (admin) {
                console.log('Admin details:', {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    status: admin.status
                });
            }

            if (!admin) {
                console.log('Admin not found or inactive');
                return res.status(401).json({
                    success: false,
                    message: 'Tài khoản không tồn tại hoặc không có quyền admin'
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, admin.password_hash);
            console.log('Password validation:', isValidPassword ? 'SUCCESS' : 'FAILED');

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Mật khẩu không chính xác'
                });
            }

            if (isValidPassword) {
                await logger(
                    admin._id,
                    'LOGIN',
                    'AUTH',
                    `Admin ${admin.name} đăng nhập thành công`,
                    req
                );
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: admin._id,
                    role: admin.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Success response
            console.log('Login successful for admin:', admin.email);
            
            res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: admin._id,
                        name: admin.name,
                        email: admin.email,
                        role: admin.role
                    }
                }
            });

        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },

    getProfile: async (req, res) => {
        try {
            const adminId = req.user.userId;
            
            // Debug logs
            console.log('Getting profile for adminId:', adminId);
            console.log('Request user object:', req.user);
            
            // Find admin user and their profile
            const admin = await User.findById(adminId);
            console.log('Found admin:', admin);
            
            const adminProfile = await UserProfile.findOne({ user_id: adminId });
            console.log('Found admin profile:', adminProfile);
    
            if (!admin || admin.role !== 'admin') {
                console.log('Admin validation failed:', { 
                    adminExists: !!admin, 
                    role: admin?.role 
                });
                return res.status(404).json({
                    success: false,
                    message: 'Admin profile not found'
                });
            }
    
            res.json({
                success: true,
                data: {
                    user: {
                        id: admin._id,
                        username: admin.name,
                        email: admin.email,
                        role: admin.role,
                        profile: {
                            fullName: adminProfile?.full_name || '',
                            address: adminProfile?.address || '',
                            phone: adminProfile?.phone_number || '',
                            position: 'Administrator',
                            imageUrl: adminProfile?.image_url || ''
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Get admin profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching admin profile'
            });
        }
    },

    updateProfile: async (req, res) => {
        try {
            upload(req, res, async (err) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
    
                const adminId = req.user.userId;
                const { fullName, address, phone } = req.body;
    
                // Verify admin exists
                const admin = await User.findById(adminId);
                if (!admin || admin.role !== 'admin') {
                    return res.status(404).json({
                        success: false,
                        message: 'Admin not found'
                    });
                }
    
                // Find or create admin profile
                let adminProfile = await UserProfile.findOne({ user_id: adminId });
                if (!adminProfile) {
                    adminProfile = new UserProfile({ user_id: adminId });
                }
    
                // Update profile fields
                adminProfile.full_name = fullName;
                adminProfile.address = address;
                adminProfile.phone_number = phone;
    
                // Add image URL if file was uploaded
                if (req.file) {
                    adminProfile.image_url = `/uploads/admin/${req.file.filename}`;
                }
    
                await adminProfile.save();
    
                res.json({
                    success: true,
                    data: {
                        user: {
                            id: admin._id,
                            username: admin.name,
                            email: admin.email,
                            role: admin.role,
                            profile: {
                                fullName: adminProfile.full_name,
                                address: adminProfile.address,
                                phone: adminProfile.phone_number,
                                position: 'Administrator',
                                imageUrl: adminProfile.image_url
                            }
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Update admin profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating admin profile'
            });
        }
    },

    changePassword: async (req, res) => {
        try {
            const adminId = req.user.userId;
            const { oldPassword, newPassword } = req.body;

            const admin = await User.findById(adminId);
            if (!admin || admin.role !== 'admin') {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            // Verify old password
            const validPassword = await bcrypt.compare(oldPassword, admin.password_hash);
            if (!validPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash and update new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            admin.password_hash = hashedPassword;
            await admin.save();

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change admin password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error changing password'
            });
        }
    },

    logout: async (req, res) => {
        try {
            const adminId = req.user.userId;

            // Log logout
            await logger(
                adminId,
                'LOGOUT',
                'AUTH',
                'Đăng xuất thành công',
                req
            );

            res.json({
                success: true,
                message: 'Đăng xuất thành công'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }
};

module.exports = adminController;