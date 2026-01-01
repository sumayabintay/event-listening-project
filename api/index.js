const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./lib/db");

// ✅ routes: ESM হলে .default কাজ করবে, CommonJS হলেও কাজ করবে
const authRoutes = require("./routes/auth").default || require("./routes/auth");
const eventRoutes = require("./routes/events").default || require("./routes/events");
const meRoutes = require("./routes/me").default || require("./routes/me");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ DB connect only once (serverless friendly)
let dbConnected = false;

async function ensureDB() {
  if (dbConnected) return;
  await connectDB(process.env.MONGODB_URI);
  dbConnected = true;
  console.log("✅ MongoDB connected");
}

app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error("❌ DB connect error:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
});

// ✅ test routes (so you can check quickly)
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API running" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// ✅ your routes
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/me", meRoutes);

// ✅ Vercel handler
module.exports = (req, res) => app(req, res);