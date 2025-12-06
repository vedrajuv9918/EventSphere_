const User = require("../models/User");

exports.getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: "Unable to load profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "phone", "roleType", "interests", "profilePic"];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "interests" && typeof req.body[field] === "string") {
          req.user[field] = req.body[field]
            .split(",")
            .map((interest) => interest.trim())
            .filter(Boolean);
          return;
        }

        req.user[field] =
          field === "interests" && Array.isArray(req.body[field])
            ? req.body[field]
            : req.body[field];
      }
    });

    await req.user.save();
    res.json({ message: "Profile updated", user: req.user });
  } catch (err) {
    console.error("Update profile failed", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const url = `/uploads/${req.file.filename}`;
    req.user.profilePic = url;
    await req.user.save();

    res.json({ success: true, url });
  } catch (err) {
    console.error("Upload profile photo failed", err);
    res.status(500).json({ error: "Failed to upload photo" });
  }
};
