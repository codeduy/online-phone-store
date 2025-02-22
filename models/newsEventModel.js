const mongoose = require("mongoose");

const newsEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sub_title: {  // Changed from content to sub_title
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["promotion", "tech"],
      required: true,
    },
    staff_id: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    start_date: {
      type: Date,
      validate: {
        validator: function(value) {
          if (!value) return true; // Allow null
          return !isNaN(new Date(value).getTime()); // Only validate if it's a valid date
        },
        message: 'Ngày đăng bài không hợp lệ'
      },
      default: Date.now // Set default to current date if not provided
    },
    status: {
      type: String,
      enum: ["true", "false"],
      default: "true",
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
      required: true,
    },
    is_external_link: {
      type: Boolean,
      default: false,
    },
    meta: {
      type: String,
      default: "",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

newsEventSchema.pre('save', function(next) {
  try {
    if (this.start_date) {
      const startDate = new Date(this.start_date);
      if (!isNaN(startDate.getTime())) {
        this.start_date = startDate;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("NewsEvent", newsEventSchema, 'newsEvents');