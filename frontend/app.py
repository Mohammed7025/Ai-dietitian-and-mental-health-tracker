
from pymongo import MongoClient

# Replace <USERNAME> and <PASSWORD> with your MongoDB Atlas credentials
MONGO_URI = "mongodb+srv://<mohammedroshan1020>:<roshan>@cluster0.mongodb.net/dietitian"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["dietitian"]  # Database
collection = db["users"]  # Collection (like a table in SQL)

print("🔥 Successfully connected to MongoDB!")

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Nutritionix API credentials
NUTRITIONIX_APP_ID = "55ea8cb7"
NUTRITIONIX_APP_KEY = "9d80b7a502d6cb4830af0f5efce7f2c0"

def fetch_food_data(query):
    """Fetch detailed food nutrition data from Nutritionix API."""
    url = "https://trackapi.nutritionix.com/v2/natural/nutrients"
    headers = {
        "x-app-id": NUTRITIONIX_APP_ID,
        "x-app-key": NUTRITIONIX_APP_KEY,
        "Content-Type": "application/json"
    }
    data = {"query": query}

    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    return {"error": response.text}

@app.route('/')
def home():
    return jsonify({"message": "Flask Backend is Running!"})


@app.route('/get-diet-plan', methods=['POST'])
def get_diet_plan():
    """Process user input and return diet recommendations."""
    data = request.json
    
    height = float(data['height'])
    weight = float(data['weight'])
    age = int(data['age'])
    preferences = data.get('preferences', '')
    allergies = data.get('allergies', '').split(',')

    # Calculate BMR (Basal Metabolic Rate)
    bmr = 10 * weight + 6.25 * height * 100 - 5 * age

    # Fetch food data based on preferences
    food_data = fetch_food_data(preferences)
    print("API Response:", food_data)  # Debugging line

    results = []
    for item in food_data.get("foods", []):
        # Extract nutrients safely
        calories = item.get("nf_calories", "N/A")
        protein = item.get("nf_protein", "N/A")
        carbs = item.get("nf_total_carbohydrate", "N/A")
        fat = item.get("nf_total_fat", "N/A")
        
        print(f"Food: {item['food_name']}, Calories: {calories}, Protein: {protein}, Carbs: {carbs}, Fat: {fat}")  # Debugging output

        if not any(allergen in item['food_name'].lower() for allergen in allergies):
            results.append({
                "food": item['food_name'],
                "calories": calories,
                "protein": protein,
                "carbs": carbs,
                "fat": fat,
                "serving": f"{item.get('serving_qty', 1)} {item.get('serving_unit', '')}"
            })

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
