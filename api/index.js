const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./lib/db");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const meRoutes = require("./routes/me");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ DB connect only once (important)
let dbConnected = false;

async function ensureDB() {
  if (dbConnected) return;
  await connectDB(process.env.MONGODB_URI);
  dbConnected = true;
}

app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ✅ test routes
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API running" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/me", meRoutes);

// ✅ THIS is the KEY line for Vercel
module.exports = (req, res) => app(req, res);