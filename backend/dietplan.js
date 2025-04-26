const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const User = require('./user');
const { DecisionTreeClassifier } = require('ml-cart');

// Load the dataset from CSV
const dataset = [];
fs.createReadStream(path.join(__dirname, 'dietplan.csv'))
  .pipe(csv())
  .on('data', (row) => {
    dataset.push(row);
  })
  .on('end', () => {
    console.log('✅ Dataset loaded successfully.');
  });

// Wait until dataset is loaded before generating plan
const waitForDataset = new Promise((resolve) => {
  if (dataset.length) {
    resolve();
  } else {
    fs.createReadStream(path.join(__dirname, 'dietplan.csv'))
      .pipe(csv())
      .on('data', (row) => dataset.push(row))
      .on('end', () => resolve());
  }
});

// --- Mapping dictionaries for decision tree feature encoding ---
const bmiMapping = { 'underweight': 0, 'normal weight': 1, 'overweight': 2, 'obese': 3 };
const weightGoalMapping = { 'maintain': 0, 'gain': 1, 'lose': 2, 'muscle gain': 3 };
const sleepMapping = { '< 5 hours': 0, '5-7 hours': 1, '> 7 hours': 2 };
const dietTypeMapping = { 'vegetarian': 0, 'vegan': 1, 'keto': 2, 'low carb': 3, 'mediterranean': 4 };
const religiousMapping = { 'halal': 0, 'kosher': 1, 'none': 2 };
const activityMapping = { 'sedentary': 0, 'moderate': 1, 'active': 2 };

// Global variable to cache the decision tree model
let decisionTreeModel = null;
let trainingData = [];
let trainingLabels = [];

// Function to prepare training data and train the decision tree model
function trainDecisionTree() {
  // Prepare training data from the dataset.
  // We assume each row in the CSV has the necessary fields.
  trainingData = [];
  trainingLabels = [];
  dataset.forEach((row, index) => {
    // Normalize/cast text to lowercase and trim spaces
    const bmiCat = row['BMI Category'].toLowerCase().trim();
    const weightGoal = row['Weight Goal'].toLowerCase().trim();
    const sleepHrs = row['Sleep Hours'].toLowerCase().trim();
    const dietType = row['Diet Type'].toLowerCase().trim();
    const religious = row['Religious Restriction'].toLowerCase().trim();
    const activity = row['Activity Level'].toLowerCase().trim();

    // Create a numeric feature vector
    const features = [
      bmiMapping[bmiCat] !== undefined ? bmiMapping[bmiCat] : -1,
      weightGoalMapping[weightGoal] !== undefined ? weightGoalMapping[weightGoal] : -1,
      sleepMapping[sleepHrs] !== undefined ? sleepMapping[sleepHrs] : -1,
      dietTypeMapping[dietType] !== undefined ? dietTypeMapping[dietType] : -1,
      religiousMapping[religious] !== undefined ? religiousMapping[religious] : -1,
      activityMapping[activity] !== undefined ? activityMapping[activity] : -1
    ];
    trainingData.push(features);
    trainingLabels.push(index); // Use the index as the label
  });

  // Train the decision tree classifier
  decisionTreeModel = new DecisionTreeClassifier();
  decisionTreeModel.train(trainingData, trainingLabels);
}

// Function to predict a fallback meal plan using the decision tree
function decisionTreePredict(user) {
  // Train the model if it hasn't been trained yet
  if (!decisionTreeModel) {
    trainDecisionTree();
  }
  // Prepare user feature vector using same mappings
  // Assume user object has: height, weight, weightGoal, sleepHours, dietType, religiousRestrictions, activityLevel
  const heightInMeters = user.height / 100;
  const bmi = user.weight / (heightInMeters * heightInMeters);
  let bmiCategory = '';
  if (bmi < 18.5) {
    bmiCategory = 'underweight';
  } else if (bmi >= 18.5 && bmi < 24.9) {
    bmiCategory = 'normal weight';
  } else if (bmi >= 25 && bmi < 29.9) {
    bmiCategory = 'overweight';
  } else {
    bmiCategory = 'obese';
  }
  // Normalize text inputs
  const weightGoal = user.weightGoal.toLowerCase().trim();
  const sleepHrs = user.sleepHours.toLowerCase().trim();
  const dietType = user.dietType.toLowerCase().trim();
  const religious = user.religiousRestrictions.toLowerCase().trim();
  const activity = user.activityLevel.toLowerCase().trim();

  const userFeatures = [
    bmiMapping[bmiCategory] !== undefined ? bmiMapping[bmiCategory] : -1,
    weightGoalMapping[weightGoal] !== undefined ? weightGoalMapping[weightGoal] : -1,
    sleepMapping[sleepHrs] !== undefined ? sleepMapping[sleepHrs] : -1,
    dietTypeMapping[dietType] !== undefined ? dietTypeMapping[dietType] : -1,
    religiousMapping[religious] !== undefined ? religiousMapping[religious] : -1,
    activityMapping[activity] !== undefined ? activityMapping[activity] : -1
  ];

  // Use the decision tree to predict the best matching row index
  const predictedLabel = decisionTreeModel.predict([userFeatures])[0];
  // Retrieve the predicted meal plan from the dataset
  return dataset[predictedLabel];
}

