var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();  // Để sử dụng biến môi trường từ .env

const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const productDetailsRouter = require('./routes/productDetails');
const usersRouter = require('./routes/users');
const userProfilesRouter = require('./routes/userProfiles');
const deliveryServicesRouter = require('./routes/deliveryServices');
const shipmentsRouter = require('./routes/shipments');
const shipmentLogsRouter = require('./routes/shipmentLogs');
const ordersRouter = require('./routes/orders');
const orderItemsRouter = require('./routes/orderItems');
const promotionsRouter = require('./routes/promotions');
const transactionsRouter = require('./routes/transactions');
const staffsRouter = require('./routes/staffs');
const reportsRouter = require('./routes/reports');
const logsRouter = require('./routes/logs');
const newsEventsRouter = require('./routes/newsEvents');

var app = express();

// Lấy URI kết nối MongoDB Atlas từ biến môi trường
const dbURI = process.env.MONGODB_URI;

// Kết nối tới MongoDB Atlas
mongoose.connect(dbURI)
  .then(() => console.log('Connected to MongoDB Atlas successfully'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Các middleware
// Cấu hình phục vụ hình ảnh từ thư mục public/images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
// Các route
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/productDetails", productDetailsRouter);
app.use("/users", usersRouter);
app.use("/userProfiles", userProfilesRouter);
app.use("/deliveryServices", deliveryServicesRouter);
app.use("/shipments", shipmentsRouter);
app.use("/shipmentLogs", shipmentLogsRouter);
app.use("/orders", ordersRouter);
app.use("/orderItems", orderItemsRouter);
app.use("/promotions", promotionsRouter);
app.use("/transactions", transactionsRouter);
app.use("/staffs", staffsRouter);
app.use("/reports", reportsRouter);
app.use("/logs", logsRouter);
app.use("/newsEvents", newsEventsRouter);


module.exports = app;
