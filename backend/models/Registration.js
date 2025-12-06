const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },

    seats: { type: Number, default: 1 },
    teamName: String,
    teamMembers: { type: [memberSchema], default: [] },

    contact: String,
    phone: String,
    email: String,
    special: String,

    registrationStatus: {
      type: String,
      enum: ["pending", "confirmed", "waitlisted", "cancelled"],
      default: "pending",
    },
    paymentStatus: { type: String, enum: ["success", "pending", "failed"], default: "pending" },
    paymentReference: String,
    amountPaid: { type: Number, default: 0 },

    ticketId: String,
    checkInStatus: {
      type: String,
      enum: ["not_started", "checked_in", "cancelled"],
      default: "not_started",
    },

    metadata: { type: Map, of: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Registration", registrationSchema);