// Generate personalized diet plan
async function generateCombinedDietPlan(user) {
  await waitForDataset;

  const heightInMeters = user.height / 100;
  const bmi = user.weight / (heightInMeters * heightInMeters);
  let bmiCategory;

  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
  } else if (bmi < 24.9) {
    bmiCategory = 'Normal weight';
  } else if (bmi < 29.9) {
    bmiCategory = 'Overweight';
  } else {
    bmiCategory = 'Obese';
  }

  let sleepCategory;
  if (user.sleepHours < 5) sleepCategory = '< 5 hours';
  else if (user.sleepHours > 7) sleepCategory = '> 7 hours';
  else sleepCategory = '5-7 hours';

  // Existing rule-based filtering logic
  let matchingMeal = dataset.find((item) =>
    item['BMI Category'].toLowerCase().trim() === bmiCategory.toLowerCase().trim() &&
    item['Weight Goal'].toLowerCase().trim() === user.weightGoal.toLowerCase().trim() &&
    item['Sleep Hours'].toLowerCase().trim() === sleepCategory.toLowerCase().trim() &&
    (item['Diet Type'].toLowerCase().includes(user.dietType.toLowerCase().trim()) || 
     item['Diet Type'].toLowerCase() === 'any') &&
    (user.religiousRestrictions.toLowerCase().trim().includes(item['Religious Restriction'].toLowerCase().trim()) || 
     item['Religious Restriction'].toLowerCase().trim() === 'none') &&
    (item['Activity Level'].toLowerCase().trim() === user.activityLevel.toLowerCase().trim() || 
     item['Activity Level'].toLowerCase().trim() === 'any') &&
    // Exclude allergens
    (!user.allergies || !item['Allergens'].toLowerCase().includes(user.allergies.toLowerCase().trim())) &&
    // Include suitable medical conditions
    (!user.medical_conditions || 
     item['Medical Conditions'].toLowerCase().includes(user.medical_conditions.toLowerCase().trim()))
  );

  // If no exact match found, fall back to decision tree prediction
  if (!matchingMeal) {
    console.log('⚠️ No exact match found, using decision tree fallback.');
    matchingMeal = decisionTreePredict(user);
  }
  
  const plan = matchingMeal
    ? {
        bmi: bmi.toFixed(2),
        bmiCategory,
        totalCalories: matchingMeal['Total Calories'] || "N/A",
        breakfast: matchingMeal['Breakfast'] || "No suitable meal found",
        breakfastCalories: matchingMeal['Breakfast_Calories'] || "N/A",
        breakfastDescription: matchingMeal['Breakfast_Description'] || "N/A",
        morningSnack: matchingMeal['Morning Snack'] || "N/A",
        morningSnackCalories: matchingMeal['Morning Snack_Calories'] || "N/A",
        morningSnackDescription: matchingMeal['Morning Snack_Description'] || "N/A",
        lunch: matchingMeal['Lunch'] || "N/A",
        lunchCalories: matchingMeal['Lunch_Calories'] || "N/A",
        lunchDescription: matchingMeal['Lunch_Description'] || "N/A",
        eveningSnack: matchingMeal['Evening Snack'] || "N/A",
        eveningSnackCalories: matchingMeal['Evening Snack_Calories'] || "N/A",
        eveningSnackDescription: matchingMeal['Evening Snack_Description'] || "N/A",
        dinner: matchingMeal['Dinner'] || "N/A",
        dinnerCalories: matchingMeal['Dinner_Calories'] || "N/A",
        dinnerDescription: matchingMeal['Dinner_Description'] || "N/A",
        allergens: matchingMeal['Allergens'] || "N/A",
        medicalSuitability: matchingMeal['Medical Conditions'] || "N/A",
        dietType: matchingMeal['Diet Type'] || "N/A",
        religiousRestriction: matchingMeal['Religious Restriction'] || "N/A"
      }
    : { message: "No suitable meal found. Please consult a dietitian." };

  // Update the user's record with the generated plan
  await User.findByIdAndUpdate(
    user._id,
    { dietPlan: plan },
    { new: true } // Return the updated user document
  );

  return plan;
}

module.exports = { generateCombinedDietPlan };
