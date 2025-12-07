const User = require("../models/User");
const Registration = require("../models/Registration");

exports.getMe = async (req, res) => {
  try {
    const profile =
      typeof req.user.toObject === "function" ? req.user.toObject() : { ...req.user };

    const eventsJoined = await Registration.countDocuments({
      user: req.user._id,
      registrationStatus: { $ne: "cancelled" },
    });

    profile.eventsJoined = eventsJoined;
    profile.registrationCount = eventsJoined;

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Unable to load profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = [
      "name",
      "phone",
      "roleType",
      "interests",
      "profilePic",
      "areaOfInterest",
      "preferredEventType",
      "motivation",
      "city",
      "profileCompleted",
    ];

    allowed.forEach((field) => {
      if (req.body[field] === undefined) return;

      if (field === "interests") {
        if (typeof req.body[field] === "string") {
          req.user[field] = req.body[field]
            .split(",")
            .map((interest) => interest.trim())
            .filter(Boolean);
        } else if (Array.isArray(req.body[field])) {
          req.user[field] = req.body[field];
        }
        return;
      }

      if (field === "profileCompleted") {
        req.user.profileCompleted =
          typeof req.body.profileCompleted === "string"
            ? req.body.profileCompleted === "true"
            : Boolean(req.body.profileCompleted);
        return;
      }

      req.user[field] = req.body[field];
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

    const relativePath = `/api/uploads/${req.file.filename}`;
    const origin =
      process.env.SERVER_PUBLIC_URL ||
      `${req.protocol}://${req.get("host")}`;
    const absoluteUrl = `${origin}${relativePath}`;

    req.user.profilePic = relativePath;
    await req.user.save();

    res.json({ success: true, url: absoluteUrl, path: relativePath });
  } catch (err) {
    console.error("Upload profile photo failed", err);
    res.status(500).json({ error: "Failed to upload photo" });
  }
};
