const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    role: { type: String, enum: ["attendee", "host", "admin"], default: "attendee" },
    profilePic: String,
    phone: String,
    roleType: String, // "student" / "worker"
    interests: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
