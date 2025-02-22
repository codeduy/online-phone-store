const Voucher = require('../../models/voucherModel');

const voucherController = {
    // Get all vouchers
    getAllVouchers: async (req, res) => {
        try {
            const vouchers = await Voucher.find().sort({ createdAt: -1 });
            res.json({
                success: true,
                data: vouchers
            });
        } catch (error) {
            console.error('Error getting vouchers:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Create new voucher
    createVoucher: async (req, res) => {
        try {
            const {
                name,
                code,
                discountType,
                discountValue,
                minOrderValue,
                startDate,
                endDate,
                isActive
            } = req.body;

            const newVoucher = new Voucher({
                name,
                code: code.toUpperCase(),
                discountType,
                discountValue,
                minOrderValue,
                startDate,
                endDate,
                isActive
            });

            const savedVoucher = await newVoucher.save();
            res.status(201).json({
                success: true,
                data: savedVoucher
            });
        } catch (error) {
            console.error('Error creating voucher:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Update voucher
    updateVoucher: async (req, res) => {
        try {
            const voucherId = req.params.id;
            
            // Parse dates from ISO string
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(req.body.endDate);
    
            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format'
                });
            }
    
            const updateData = {
                ...req.body,
                startDate,
                endDate
            };
    
            const updatedVoucher = await Voucher.findByIdAndUpdate(
                voucherId,
                updateData,
                { 
                    new: true, 
                    runValidators: true,
                    context: 'query' 
                }
            );
    
            if (!updatedVoucher) {
                return res.status(404).json({
                    success: false,
                    message: 'Voucher not found'
                });
            }
    
            res.json({
                success: true,
                data: updatedVoucher
            });
        } catch (error) {
            console.error('Error updating voucher:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },
    
    // Delete voucher
    deleteVoucher: async (req, res) => {
        try {
            const voucherId = req.params.id;
            const deletedVoucher = await Voucher.findByIdAndDelete(voucherId);

            if (!deletedVoucher) {
                return res.status(404).json({
                    success: false,
                    message: 'Voucher not found'
                });
            }

            res.json({
                success: true,
                message: 'Voucher deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting voucher:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Toggle voucher status
    toggleVoucherStatus: async (req, res) => {
        try {
            const voucherId = req.params.id;
            
            // Use findOneAndUpdate instead of findById
            const updatedVoucher = await Voucher.findOneAndUpdate(
                { _id: voucherId },
                [{ $set: { isActive: { $not: "$isActive" } } }],
                { new: true }
            );
    
            if (!updatedVoucher) {
                return res.status(404).json({
                    success: false,
                    message: 'Voucher not found'
                });
            }
    
            res.json({
                success: true,
                data: updatedVoucher
            });
        } catch (error) {
            console.error('Error toggling voucher status:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = voucherController;