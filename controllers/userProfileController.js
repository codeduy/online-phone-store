const UserProfile = require('../models/userProfileModel');
const jwt = require('jsonwebtoken');

const userProfileController = {
    getProfile: async (req, res) => {
        try {
            const { id } = req.params;
            const profile = await UserProfile.findOne({ user_id: id })
                .select('full_name phone_number address')
                .lean();

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            res.json({
                success: true,
                data: {
                    full_name: profile.full_name,
                    phone_number: profile.phone_number,
                    address: profile.address
                }
            });
        } catch (error) {
            console.error('Error in getProfile:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    updateAddress: async (req, res) => {
        try {
            const { id } = req.params;
            const { address } = req.body;

            // Validate token
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            // Verify token matches user ID
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.userId !== id) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            // Update the address
            const updatedProfile = await UserProfile.findOneAndUpdate(
                { user_id: id },
                { address },
                { new: true }
            ).select('full_name phone_number address');

            if (!updatedProfile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            res.json({
                success: true,
                data: {
                    full_name: updatedProfile.full_name,
                    phone_number: updatedProfile.phone_number,
                    address: updatedProfile.address
                }
            });
        } catch (error) {
            console.error('Error updating address:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    updateProfile: async (req, res) => {
        try {
            const { id } = req.params;
            const { full_name, phone_number, address } = req.body;

            // Validate token
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            // Verify token matches user ID
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.userId !== id) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            // Validate input
            if (!full_name || !phone_number) {
                return res.status(400).json({
                    success: false,
                    message: 'Full name and phone number are required'
                });
            }

            // Validate phone number format
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone_number)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid phone number format'
                });
            }

            // Update the profile
            const updatedProfile = await UserProfile.findOneAndUpdate(
                { user_id: id },
                { 
                    full_name, 
                    phone_number,
                    ...(address && { address }) // Only update address if provided
                },
                { new: true }
            ).select('full_name phone_number address');

            if (!updatedProfile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            res.json({
                success: true,
                data: {
                    full_name: updatedProfile.full_name,
                    phone_number: updatedProfile.phone_number,
                    address: updatedProfile.address
                },
                message: 'Profile updated successfully'
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
};

module.exports = userProfileController;