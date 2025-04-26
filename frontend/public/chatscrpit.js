// Chat Interaction
document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userInput = document.getElementById('user-input').value;

    const response = await fetch('http://localhost:5000/api/hopebot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
    });

    const data = await response.json();
    
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<div class="user-message">${userInput}</div>`;
    chatBox.innerHTML += `<div class="bot-message">${data.response}</div>`;

    document.getElementById('user-input').value = ''; // Clear input after sending
});


// Journaling Analysis
document.getElementById('analyze-journal').addEventListener('click', async () => {
    const journalEntry = document.getElementById('journal-entry').value;

    const response =fetch('http://localhost:5000/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalEntry })
    })
    

    const data = await response.json();
    document.getElementById('journal-analysis-result').textContent = `Mood Analysis: ${data.analysis}`;
    renderGraph(data.moodScore);
});

// Graph Visualization
async function renderGraph(moodScore) {
    const ctx = document.getElementById('moodChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Today'],
            datasets: [{
                label: 'Mood Score',
                data: [6, 7, 8, moodScore],
                borderColor: 'blue',
                fill: false
            }]
        },
        options: {
            scales: { y: { beginAtZero: true, max: 10 } }
        }
    });
}
