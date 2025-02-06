const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // Liên kết với bảng orders
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Liên kết với bảng products
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // Số lượng ít nhất là 1
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Giá phải lớn hơn hoặc bằng 0
    },
    link: {
      type: String,
      required: true,
    },
    meta: {
      type: String,
      default: "",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("OrderItem", orderItemSchema, 'orderItems');
