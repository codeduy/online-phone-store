const User = require('../../models/userModel');
const UserProfile = require('../../models/userProfileModel');
const bcrypt = require('bcrypt');

const customerController = {
    // Get all customers
    getAllCustomers: async (req, res) => {
        try {
            // Fetch all customers with role 'customer' and populate their profiles
            const customers = await User.find({ role: 'customer' })
                .populate({
                    path: 'profile',
                    model: 'UserProfile',
                    select: 'full_name phone_number address'
                })
                .sort({ createdAt: -1 });

            console.log('Raw customers data:', customers); // For debugging

            const formattedCustomers = await Promise.all(customers.map(async (customer) => {
                // Find the corresponding profile directly if populate didn't work
                const profile = await UserProfile.findOne({ user_id: customer._id });
                
                return {
                    _id: customer._id,
                    username: customer.name,
                    email: customer.email,
                    status: customer.status,
                    full_name: profile?.full_name || customer.profile?.full_name || '',
                    phone: profile?.phone_number || customer.profile?.phone_number || '',
                    address: profile?.address || customer.profile?.address || '',
                    createdAt: customer.createdAt
                };
            }));

            console.log('Formatted customers:', formattedCustomers); // For debugging

            res.json({
                success: true,
                data: formattedCustomers
            });
        } catch (error) {
            console.error('Error getting customers:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Update customer
    updateCustomer: async (req, res) => {
        try {
            const { id } = req.params;
            const { email, full_name, phone, address, status, password } = req.body;

            // Find user and their profile
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            // Update user information
            user.email = email || user.email;
            user.status = status || user.status;

            if (password) {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(password, salt);
            }

            await user.save();

            // Find or create profile
            let profile = await UserProfile.findOne({ user_id: user._id });
            
            if (!profile) {
                profile = new UserProfile({
                    user_id: user._id,
                    full_name: full_name || user.name,
                    phone_number: phone || '',
                    address: address || ''
                });
                await profile.save();

                // Update user with new profile reference
                user.profile = profile._id;
                await user.save();
            } else {
                // Update existing profile
                profile.full_name = full_name || profile.full_name;
                profile.phone_number = phone || profile.phone_number;
                profile.address = address || profile.address;
                await profile.save();
            }

            // Get updated data
            const updatedCustomer = {
                _id: user._id,
                username: user.name,
                email: user.email,
                status: user.status,
                full_name: profile.full_name,
                phone: profile.phone_number,
                address: profile.address,
                createdAt: user.createdAt
            };

            res.json({
                success: true,
                data: updatedCustomer
            });
        } catch (error) {
            console.error('Error updating customer:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Search customers
    searchCustomers: async (req, res) => {
        try {
            const { query } = req.query;
            
            // Tìm kiếm users
            const customers = await User.find({
                role: 'customer',
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            }).populate({
                path: 'profile',
                model: 'UserProfile',
                select: 'full_name phone_number address'
            });
    
            // Format dữ liệu trả về giống như getAllCustomers
            const formattedCustomers = await Promise.all(customers.map(async (customer) => {
                // Tìm profile tương ứng
                const profile = await UserProfile.findOne({ user_id: customer._id });
                
                return {
                    _id: customer._id,
                    username: customer.name,
                    email: customer.email,
                    status: customer.status,
                    full_name: profile?.full_name || customer.profile?.full_name || '',
                    phone: profile?.phone_number || customer.profile?.phone_number || '',
                    address: profile?.address || customer.profile?.address || '',
                    createdAt: customer.createdAt
                };
            }));
    
            res.json({
                success: true,
                data: formattedCustomers
            });
        } catch (error) {
            console.error('Error searching customers:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    searchCustomers: async (req, res) => {
        try {
            const { query } = req.query;
            
            if (!query) {
                return res.json({
                    success: true,
                    data: []
                });
            }
    
            // Create search regex for case-insensitive partial matches
            const searchRegex = new RegExp(query, 'i');
    
            // Find users with expanded search criteria
            const customers = await User.find({
                role: 'customer',
                $or: [
                    { name: { $regex: searchRegex } },
                    { email: { $regex: searchRegex } }
                ]
            }).populate({
                path: 'profile',
                model: 'UserProfile',
                select: 'full_name phone_number address'
            });
    
            // Format the results
            const formattedCustomers = await Promise.all(customers.map(async (customer) => {
                const profile = await UserProfile.findOne({ user_id: customer._id });
                
                return {
                    _id: customer._id,
                    username: customer.name,
                    email: customer.email,
                    status: customer.status,
                    full_name: profile?.full_name || '',
                    phone: profile?.phone_number || '',
                    address: profile?.address || '',
                    createdAt: customer.createdAt
                };
            }));
    
            res.json({
                success: true,
                data: formattedCustomers
            });
        } catch (error) {
            console.error('Error searching customers:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = customerController;