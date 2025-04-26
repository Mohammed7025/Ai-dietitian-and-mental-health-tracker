# AI Dietitian and Mental Health Tracker

An AI-powered web application designed to provide personalized diet plans and mental health support based on user inputs.  
Built with Node.js, MongoDB, HTML, CSS, and JavaScript.

## Features

- 🥗 Personalized AI-generated diet plans based on user's:
  - Age, weight, height, activity level, dietary goal, food preferences, allergies, religious restrictions.
- 🧠 Mental health tracking via a supportive chatbot:
  - Mood tracking
  - Stress, sleep, and energy analysis
- 📝 Journal entry sentiment analysis (optional feature).
- 📊 Data stored securely in MongoDB Atlas.
- 💬 Chatbot trained using Google AI Studio for empathetic interactions.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **Database**: MongoDB Atlas
- **AI Tools**: Google AI Studio, ChatGPT
- **Other Tools**: VS Code, Git, GitHub

## Project Motivation

This project was developed to combine the fields of AI and healthcare, aiming to create a meaningful impact by improving both physical and mental well-being. It also serves as a foundation for future AI-driven health applications.

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/Mohammed7025/Ai-dietitian-and-mental-health-tracker.git
   
2. Navigate to the Project Directory
Once cloned, navigate to the project directory:

2. Navigate to the Project Directory
Once cloned, navigate to the project directory:

     ```bash
   
   cd Ai-dietitian-and-mental-health-tracker

3. Install Dependencies
Install all the necessary packages for the project:

    ```bash
   
   npm install
4. Set Up the Backend Server
The backend is built with Node.js. Ensure you have Node.js and npm installed on your local machine.

To run the main backend server, use the following command:

   
    
     node server.js
Once the server is running, the application should be accessible at http://localhost:3000 in your browser.

5. Set Up the Chatbot Server
The chatbot runs from server1.js. To launch the chatbot, use the following command in a new terminal window:

   ```bash
     
     node server1.js
Once the chatbot server is running, it will be accessible at http://localhost:4000 (or whichever port you have set in server1.js).

6. Set Up the Database
This project uses MongoDB Atlas for the database. Follow these steps to set up your own MongoDB database:

a. Create a MongoDB Atlas Account
Go to MongoDB Atlas and sign up for a free account.

Create a new cluster (follow the instructions on the Atlas dashboard).

b. Create a Database and Collection
In MongoDB Atlas, create a new database and a collection for your project (for example, "userData").

c. Get Your MongoDB URI
In your Atlas dashboard, navigate to Clusters → Connect → Connect your application.

Copy the connection string.

d. Set Up Environment Variables
In your local environment, you’ll need to create a .env file at the root of your project (same level as server.js and server1.js).

Add your MongoDB connection URI in the .env file:

Example .env file:

  
    
    MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
Replace "<username>" , "<password>", and "<dbname>" with your MongoDB Atlas credentials.

e. Running the Servers with Database Connection
Once your .env file is ready with the MongoDB URI, run both servers again:

     
      node server.js   # For the main backend
      node server1.js  # For the chatbot
Now both the backend and the chatbot should be fully connected to the database and operational.

7. Troubleshooting
If you encounter any issues while setting up the backend, chatbot, or database, here are some common troubleshooting steps:

Ensure you have the latest version of Node.js installed.

Double-check your MongoDB URI and ensure that your Atlas cluster is up and running.

Verify that the .env file is properly formatted and located in the root of your project.

8. Additional Notes
For any modifications to the backend or the AI features, feel free to contact me via email at mohammedroshan1020@gmail.com.

        
