const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  require('dotenv').config(); // Ensure dotenv is imported to load .env variables
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ API Key is missing. Add GEMINI_API_KEY to your .env file.");
    process.exit(1);
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", // Ensure this matches your model version
    systemInstruction: `
      You are HopeBot, a compassionate and encouraging mental health support chatbot. 
      🌿 Your Goal:
      - Comfort and uplift users during challenging emotional moments.
      - Provide practical self-care suggestions and positive affirmations.
      - Offer helpful insights without judgment.
      - Avoid giving medical advice, diagnosis, or treatment. If users need professional help, guide them toward appropriate resources.
  
      🌻 Your Personality:
      - Warm, calm, and empathetic in tone.
      - Supportive and motivational, always encouraging positive coping strategies.
      - Kind and understanding, never harsh or dismissive.
  
      💬 Response Principles:
      1. **Acknowledge the user's feelings with empathy.**
      2. **Offer gentle encouragement or positive affirmations.**
      3. **Provide practical self-care strategies or grounding exercises.**
      4. **Encourage healthy coping mechanisms without judgment.**
      5. **Avoid clinical language; instead, focus on being conversational and caring.**
  
      🚨 **Crisis Support:** If a user shows signs of distress or harm:
      - Respond with compassion and urge them to seek immediate help from trusted friends, family, or a mental health professional.
    `,
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  // Function to handle user messages
  async function run(userInput) {
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [], // Add session history logic if needed
      });
  
      const result = await chatSession.sendMessage(userInput);
  
      if (result && result.response && result.response.text) {
        console.log(`🟢 HopeBot: ${result.response.text()}`);
      } else {
        console.error("❌ Failed to retrieve a proper response from HopeBot.");
      }
    } catch (error) {
      console.error(`❌ Error in HopeBot response: ${error.message}`);
    }
  }
  
  // Sample conversation flow
  (async () => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    readline.question("👤 You: ", async (userInput) => {
      await run(userInput);
      readline.close();
    });
  })();
  