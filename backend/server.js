// server.js
const express = require('express');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const axios = require('axios'); 
require('dotenv').config(); // Ensure dotenv is imported properly

// Local Auth routes
const authLocal = require('./authlocal');
const authGoogle = require('./authgoogle'); // Google Auth routes
const { generateCombinedDietPlan } = require('./dietplan'); // Diet Plan logic
const authMiddleware = require('./middleware'); // Protected routes middleware
const User = require('./user'); // Import User model
//chatbot
// Gemini AI Configuration
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Correct Model Name


const app = express();

// ==========================
// CORS Middleware (Correctly Placed at the Top)
// ==========================
app.use(cors({
  origin: ['http://localhost:8000', 'null'], // Add 'null' for file:// origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



// ==========================
// Middleware
// ==========================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// ==========================
// HOPEBOT (Gemini AI) ROUTE
// ==========================
app.post('/api/hopebot', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
      const prompt = `
      You are HopeBot, an empathetic mental health chatbot. 
      Your goal is to provide personalized support, encouragement, and helpful advice. 
      Use a warm, positive tone.
      
      User's Message: "${message}"
      
      If the user expresses sadness, anxiety, or frustration:
      - Offer comforting words.
      - Suggest calming techniques like deep breathing, grounding exercises, or journaling.
      
      If the user sounds motivated or positive:
      - Celebrate their progress and encourage small positive actions.
      
      If unsure of the user's state:
      - Ask open-ended questions like "Can you tell me more about how you're feeling?"
      
      Always provide tailored suggestions based on their mood.
      `;

        const result = await model.generateContent(prompt);
        if (result && result.response && result.response.text) {
        const botResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text || 
        "I'm here for you. Can you tell me more?";

            res.json({ response: botResponse });
        } else {
            throw new Error('Invalid response from Gemini API');
        }

    } catch (error) {
        console.error('❌ Error with Gemini Integration:', error.message);
        res.status(500).json({ error: 'Failed to connect to Gemini', details: error.message });
    }
});

// ==========================
// JOURNALING & MOOD ANALYSIS
// ==========================
app.post('/api/journal', async (req, res) => {
    const { journalEntry } = req.body;

    if (!journalEntry) {
        return res.status(400).json({ error: "Journal entry is required" });
    }

    try {
        const prompt = `
            Analyze the following journal entry and infer the user's mental health state.
            Identify key emotions, mood trends, and potential self-care recommendations.
            Entry: "${journalEntry}"
        `;

        
        const result = await model.generateContent(prompt);

// Ensure result has data before accessing it
const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";


        if (result && result.response && result.response.text) {
          const analysis = result?.candidates?.[0]?.content?.parts?.[0]?.text || 
          "Sorry, I couldn't analyze that. Try again.";
    const moodScore = analysis.includes("positive") ? 8 :
                              analysis.includes("neutral") ? 5 :
                              analysis.includes("negative") ? 2 : 6;

            res.json({ analysis, moodScore });
        } else {
            throw new Error('Invalid response from Gemini API');
        }

    } catch (error) {
        console.error('❌ Error analyzing journal entry:', error.message);
        res.status(500).json({ error: 'Failed to analyze journal entry' });
    }
});

// ==========================
// DATABASE CONNECTION
// ==========================
const mongoURI = process.env.MONGO_URI || 'your-default-mongo-uri';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ Connection error:', err));

// ==========================
// AUTHENTICATION ROUTES
// ==========================
app.use('/api/auth/local', authLocal);
app.use('/api/auth', authGoogle);
app.get('/diet1.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css'); // Correct MIME type
  res.sendFile(path.join(__dirname, 'diet1.css'));
});

// Example route for HTML=========================

// ==========================
// GENERATE DIET PLAN ROUTE
// ==========================

app.get('/diet.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'diet.html'));
});



app.get('/generate-plan/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        console.error("Missing userId");
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        // Correct Usage with 'new'
        const user = await User.findById(new ObjectId(userId)).lean();

        if (!user) {
            console.error(`User not found with ID: ${userId}`);
            return res.status(404).send('User not found');
        }

        const plan = await generateCombinedDietPlan(user);

        console.log('Generated Plan:', plan);
        res.json(plan);

    } catch (error) {
        console.error('Error generating diet plan:', error.message);
        res.status(500).send(`Error generating diet plan: ${error.message}`);
    }
});

    
// ==========================
// SUBMIT FORM ROUTE
// ==========================
app.post('/submit', async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const age = Number(req.body.age);
    const height = Number(req.body.height);
    const weight = Number(req.body.weight);

    let bmi = null, bmiCategory = null;
    if (height && weight) {
      bmi = weight / ((height / 100) ** 2);
      bmiCategory = bmi < 18.5 ? 'Underweight'
        : bmi < 24.9 ? 'Normal weight'
        : bmi < 29.9 ? 'Overweight'
        : 'Obese';
    }

    const updateData = {
      name: req.body.name,
      age,
      gender: req.body.gender,
      height,
      weight,
      allergies: req.body.allergies || req.body['allergies[]'],
      medical_conditions: req.body.medical_conditions || req.body['medical_conditions[]'],
      medications: req.body.medications,
      deficiencies: req.body.deficiencies,
      dietType: req.body.dietType,
      religiousRestrictions: req.body.religiousRestrictions,
      foodsLikedDisliked: req.body.foodsLikedDisliked,
      activityLevel: req.body.activityLevel,
      sleepHours: req.body.sleepHours,
      weightGoal: req.body.weightGoal,
      bmi,
      bmiCategory
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Form submitted and data updated successfully!', user: updatedUser });
  } catch (error) {
    console.error('❌ Error processing form submission:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================
// SERVER LISTENING
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
