const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // Liên kết với bảng Order
      required: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryService", // Liên kết với bảng DeliveryService
      required: true,
    },
    tracking_number: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_transit", "delivered", "cancelled"], // Trạng thái giao hàng
      default: "pending",
    },
    estimated_delivery: {
      type: Date,
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

module.exports = mongoose.model("Shipment", shipmentSchema, 'shipments');
