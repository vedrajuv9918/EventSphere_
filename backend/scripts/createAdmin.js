const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

async function ensureAdmin() {
  const ADMIN_NAME = "Admin";
  const ADMIN_EMAIL = "admin@eventsphere.com";
  const ADMIN_PASSWORD = "1234567890";

  await connectDB();

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    existing.name = ADMIN_NAME;
    existing.password = passwordHash;
    existing.role = "admin";
    await existing.save();
    console.log("Updated existing admin user.");
    return;
  }

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: passwordHash,
    role: "admin",
  });
  console.log("Admin user created successfully.");
}

ensureAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to create admin user", err);
    process.exit(1);
  });
