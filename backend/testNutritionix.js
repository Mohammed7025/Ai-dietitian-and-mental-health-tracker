// testNutritionix.js
const fetch = require('node-fetch'); // If using Node.js, install with: npm install node-fetch

async function testNutritionix(query) {
  try {
    const response = await fetch(`https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'x-app-id': '55ea8cb7', // Your Nutritionix App ID
        'x-app-key': 'f8632a530de53862dd9e200e7542a44f', // Your Nutritionix App Key
        'x-remote-user-id': '0'
      }
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

testNutritionix('oatmeal');
