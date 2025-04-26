// Global arrays for in-memory mood tracking
let moodData = [];
let moodLabels = [];
let moodChart; // To store the Chart.js instance

// Chat Interaction
document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userInputElement = document.getElementById('user-input');
    const userInput = userInputElement.value.trim();
    if (!userInput) return;

    const chatBox = document.getElementById('chat-box');

    // Display the user's message
    chatBox.innerHTML += `<div class="chat-message user-message">You: ${userInput}</div>`;
    userInputElement.value = ""; // Clear input

    try {
        const response = await fetch('http://localhost:9000/api/hopebot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput })
        });

        const data = await response.json();
        chatBox.innerHTML += `<div class="chat-message bot-message">MindMate: ${data.response}</div>`;
    } catch (error) {
        console.error("❌ Error communicating with MindMate:", error);
        chatBox.innerHTML += `<div class="chat-message bot-message">Error connecting to MindMate. Please try again later.</div>`;
    }

    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom

    // Perform mood analysis on the user's message
    analyzeMood(userInput);
});

// Basic Mood Analysis (keyword-based)
// This function assigns a mood score based on positive/negative words in the message.
function analyzeMood(message) {
    const positiveWords = ['happy', 'calm', 'relaxed', 'excited', 'motivated'];
    const negativeWords = ['sad', 'angry', 'stressed', 'worried', 'depressed'];

    let moodScore = 3; // Start with a neutral baseline score

    positiveWords.forEach(word => {
        if (message.toLowerCase().includes(word)) moodScore += 1;
    });

    negativeWords.forEach(word => {
        if (message.toLowerCase().includes(word)) moodScore -= 1;
    });

    // Clamp the score between 1 and 5
    moodScore = Math.max(1, Math.min(moodScore, 5));

    // Save the score and current time label for the graph
    moodData.push(moodScore);
    moodLabels.push(new Date().toLocaleTimeString());

    updateMoodChart();
}

// Graph Visualization using Chart.js
function updateMoodChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');

    // If a chart already exists, destroy it before creating a new one
    if (moodChart) {
        moodChart.destroy();
    }

    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: moodLabels,
            datasets: [{
                label: 'Mood Score',
                data: moodData,
                borderColor: 'blue',
                fill: false,
                tension: 0.2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    min: 1,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Mood Score (1-5)'
                    }
                }
            }
        }
    });
}

// Clear Chat Button functionality
document.getElementById('clearChat').addEventListener('click', () => {
    // Clear chat messages
    document.getElementById('chat-box').innerHTML = '';
    // Reset mood data and labels
    moodData = [];
    moodLabels = [];
    // Destroy the chart if it exists
    if (moodChart) {
        moodChart.destroy();
        moodChart = null;
    }
});
