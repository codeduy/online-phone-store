const mongoose = require("mongoose");

const shipmentLogSchema = new mongoose.Schema(
  {
    shipment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment", // Liên kết với bảng Shipment
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_transit", "delivered", "failed", "cancelled"], // Các trạng thái hợp lệ
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false } // Không cần tạo `createdAt` và `updatedAt`
);

module.exports = mongoose.model("ShipmentLog", shipmentLogSchema, 'shipmentLogs');
