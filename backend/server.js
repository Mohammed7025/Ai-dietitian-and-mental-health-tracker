// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Local Auth routes
const authLocal = require('./authlocal');
// Google Auth routes
const authGoogle = require('./authgoogle');

// Example diet plan
const { generateCombinedDietPlan } = require('./dietplan');
// If you have a protected route, import the middleware
const authMiddleware = require('./middleware');

// Import user model if needed
const User = require('./user');

const app = express();
//cors
app.use(cors());
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
//mogodb password:rf0CahdJUIaxrQYh
const mongoURI = 'mongodb+srv://jaquar1020:rf0CahdJUIaxrQYh@chatbot.d60sq.mongodb.net/?retryWrites=true&w=majority&appName=chatbot';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Connection error:', err));

// Local auth endpoints
// /api/auth/local/register
// /api/auth/local/login
app.use('/api/auth/local', authLocal);

// Google OAuth endpoints
// /api/auth/google
// /api/auth/google/callback
app.use('/api/auth', authGoogle);

/**
 * Example protected route: Generate diet plan
 * If you want to require login, use authMiddleware
 */
app.get('/generate-plan/:userId', /*authMiddleware,*/ async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean();
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Example: compute BMI if missing
    if (!user.bmi && user.height && user.weight) {
      const heightInMeters = user.height / 100;
      user.bmi = user.weight / (heightInMeters * heightInMeters);

      // For demonstration
      if (user.bmi < 18.5) {
        user.bmiCategory = 'Underweight';
      } else if (user.bmi < 24.9) {
        user.bmiCategory = 'Normal weight';
      } else if (user.bmi < 29.9) {
        user.bmiCategory = 'Overweight';
      } else {
        user.bmiCategory = 'Obese';
      }
    }

    const plan = await generateCombinedDietPlan(user);
    res.json(plan);
  } catch (error) {
    console.error('Error generating diet plan:', error);
    res.status(500).send('Error generating diet plan');
  }
});

const PORT = process.env.PORT || 5000;
// Add this route in server.js before app.listen():
app.post('/submit', async (req, res) => {
  try {
    console.log("Form Data Received:", req.body);
    
    // Convert numeric fields if necessary
    const age = Number(req.body.age);
    const height = Number(req.body.height);
    const weight = Number(req.body.weight);

    // Create a new document using the User model
    const newUser = new User({
      ...req.body,
      age,
      height,
      weight
    });
    
    // Save the document to MongoDB Atlas
    await newUser.save();
    
    res.status(200).json({ message: 'Form submitted and data saved successfully!' });
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
