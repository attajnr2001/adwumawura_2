const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get all users (artisans)
router.get("/artisans", async (req, res) => {
  try {
    const artisans = await User.find().select(
      "name location skills averageRating bio image _id"
    );
    console.log("Returning artisans:", artisans);
    res.json(artisans);
  } catch (error) {
    console.error("Fetch artisans error:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Submit a rating for a user
router.post("/rate/:id", authMiddleware, async (req, res) => {
  try {
    const { rating, client, comment } = req.body;
    const userId = req.params.id;

    // Validate inputs
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5." });
    }
    if (!client) {
      return res.status(400).json({ message: "Client name is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Add rating
    user.ratings.push({
      client,
      rating,
      comment: comment || "",
      timestamp: new Date(),
    });

    // Update averageRating
    const totalRatings = user.ratings.length;
    const sumRatings = user.ratings.reduce((sum, r) => sum + r.rating, 0);
    user.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    await user.save();

    res.json({
      message: "Rating submitted successfully.",
      averageRating: user.averageRating,
    });
  } catch (err) {
    console.error("Rate user error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
