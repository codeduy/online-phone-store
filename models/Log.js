const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Liên kết với bảng users
      required: true,
    },
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // Liên kết với bảng staffs
      required: true,
    },
    action: {
      type: String,
      enum: [
        "create_order",
        "edit_product",
        "delete_order",
        "update_product",
        "login",
        "logout",
        "create_promotion",
        "apply_promotion",
        // Có thể mở rộng thêm các hành động khác
      ],
      required: true,
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // ID đối tượng liên quan (order_id, product_id, ...).
    },
    timestamp: {
      type: Date,
      default: Date.now, // Thời gian thực hiện hành động.
    },
    link: {
      type: String,
      required: true, // Đường dẫn liên kết tới hành động.
    },
    meta: {
      type: String,
      default: "", // Tên miền
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Log", logSchema, 'logs');
