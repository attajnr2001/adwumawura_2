const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const router = express.Router();

// Ensure uploads directory exists - FIXED TYPO HERE
const uploadsDir = path.join(__dirname, "../uploads"); // Changed from "../Uploads"
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Fixed: was UploadsDir instead of uploadsDir
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow requests without files
    if (!file) {
      return cb(null, true);
    }
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only JPEG/PNG images are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

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
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Register new user
router.post("/register", upload.single("image"), async (req, res) => {
  try {
    console.log("Register request received");
    console.log("Request body:", req.body);
    console.log("File:", req.file);

    const {
      username,
      name,
      email,
      password,
      location,
      phone,
      address,
      skills,
      bio,
    } = req.body;

    // Validate required fields
    if (!username || !name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, name, email, and password are required" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.username === username
            ? "Username already exists"
            : "Email already exists",
      });
    }

    // Process skills
    let skillsArray = [];
    if (skills && typeof skills === "string") {
      skillsArray = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      name,
      email,
      password: hashedPassword,
      location: location || undefined,
      phone: phone || undefined,
      address: address || undefined,
      skills: skillsArray,
      bio: bio || undefined,
      image: req.file ? `/uploads/${req.file.filename}` : null, // Fixed path consistency
    });

    await user.save();
    console.log("User created:", user);

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        location: user.location,
        phone: user.phone,
        address: user.address,
        skills: user.skills,
        bio: user.bio,
        image: user.image,
        averageRating: user.averageRating,
        ratings: user.ratings,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.message === "Only JPEG/PNG images are allowed") {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        location: user.location,
        phone: user.phone,
        address: user.address,
        skills: user.skills,
        bio: user.bio,
        image: user.image,
        averageRating: user.averageRating,
        ratings: user.ratings,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// FIXED UPDATE ROUTE - This was likely the main issue
router.put(
  "/update",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("=== UPDATE REQUEST START ===");
      console.log("User ID:", req.user.id);
      console.log("Request body:", req.body);
      console.log("File:", req.file);
      console.log("Request headers:", req.headers);

      // Check if user exists first
      const existingUser = await User.findById(req.user.id);
      if (!existingUser) {
        console.log("User not found for ID:", req.user.id);
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Existing user found:", existingUser.name);

      const updates = {};

      // Handle text fields
      const textFields = ["name", "location", "phone", "address", "bio"];
      textFields.forEach((field) => {
        if (
          req.body[field] !== undefined &&
          req.body[field] !== null &&
          req.body[field] !== ""
        ) {
          updates[field] = req.body[field];
        }
      });

      // Handle skills separately
      if (req.body.skills) {
        if (typeof req.body.skills === "string") {
          updates.skills = req.body.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill.length > 0);
        } else if (Array.isArray(req.body.skills)) {
          updates.skills = req.body.skills.filter(
            (skill) => skill.trim().length > 0
          );
        }
        console.log("Skills processed:", updates.skills);
      }

      // Handle image upload
      if (req.file) {
        updates.image = `/uploads/${req.file.filename}`;
        console.log("Image path set to:", updates.image);
      }

      console.log("Final updates object:", updates);

      // Perform the update
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

      if (!updatedUser) {
        console.log("Failed to update user");
        return res.status(404).json({ message: "Failed to update user" });
      }

      console.log("User updated successfully");
      console.log("Updated user data:", {
        id: updatedUser._id,
        name: updatedUser.name,
        location: updatedUser.location,
        skills: updatedUser.skills,
      });
      console.log("=== UPDATE REQUEST END ===");

      res.json(updatedUser);
    } catch (error) {
      console.error("=== UPDATE ERROR ===");
      console.error("Error details:", error);
      console.error("Error stack:", error.stack);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          details: error.message,
        });
      }

      if (error.name === "CastError") {
        return res.status(400).json({
          message: "Invalid user ID format",
        });
      }

      res.status(500).json({
        message: "Server error during profile update",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

module.exports = router;
