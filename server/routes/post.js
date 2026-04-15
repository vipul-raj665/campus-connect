const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// CREATE POST
router.post("/", async (req, res) => {
  try {
    const { user, content } = req.body;

    const post = await Post.create({ user, content });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Error creating post" });
  }
});

// GET ALL POSTS
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

module.exports = router;