import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import serverless from "serverless-http";
import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import meRoutes from "./routes/me.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  await connectDB(process.env.MONGODB_URI);
  next();
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/me", meRoutes);

export default serverless(app);