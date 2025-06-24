const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

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
    console.error("JWT verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Post a new job
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, description, skills, budget, name } = req.body;
    console.log("Request body:", req.body);

    if (!title || !description || !skills || !budget) {
      return res
        .status(400)
        .json({
          message: "Title, description, skills, and budget are required",
        });
    }

    const jobName = name || req.user.name || req.user.username || "Anonymous";

    const skillsArray =
      typeof skills === "string"
        ? skills.split(",").map((skill) => skill.trim())
        : skills;

    const job = new Job({
      title,
      description,
      skills: skillsArray,
      budget,
      postedBy: {
        userId: req.user.id,
        name: jobName,
      },
    });

    await job.save();
    res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    console.error("Create job error:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all jobs (filter by postedBy if provided)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const { postedBy } = req.query;
    const query =
      postedBy && mongoose.isValidObjectId(postedBy)
        ? { "postedBy.userId": new mongoose.Types.ObjectId(postedBy) }
        : {};
    console.log("Jobs query:", query); // Debug log
    const jobs = await Job.find(query)
      .populate("postedBy.userId", "name username")
      .populate("applicants", "name skills")
      .populate("acceptedApplicant.userId", "name");
    console.log("Returning jobs:", jobs); // Debug log
    res.json(jobs);
  } catch (error) {
    console.error("Fetch jobs error:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Apply to a job
router.post("/apply/:id", authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy.userId.toString() === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot apply to your own job" });
    }

    if (job.applicants.includes(req.user.id)) {
      return res
        .status(400)
        .json({ message: "You have already applied to this job" });
    }

    job.applicants.push(req.user.id);
    await job.save();
    res.json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Apply job error:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
