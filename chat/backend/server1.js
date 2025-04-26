const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const PORT = 9000;

// Middleware


const corsOptions = {
  origin: "*",  // <-- Allow requests from any origin (for testing)
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));


  
app.use(cors());
app.use(bodyParser.json());

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ API Key is missing. Add GEMINI_API_KEY to your .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `
    You are HopeBot, a compassionate and encouraging mental health support chatbot.
    🌿 Your Goal:
    - Comfort and uplift users during challenging emotional moments.
    - Provide practical self-care suggestions and positive affirmations.
    - Avoid giving medical advice, diagnosis, or treatment. If users need professional help, guide them toward appropriate resources.
  `,
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Chat Endpoint
app.post("/api/hopebot", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(message);
    const botResponse = result?.response?.text() || "I'm here for you. 🌻";

    res.json({ response: botResponse });
  } catch (error) {
    console.error("❌ Error with HopeBot Integration:", error.message);
    res.status(500).json({ error: "Failed to connect with HopeBot." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
