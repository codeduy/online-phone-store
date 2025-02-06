const mongoose = require("mongoose");

const newsEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      // Bạn có thể sử dụng thư viện Markdown hoặc HTML để lưu trữ nội dung nếu cần.
    },
    image: {
      type: String, // URL của hình ảnh đại diện
      default: null,
    },
    type: {
      type: String,
      enum: ["news", "event", "announcement"], // Loại bài viết
      required: true,
    },
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Liên kết với bảng users
      required: true,
    },
    start_date: {
      type: Date,
      default: null,
    },
    end_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"], // Trạng thái bài viết
      default: "draft", // Mặc định là "draft"
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    link: {
      type: String,
      required: true, // Đường dẫn đến bài viết/sự kiện
    },
    meta: {
      type: String,
      default: "", // Tên miền (nếu có)
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("NewsEvent", newsEventSchema, 'newsEvents');
