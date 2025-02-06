const mongoose = require("mongoose");

// Schema for Users
const userSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true
  },
  email: {
      type: String,
      required: true,
      unique: true
  },
  password_hash: {
      type: String,
      required: true
  },
  role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer'
  },
  status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
