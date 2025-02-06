const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Liên kết với bảng users
      required: true,
    },
    order_date: {
      type: Date,
      default: Date.now, // Ngày đặt hàng mặc định là thời điểm hiện tại
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], // Các trạng thái hợp lệ
      default: "pending",
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0, // Giá trị tổng phải lớn hơn hoặc bằng 0
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

module.exports = mongoose.model("Order", orderSchema, 'orders');
