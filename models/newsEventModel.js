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
      default: null,
    },
    end_date: {
      type: Date,
      default: null,
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

module.exports = mongoose.model("NewsEvent", newsEventSchema, 'newsEvents');