const mongoose = require('mongoose');
const Voucher = require('./models/voucherModel');

// Add one day to current date to ensure startDate is future
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

const voucherData = [
  {
    name: 'Giảm 50K cho đơn từ 500K',
    code: 'WELCOME50K',
    discountType: 'FIXED',
    discountValue: 50000,
    minOrderValue: 500000,
    startDate: tomorrow,
    endDate: new Date(tomorrow.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from tomorrow
    isActive: true
  },
  {
    name: 'Giảm 10% cho đơn từ 1 triệu',
    code: 'SAVE10PCT',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 1000000,
    startDate: tomorrow,
    endDate: new Date(tomorrow.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from tomorrow
    isActive: true
  },
  {
    name: 'Giảm 200K cho đơn từ 2 triệu',
    code: 'SUPER200K',
    discountType: 'FIXED',
    discountValue: 200000,
    minOrderValue: 2000000,
    startDate: tomorrow,
    endDate: new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from tomorrow
    isActive: true
  },
  {
    name: 'Giảm 15% cho đơn từ 5 triệu',
    code: 'MEGA15PCT',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderValue: 5000000,
    startDate: tomorrow,
    endDate: new Date(tomorrow.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from tomorrow
    isActive: true
  },
  {
    name: 'Giảm 5 triệu cho đơn từ 50 triệu',
    code: 'VIP5M',
    discountType: 'FIXED',
    discountValue: 5000000,
    minOrderValue: 50000000,
    startDate: tomorrow,
    endDate: new Date(tomorrow.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from tomorrow
    isActive: true
  },
  {
    name: 'Giảm 20% cho đơn từ 60 triệu',
    code: 'MEGA20PCT',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValue: 60000000,
    startDate: tomorrow,
    endDate: new Date(tomorrow.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from tomorrow
    isActive: true
  }
];

const seedVouchers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/mobileshop');
    console.log('Connected to MongoDB...');

    // Delete existing vouchers
    await Voucher.deleteMany({});
    console.log('Deleted existing vouchers...');

    // Insert new vouchers
    const insertedVouchers = await Voucher.insertMany(voucherData);
    console.log(`Successfully inserted ${insertedVouchers.length} vouchers`);

    // Display inserted vouchers
    console.log('\nInserted Vouchers:');
    insertedVouchers.forEach(voucher => {
      console.log(`- ${voucher.code}: ${voucher.name}`);
      console.log(`  Start: ${voucher.startDate.toLocaleDateString()}`);
      console.log(`  End: ${voucher.endDate.toLocaleDateString()}`);
    });

  } catch (error) {
    console.error('Error seeding vouchers:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

// Run the seeding function
seedVouchers();