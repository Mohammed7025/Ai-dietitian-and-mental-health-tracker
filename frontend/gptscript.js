const chatBox = document.getElementById('chatBox');
const moodData = [];
const moodLabels = [];

async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (!userInput.trim()) return;

    // Display user message
    appendMessage('You: ' + userInput, 'user');

    // Send the user input to GPT through your secure backend
    try {
        const response = await fetch("http://localhost:5000/api/chat", {  // Updated to use your server
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput })  // Removed API key from frontend
        });

        const data = await response.json();

        if (data.error) {
            appendMessage('MindMend AI: Sorry, something went wrong. Please try again.', 'bot');
        } else {
            const botMessage = data.response;
            appendMessage('MindMend AI: ' + botMessage, 'bot');
            analyzeMood(userInput); // Mood analysis for visualization
        }
    } catch (error) {
        console.error('Error communicating with backend:', error);
        appendMessage('MindMend AI: Error connecting to the server. Please try again later.', 'bot');
    }
}

// Display chat messages
function appendMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.className = sender;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Mood Analysis - Basic Sentiment Tracking
function analyzeMood(message) {
    const positiveWords = ['happy', 'calm', 'relaxed', 'excited', 'motivated'];
    const negativeWords = ['sad', 'angry', 'stressed', 'worried', 'depressed'];

    let moodScore = 3; // Neutral baseline
    positiveWords.forEach(word => {
        if (message.toLowerCase().includes(word)) moodScore += 1;
    });

    negativeWords.forEach(word => {
        if (message.toLowerCase().includes(word)) moodScore -= 1;
    });

    moodData.push(Math.max(1, Math.min(moodScore, 5)));
    moodLabels.push(new Date().toLocaleTimeString());

    updateMoodChart();
}

// Generate Graph (Chart.js)
function updateMoodChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: moodLabels,
            datasets: [{
                label: 'Mood Levels',
                data: moodData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            scales: {
                y: { min: 1, max: 5, title: { display: true, text: 'Mood Scale (1-5)' } }
            }
        }
    });
}
