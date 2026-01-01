const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const serverless = require("serverless-http");
const { connectDB } = require("./lib/db");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const meRoutes = require("./routes/me");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Cache DB connection (important for Vercel serverless)
let isDbConnected = false;

app.use(async (req, res, next) => {
  try {
    if (!isDbConnected) {
      await connectDB(process.env.MONGODB_URI);
      isDbConnected = true;
    }
    next();
  } catch (err) {
    console.error("DB connect error:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/me", meRoutes);

module.exports = serverless(app);
app.use(async (req, res, next) => {
  try {
    await connectDB(process.env.MONGODB_URI);
    next();
  } catch (err) {
    console.error("DB connect error:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/me", meRoutes);

module.exports = serverless(app);