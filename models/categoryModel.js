const mongoose = require("mongoose");

// Định nghĩa Schema cho categories
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },  // Tên danh mục
  description: { type: String, required: true },  // Mô tả danh mục
  parent_category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },  // Danh mục cha (nếu có)
  link: { type: String, required: true },  // Đường dẫn
  meta: { type: String, default: "" },  // Metadata
  logo_url: { type: String, required: true }
}, {
  timestamps: true,  // Tự động thêm created_at và updated_at
});

const Category = mongoose.model("Category", categorySchema, 'categories');

module.exports = Category;
