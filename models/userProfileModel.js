const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  full_name: {
      type: String,
      required: true
  },
  phone_number: {
      type: String,
      default: ''
  },
  address: {
      type: String,
      default: ''
  },
  image_url: {
      type: String,
      default: ''
  }
}, { timestamps: true });

const UserProfile = mongoose.model('UserProfile', userProfileSchema, 'userProfiles');

module.exports = UserProfile;