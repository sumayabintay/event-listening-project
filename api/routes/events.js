import express from "express";
import { z } from "zod";
import Event from "../models/Event.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { category, location, q } = req.query;
  const filter = {};
  if (category) filter.category = new RegExp(String(category), "i");
  if (location) filter.location = new RegExp(String(location), "i");
  if (q) filter.title = new RegExp(String(q), "i");

  const events = await Event.find(filter).sort({ date: 1, time: 1 }).limit(200);
  res.json(events);
});

router.get("/:id", async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Not found" });
  res.json(event);
});

const eventSchema = z.object({
  title: z.string().min(2),
  date: z.string().min(8),
  time: z.string().min(3),
  location: z.string().min(2),
  category: z.string().min(2),
  description: z.string().min(5),
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const event = await Event.create({ ...parsed.data, createdBy: req.user.id });
  res.json(event);
});

router.put("/:id", requireAuth, async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Not found" });
  if (String(event.createdBy) !== req.user.id) return res.status(403).json({ message: "Forbidden" });

  Object.assign(event, parsed.data);
  await event.save();
  res.json(event);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Not found" });
  if (String(event.createdBy) !== req.user.id) return res.status(403).json({ message: "Forbidden" });

  await event.deleteOne();
  res.json({ ok: true });
});

export default router;