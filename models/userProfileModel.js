const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
  },
  full_name: {
      type: String,
      required: true
  },
  phone_number: {
      type: String,
      default: null,
      index: false
  },
  address: {
      type: String,
      default: null
  },
  image_url: {
      type: String,
      default: null
  }
}, { timestamps: true });


const UserProfile = mongoose.model('UserProfile', userProfileSchema, 'userProfiles');

module.exports = UserProfile;