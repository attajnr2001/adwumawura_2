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
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const artisan = await User.findById(req.params.id);
    if (!artisan) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "You cannot rate yourself" });
    }

    // Check if user has already rated
    const existingRating = artisan.ratings.find(
      (r) => r.client === req.user.id
    );
    if (existingRating) {
      return res
        .status(400)
        .json({ message: "You have already rated this user" });
    }

    artisan.ratings.push({
      client: req.user.id,
      rating,
      comment: "", // Placeholder, can be extended later
    });

    // Calculate averageRating
    const totalRatings = artisan.ratings.length;
    const sumRatings = artisan.ratings.reduce((sum, r) => sum + r.rating, 0);
    artisan.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    await artisan.save();
    res.json({
      message: "Rating submitted successfully",
      averageRating: artisan.averageRating,
    });
  } catch (error) {
    console.error("Submit rating error:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
