const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Liên kết với bảng users (quản lý tạo khuyến mãi)
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"], // Loại giảm giá: phần trăm hoặc cố định
      required: true,
    },
    discount_value: {
      type: Number,
      required: true,
      min: 0, // Giá trị giảm giá không được âm
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    meta: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Promotion", promotionSchema, 'promotions');
