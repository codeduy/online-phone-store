const Voucher = require('../../models/voucherModel');
const logger = require('../../middleware/loggerMiddleware');

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

            // Log the create action
            await logger(
                req.user.userId,
                'CREATE',
                'COUPONS',
                `Tạo mã giảm giá mới: ${savedVoucher.code} - ${savedVoucher.name} (Giảm ${savedVoucher.discountValue}${savedVoucher.discountType === 'percentage' ? '%' : 'đ'})`,
                req
            );
            
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

            // Get original voucher for logging
            const originalVoucher = await Voucher.findById(voucherId);
            if (!originalVoucher) {
                return res.status(404).json({
                    success: false,
                    message: 'Voucher not found'
                });
            }
            
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

            // Prepare changes log message
            const changes = [];
            if (originalVoucher.name !== updateData.name) {
                changes.push(`Tên: ${originalVoucher.name} → ${updateData.name}`);
            }
            if (originalVoucher.discountValue !== updateData.discountValue) {
                const oldUnit = originalVoucher.discountType === 'PERCENTAGE' ? '%' : 'VND';
                const unit = updateData.discountType === 'PERCENTAGE' ? '%' : 'VND';
                changes.push(`Giá trị: ${originalVoucher.discountValue}${oldUnit} → ${updateData.discountValue}${unit}`);
            }
            if (originalVoucher.minOrderValue !== updateData.minOrderValue) {
                changes.push(`Đơn tối thiểu: ${originalVoucher.minOrderValue.toLocaleString('vi-VN')}VND → ${updateData.minOrderValue.toLocaleString('vi-VN')}VND`);
            }

            // Log the update action
            await logger(
                req.user.userId,
                'UPDATE',
                'COUPONS',
                `Cập nhật mã giảm giá ${updatedVoucher.code}: ${changes.join(', ')}`,
                req
            );
    
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
            const voucher = await Voucher.findById(voucherId);
            
            if (!voucher) {
                return res.status(404).json({
                    success: false,
                    message: 'Voucher not found'
                });
            }

            await Voucher.findByIdAndDelete(voucherId);

            // Log the delete action
            await logger(
                req.user.userId,
                'DELETE',
                'COUPONS',
                `Xóa mã giảm giá: ${voucher.code} - ${voucher.name}`,
                req
            );

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