// user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String }, // Optional for Google OAuth users
  googleId: { type: String, unique: true, sparse: true }, // For users signed in via Google
  googleEmail: { type: String }, // The email provided by Google
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  allergies: [String],
  medical_conditions: [String],
  medications: String,
  deficiencies: String,
  dietType: String,
  religiousRestrictions: String,
  foodsLikedDisliked: String,
  activityLevel: String,
  sleepHours: Number,
  weightGoal: String,
  bmi: Number,
  bmiCategory: String,
}, { timestamps: true }); // Optionally add createdAt/updatedAt

const User = mongoose.model("User", userSchema, "user");

module.exports = User;
