const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    seats: { type: Number, default: 1 },
    qrCode: String, // base64 image data url
    qrPayload: String,
    status: {
      type: String,
      enum: ["active", "used", "cancelled"],
      default: "active",
    },
    downloadedAt: Date,
    metadata: { type: Map, of: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
