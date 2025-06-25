require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

const app = express();

// Middleware
app.use(cors({ origin: "https://adwumawura.onrender.com" }));
app.use(express.json());

// Serve static files (for images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
if (!process.env.MONGO_URL) {
  console.error("Error: MONGO_URL is not defined in .env file");
  process.exit(1);
}
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Artisan Hub API" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
