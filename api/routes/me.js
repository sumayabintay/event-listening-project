import express from "express";
import User from "../models/User.js";
import Event from "../models/Event.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("name email savedEvents");
  const myEvents = await Event.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
  res.json({ user, myEvents });
});

router.post("/save/:eventId", requireAuth, async (req, res) => {
  const { eventId } = req.params;
  const user = await User.findById(req.user.id);

  const exists = user.savedEvents.some((id) => String(id) === String(eventId));
  if (exists) user.savedEvents = user.savedEvents.filter((id) => String(id) !== String(eventId));
  else user.savedEvents.push(eventId);

  await user.save();
  res.json({ savedEvents: user.savedEvents });
});

export default router;