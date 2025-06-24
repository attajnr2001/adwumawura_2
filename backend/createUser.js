require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const createUser = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in .env file");
    }
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");

    // Check if user1 already exists
    const existingUser = await User.findOne({ username: "user1" });
    if (existingUser) {
      console.log("User with username 'user1' already exists");
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("123456", saltRounds);

    // Create new user1
    const newUser = new User({
      username: "user1",
      password: hashedPassword,
      name: "Ama Diana",
      location: "Akim Oda, Ghana",
      phone: "+233 24 567 8901",
      address: "Comm 6, ER, Ghana",
      skills: ["Baker"],
      bio: "Passionate baker with 8 years of experience bread.",
      image: "https://picsum.photos/seed/user1/200/200",
      averageRating: 4.7,
      ratings: [
        {
          client: "Akua Mensah",
          rating: 4.8,
          comment: "Excellent work on my dining table!",
          timestamp: new Date("2025-06-15"),
        },
        {
          client: "Kwabena Asante",
          rating: 4.6,
          comment: "Great craftsmanship, delivered on time.",
          timestamp: new Date("2025-06-10"),
        },
      ],
    });

    // Save user1 to database
    await newUser.save();
    console.log("User created successfully:", newUser.username);
  } catch (error) {
    console.error("Error creating user1:", error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("MongoDB Connection Closed");
  }
};

// Run the script
createUser();
