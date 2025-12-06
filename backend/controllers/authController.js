const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ALLOWED_ROLES = ["attendee", "host", "admin"];

function genToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function normalizeRole(role = "attendee") {
  if (ALLOWED_ROLES.includes(role)) return role;
  return "attendee";
}

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function respondWithAuth(res, user, message, statusCode = 200) {
  const token = genToken(user._id);
  return res.status(statusCode).json({
    message,
    token,
    user: formatUser(user),
  });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, intent } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedRole = normalizeRole(role || intent);

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: "Email already used" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hash,
      role: normalizedRole,
    });

    return respondWithAuth(res, user, "Registered successfully", 201);
  } catch (err) {
    console.error("Register failed", err);
    return res.status(500).json({ error: "Register failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    return respondWithAuth(res, user, "Login successful");
  } catch (err) {
    console.error("Login failed", err);
    return res.status(500).json({ error: "Login failed" });
  }
};

exports.me = async (req, res) => {
  return res.json({ user: formatUser(req.user) });
};
