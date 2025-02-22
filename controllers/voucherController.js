const Voucher = require('../models/voucherModel');

const voucherController = {
    validateVoucher: async (req, res) => {
        try {
          const { code } = req.params;
          const { totalAmount } = req.query;
    
          // Debug logs
          console.log('Validation request:', {
            code,
            totalAmount,
            currentDate: new Date()
          });
    
          // Basic input validation
          if (!code || !totalAmount) {
            return res.status(400).json({
              success: false,
              message: 'Thiếu mã giảm giá hoặc giá trị đơn hàng'
            });
          }
    
          // First find the voucher without date constraints to debug
          const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() });
          console.log('Found voucher (before validation):', existingVoucher);
    
          if (!existingVoucher) {
            return res.status(404).json({
              success: false,
              message: 'Mã giảm giá không tồn tại'
            });
          }
    
          // Check active status
          if (!existingVoucher.isActive) {
            return res.status(400).json({
              success: false,
              message: 'Mã giảm giá đã bị vô hiệu hóa'
            });
          }
    
          // Check date validity
          const now = new Date();
          if (now < existingVoucher.startDate) {
            return res.status(400).json({
              success: false,
              message: 'Mã giảm giá chưa có hiệu lực'
            });
          }
    
          if (now > existingVoucher.endDate) {
            return res.status(400).json({
              success: false,
              message: 'Mã giảm giá đã hết hạn'
            });
          }
    
          // Check minimum order value
          const orderAmount = Number(totalAmount);
          if (isNaN(orderAmount)) {
            return res.status(400).json({
              success: false,
              message: 'Giá trị đơn hàng không hợp lệ'
            });
          }
    
          if (orderAmount < existingVoucher.minOrderValue) {
            return res.status(400).json({
              success: false,
              message: `Đơn hàng tối thiểu ${existingVoucher.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này`
            });
          }
    
          // If all validations pass, return the voucher
          res.json({
            success: true,
            data: existingVoucher
          });
    
        } catch (error) {
          console.error('Voucher validation error:', error);
          res.status(500).json({
            success: false,
            message: 'Lỗi server khi kiểm tra mã giảm giá'
          });
        }
      },

  getAllVouchers: async (req, res) => {
    try {
      const vouchers = await Voucher.find({ isActive: true });
      res.json({
        success: true,
        data: vouchers
      });
    } catch (error) {
      console.error('Get vouchers error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách mã giảm giá'
      });
    }
  }
};

module.exports = voucherController;