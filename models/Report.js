const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Liên kết với bảng admin (người tạo báo cáo)
      required: true,
    },
    report_type: {
      type: String,
      enum: ["revenue", "profit"], // Các loại báo cáo (doanh thu, lợi nhuận, ...)
      required: true,
    },
    start_date: {
      type: Date,
      required: true, // Ngày bắt đầu kỳ báo cáo
    },
    end_date: {
      type: Date,
      required: true, // Ngày kết thúc kỳ báo cáo
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Dữ liệu báo cáo (có thể là JSON hoặc tài liệu nhúng)
      required: true,
    },
    link: {
      type: String,
      required: true, // Đường dẫn đến báo cáo
    },
    meta: {
      type: String,
      default: "", // Tên miền
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Report", reportSchema, 'reports');
