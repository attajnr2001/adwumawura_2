const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../Uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(UploadsDir, { recursive: true });
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
    // Skip file processing if no file is provided
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
      image: req.file ? `/Uploads/${req.file.filename}` : null,
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

router.put(
  "/update",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("Update request received");
      console.log("User ID:", req.user.id);
      console.log("Request body:", req.body);
      console.log("File:", req.file);

      const updates = { ...req.body };

      if (req.file) {
        updates.image = `/Uploads/${req.file.filename}`;
        console.log("Image path set to:", updates.image);
      }

      const allowedUpdates = [
        "name",
        "location",
        "phone",
        "address",
        "skills",
        "bio",
        "image",
      ];

      const updateKeys = Object.keys(updates);
      const isValidOperation = updateKeys.every((update) =>
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        console.log("Invalid updates attempted:", updateKeys);
        return res.status(400).json({
          message: "Invalid updates",
          attempted: updateKeys,
          allowed: allowedUpdates,
        });
      }

      if (updates.skills && typeof updates.skills === "string") {
        updates.skills = updates.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0);
        console.log("Skills processed:", updates.skills);
      }

      Object.keys(updates).forEach((key) => {
        if (
          updates[key] === "" ||
          updates[key] === null ||
          updates[key] === undefined
        ) {
          delete updates[key];
        }
      });

      console.log("Final updates object:", updates);

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        {
          new: true,
          runValidators: true,
          select: "-password",
        }
      );

      if (!user) {
        console.log("User not found for ID:", req.user.id);
        return res.status(404).json({ message: "User not found" });
      }

      console.log("User updated successfully:", user);
      res.json(user);
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({
        message: "Server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

module.exports = router;
