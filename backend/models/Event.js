const mongoose = require("mongoose");

const teamConfigSchema = new mongoose.Schema(
  {
    minSize: { type: Number, default: 1 },
    maxSize: { type: Number, default: 1 },
    allowIndividual: { type: Boolean, default: true },
  },
  { _id: false }
);

const analyticsSchema = new mongoose.Schema(
  {
    totalRegistrations: { type: Number, default: 0 },
    totalTickets: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    lastRegistrationAt: Date,
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    date: Date,
    endDate: Date,
    venue: String,
    locationType: { type: String, enum: ["in-person", "virtual", "hybrid"], default: "in-person" },
    type: { type: String, enum: ["individual", "team"], default: "individual" },
    teamLimit: { type: Number, default: 1 }, // legacy support
    teamConfig: { type: teamConfigSchema, default: () => ({}) },
    category: { type: String, default: "General" },
    tags: { type: [String], default: [] },
    agenda: String,

    ticketPrice: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },

    maxAttendees: { type: Number, default: 0 },
    currentAttendees: { type: Number, default: 0 },
    waitlistCount: { type: Number, default: 0 },

    imageUrl: String,
    posterUrl: String,
    galleryImages: { type: [String], default: [] },

    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hostName: String,

    approved: { type: Boolean, default: false },
    adminRejected: { type: Boolean, default: false },
    rejectReason: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },

    isActive: { type: Boolean, default: true },
    registrationDeadline: Date,
    oneSeatPerUser: { type: Boolean, default: false },
    allowCancellation: { type: Boolean, default: true },
    enableReminders: { type: Boolean, default: true },

    analytics: { type: analyticsSchema, default: () => ({}) },
    autoStatusUpdatedAt: Date,
    reviewHistory: [
      {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: String,
        note: String,
        reviewedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
