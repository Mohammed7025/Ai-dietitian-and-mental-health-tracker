// user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true }, // Typically required for local auth
  password: { type: String }, // Optional for Google OAuth users
  googleId: { type: String, unique: true, sparse: true }, // For users signed in via Google
  googleEmail: { type: String }, // The email provided by Google
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  allergies: String,
  medical_conditions: String,
  medications: String,
  deficiencies: String,
  dietType: String,
  religiousRestrictions: String,
  foodsLikedDisliked: String,
  activityLevel: String,
  sleepHours: { type: String, enum: ["< 5 hours", "5-7 hours", "> 7 hours"] },
  weightGoal: String,
  bmi: Number,
  bmiCategory: String,
  dietPlan: {
    type: Object, // Store the full diet plan object
    default: {}
},
}, { timestamps: true }); // Optionally adds createdAt and updatedAt fields

const User = mongoose.model("User", userSchema, "user");

module.exports = User;
