const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./lib/db");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const meRoutes = require("./routes/me");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ connect once (cache)
let isDbConnected = false;

app.use(async (req, res, next) => {
  try {
    if (!isDbConnected) {
      await connectDB(process.env.MONGODB_URI);
      isDbConnected = true;
      console.log("✅ MongoDB connected");
    }
    next();
  } catch (err) {
    console.error("❌ DB connect error:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
});

// ✅ test route
app.get("/", (req, res) => res.json({ ok: true, message: "API running" }));
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/me", meRoutes);

// ✅ IMPORTANT: Vercel Node Function needs (req,res) handler
module.exports = app;