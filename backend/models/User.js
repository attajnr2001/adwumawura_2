const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  location: { type: String },
  phone: { type: String },
  address: { type: String },
  skills: [{ type: String }],
  bio: { type: String },
  image: { type: String },
  averageRating: { type: Number, default: 0 },
  ratings: [
    {
      client: { type: String },
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
