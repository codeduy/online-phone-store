const mongoose = require("mongoose");

const deliveryServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    contact_info: {
      type: String,
      required: true,
    },
    api_endpoint: {
      type: String,
      required: true,
    },
    api_key: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Tự động tạo `createdAt` và `updatedAt`
);

module.exports = mongoose.model("DeliveryService", deliveryServiceSchema, 'deliveryServices');
