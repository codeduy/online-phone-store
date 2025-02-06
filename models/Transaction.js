const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // Liên kết với bảng orders
      required: true,
    },
    payment_method: {
      type: String,
      enum: ["credit_card", "paypal", "bank_transfer", "cash_on_delivery"], // Các phương thức thanh toán
      required: true,
    },
    transaction_status: {
      type: String,
      enum: ["success", "failed", "pending"], // Trạng thái giao dịch
      required: true,
    },
    transaction_date: {
      type: Date,
      default: Date.now, // Ngày giao dịch
    },
    amount: {
      type: Number,
      required: true,
      min: 0, // Số tiền thanh toán phải >= 0
    },
    link: {
      type: String,
      required: true,
    },
    meta: {
      type: String,
      default: "",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Transaction", transactionSchema, 'transactions');
