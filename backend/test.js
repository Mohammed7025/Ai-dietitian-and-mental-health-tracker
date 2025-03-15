const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://jaquar1020:9YN14mBnWhYEmS6S@chatbot.d60sq.mongodb.net/?retryWrites=true&w=majority&appName=chatbot';

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
