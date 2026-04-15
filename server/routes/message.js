const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// SEND MESSAGE
router.post("/", async (req, res) => {
  const { sender, receiver, text } = req.body;

  const msg = await Message.create({ sender, receiver, text });

  res.json(msg);
});

// GET CHAT BETWEEN 2 USERS
router.get("/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = router;