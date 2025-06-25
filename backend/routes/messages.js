const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Set req.user to decoded object
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Send a message
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    if (!recipientId || !content) {
      return res
        .status(400)
        .json({ message: "Recipient ID and content are required" });
    }

    const message = new Message({
      senderId: req.user.id,
      recipientId,
      content,
    });

    await message.save();
    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Send message error:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get messages received by the user
router.get("/received", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ recipientId: req.user.id })
      .populate("senderId", "name username phone address")
      .select("senderId content timestamp");
    console.log("Received messages:", messages); // Debug log
    res.json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
