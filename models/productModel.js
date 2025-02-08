const mongoose = require("mongoose");
const Category = require('./categoryModel');  // Import mô hình Category

// Định nghĩa Schema cho products
const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên sản phẩm  
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Danh mục sản phẩm (liên kết tới bảng category)
  images: { type: [String], default: [] }, // Danh sách đường dẫn ảnh
  created_at: { type: Date, default: Date.now }, // Ngày tạo sản phẩm
  updated_at: { type: Date, default: Date.now }, // Ngày cập nhật gần nhất
  link: { type: String, required: true }, // Đường dẫn
  meta: { type: String, default: "" }, // Tên miền hoặc metadata
});

const Product = mongoose.model('Product', productSchema, 'products');

module.exports = Product;