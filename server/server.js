const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const messageRoutes = require("./routes/message");
const eventRoutes = require("./routes/event");

// ✅ create app FIRST
const app = express();

// ✅ middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ import routes AFTER app creation
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");

// ✅ use routes
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/events", eventRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API running");
});

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/campus-connect")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});