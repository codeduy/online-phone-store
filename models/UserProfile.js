const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Liên kết với bảng users
      required: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      default: null,
    },
    avatar_url: {
      type: String,
      default: null,
    },
    birth_date: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
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
      default: null,
    },
    meta: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const UserProfile = mongoose.model('UserProfile', userProfileSchema, 'userProfiles');

module.exports = UserProfile;