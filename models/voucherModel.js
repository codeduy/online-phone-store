const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voucherSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Tên mã giảm giá không được để trống'],
    trim: true,
    maxLength: [100, 'Tên mã giảm giá không được vượt quá 100 ký tự']
  },
  code: {
    type: String,
    required: [true, 'Mã giảm giá không được để trống'],
    unique: true,
    uppercase: true,
    trim: true,
    maxLength: [20, 'Mã giảm giá không được vượt quá 20 ký tự']
  },
  discountType: {
    type: String,
    required: [true, 'Loại giảm giá không được để trống'],
    enum: {
      values: ['FIXED', 'PERCENTAGE'],
      message: 'Loại giảm giá không hợp lệ'
    }
  },
  discountValue: {
    type: Number,
    required: [true, 'Giá trị giảm không được để trống'],
    validate: {
      validator: function(value) {
        if (this.discountType === 'PERCENTAGE') {
          return value > 0 && value <= 100; // Chỉ kiểm tra phạm vi 1-100 cho giảm theo %
        }
        return value > 0; // Với giảm cố định (FIXED) chỉ cần > 0
      },
      message: function(props) {
        if (this.discountType === 'PERCENTAGE') {
          return 'Phần trăm giảm giá phải từ 1% đến 100%';
        }
        return 'Giá trị giảm phải lớn hơn 0';
      }
    }
  },
  minOrderValue: {
    type: Number,
    required: [true, 'Giá trị đơn hàng tối thiểu không được để trống'],
    min: [0, 'Giá trị đơn hàng tối thiểu không được âm']
  },
  startDate: {
    type: Date,
    required: [true, 'Ngày bắt đầu không được để trống']
  },
  endDate: {
    type: Date,
    required: [true, 'Ngày kết thúc không được để trống'],
    validate: {
      validator: function(value) {
        // Convert both dates to timestamps for comparison
        const startTimestamp = this.startDate ? this.startDate.getTime() : 0;
        const endTimestamp = value ? value.getTime() : 0;
        return endTimestamp > startTimestamp;
      },
      message: 'Ngày kết thúc phải sau ngày bắt đầu'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
voucherSchema.index({ code: 1 });
voucherSchema.index({ startDate: 1, endDate: 1 });
voucherSchema.index({ isActive: 1 });

// Virtual for checking if voucher is currently valid
voucherSchema.virtual('isValid').get(function() {
  const now = new Date();
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  return this.isActive && 
         now >= startDate && 
         now <= endDate;
});

// Pre-save middleware to validate dates
voucherSchema.pre('save', function(next) {
  if (this.isModified('isActive') && !this.isModified('startDate') && !this.isModified('endDate')) {
    return next();
  }
  
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  
  if (end <= start) {
    next(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
  } else {
    next();
  }
});
const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;