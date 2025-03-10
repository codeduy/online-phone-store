var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 
// const { cleanupUnusedImages } = require('./utils/cleanupImages');
const jwt = require('jsonwebtoken');
const adminAuthMiddleware = require('./middleware/admin/adminAuthMiddleware');

//User routes
const usersRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const newsEventRoutes = require('./routes/newsEventsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const productRoutes = require('./routes/productRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const addressRoutes = require('./routes/addressRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');
const orderRoutes = require('./routes/orderRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const cartRoutes = require('./routes/cartRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const vnpayRoutes = require('./routes/vnpayRoutes');

//Admin routes

const adminRoutes = require('./routes/admin/adminRoutes');
const newsRoutes = require('./routes/admin/newsRoutes');
const adminvoucherRoutes = require('./routes/admin/voucherRoutes');
const customerRoutes = require('./routes/admin/customerRoutes');
const adminProductRoutes = require('./routes/admin/productRoutes');
const adminOrderRoutes = require('./routes/admin/orderRoutes');
const logRoutes = require('./routes/admin/logRoutes');

// const productDetailsRouter = require('./routes/productDetails');

// const deliveryServicesRouter = require('./routes/deliveryServices');
// const shipmentsRouter = require('./routes/shipments');
// const shipmentLogsRouter = require('./routes/shipmentLogs');
// const orderItemsRouter = require('./routes/orderItems');
// const promotionsRouter = require('./routes/promotions');
// const transactionsRouter = require('./routes/transactions');
// const staffsRouter = require('./routes/staffs');
// const reportsRouter = require('./routes/reports');
// const logsRouter = require('./routes/logs');



var app = express();

// Lấy URI kết nối MongoDB Atlas từ biến môi trường
const dbURI = process.env.MONGODB_URI;

// Kết nối tới MongoDB Atlas
mongoose.connect(dbURI)
  .then(() => console.log('Connected to MongoDB Atlas successfully'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Các middleware

// Cấu hình phục vụ hình ảnh từ thư mục public/images
app.use('/public', express.static(path.join(__dirname, 'public')));
// app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static('public/images'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: ['http://localhost:5173', 'https://mobileshop-cntt.onrender.com'],
  credentials: true
}));

// Các route
app.use('/api/compare', comparisonRoutes);
app.use('/api/products', productRoutes);

// Authentication middleware
app.use((req, res, next) => {
  // Skip auth for certain routes
  const publicPaths = [
    '/api/auth/login', 
    '/api/auth/register',
    '/api/auth/verify',
    '/images',
    '/api/news',
    '/api/auth/logout',
    '/api/categories',
    '/api/contacts',
    '/api/products/hot',  
    '/api/products',   
    '/api/provinces',              
    '/api/districts',              
    '/api/wards',
    '/api/products/by-brand',
    '/api/products/brand',
    '/api/products/filter',
    '/api/products/hot',
    '/api/products/detail',
    '/api/auth/check-email',
    '/api/auth/reset-password',
    '/api/orders/user',
    '/api/orders/detail',
    '/api/users/profile',
    '/api/vouchers',
    '/api/admin/',
    '/api/vnpay/payment/return',
    '/api/reviews'
  ];
  
  if (publicPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});
// // Các route
app.use("/api/auth", usersRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/news', newsEventRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/vnpay', vnpayRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/admin/news', newsRoutes);
app.use('/api/admin/vouchers', adminvoucherRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin', logRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Schedule cleanup
// setInterval(cleanupUnusedImages, 24 * 60 * 60 * 1000);
// cleanupUnusedImages();

module.exports = app;