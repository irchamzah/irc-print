const { Schema, model } = require("mongoose");

const transactionSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "settlement", "expire", "cancel"],
    default: "pending",
  },
  paymentMethod: String,
  fileInfo: {
    fileName: String,
    fileSize: Number,
    fileId: String,
  },
  printSettings: {
    colorPages: [Number],
    bwPages: [Number],
    copies: Number,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = model("Transaction", transactionSchema);
