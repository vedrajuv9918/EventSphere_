const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const clientOrigin = process.env.CLIENT_URL || "*";
app.use(
  cors({
    origin: clientOrigin === "*" ? true : clientOrigin.split(","),
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("EventSphere backend running");
});
app.use("/api/host", require("./routes/hostRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server on port", PORT));
