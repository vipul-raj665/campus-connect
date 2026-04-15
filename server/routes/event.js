const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// CREATE EVENT
router.post("/", async (req, res) => {
  const { title, description, date } = req.body;

  const event = await Event.create({ title, description, date });

  res.json(event);
});

// GET EVENTS
router.get("/", async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.json(events);
});

module.exports = router;