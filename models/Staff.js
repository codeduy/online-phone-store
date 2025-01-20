const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Liên kết với bảng users
      required: true,
    },
    position: {
      type: String,
      enum: ["staff", "manager", "admin"], // Các chức vụ của nhân viên
      required: true,
    },
    hired_date: {
      type: Date,
      default: Date.now, // Ngày bắt đầu làm việc
    },
    salary: {
      type: Number,
      required: true,
      min: 0, // Mức lương không thể âm
    },
    created_at: {
      type: Date,
      default: Date.now, // Ngày tạo thông tin nhân viên
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

module.exports = mongoose.model("Staff", staffSchema, 'staffs');
