// dietplan.js

const axios = require('axios');

// Rule-Based Algorithm
function generateDietPlanRuleBased(user) {
  let plan = {};

  // Base recommendations based on BMI Category
  switch (user.bmiCategory) {
    case 'Underweight':
      plan.calorieAdvice = 'Increase calories by 10-20% above maintenance.';
      break;
    case 'Normal weight':
      plan.calorieAdvice = 'Maintain current calorie intake with balanced meals.';
      break;
    case 'Overweight':
      plan.calorieAdvice = 'Reduce calories by 10-15% below maintenance, focus on whole foods.';
      break;
    case 'Obese':
      plan.calorieAdvice = 'Reduce calories by 20% or more below maintenance (with medical supervision).';
      break;
    default:
      plan.calorieAdvice = 'Maintain balanced nutrition.';
  }

  // Adjustments based on Medical Conditions
  plan.specialNotes = '';
  if (user.medical_conditions && Array.isArray(user.medical_conditions)) {
    if (user.medical_conditions.includes('Diabetes')) {
      plan.specialNotes += 'Focus on low GI foods and avoid refined sugars. ';
    }
    if (user.medical_conditions.includes('Hypertension')) {
      plan.specialNotes += 'Limit sodium and incorporate potassium-rich foods. ';
    }
  }

  // Exclude Allergens
  plan.allergyNotes = '';
  if (user.allergies && Array.isArray(user.allergies)) {
    if (user.allergies.includes('Dairy')) {
      plan.allergyNotes += 'Exclude dairy products and consider plant-based alternatives. ';
    }
    if (user.allergies.includes('Gluten')) {
      plan.allergyNotes += 'Use gluten-free grains like quinoa and rice. ';
    }
  }

  // Dietary Preference Adjustments
  plan.dietNotes = '';
  if (user.dietType) {
    if (user.dietType.toLowerCase() === 'vegan') {
      plan.dietNotes += 'Ensure adequate protein from legumes, tofu, and tempeh. ';
    }
    if (user.dietType.toLowerCase() === 'keto') {
      plan.dietNotes += 'Emphasize healthy fats and low-carb vegetables. ';
    }
  }

  // Weight Goal Adjustments
  plan.goalNotes = '';
  if (user.weightGoal) {
    if (user.weightGoal === 'gain') {
      plan.goalNotes += 'Increase calorie intake with nutrient-dense foods and proteins. ';
    } else if (user.weightGoal === 'lose') {
      plan.goalNotes += 'Focus on a slight calorie deficit while maintaining protein levels. ';
    } else if (user.weightGoal === 'muscleGain') {
      plan.goalNotes += 'Increase protein intake and incorporate strength training. ';
    }
  }

  return plan;
}

// Decision Tree Algorithm (Stub example)
async function generateDietPlanDecisionTree(user) {
  try {
    // Create a feature vector (customize as needed)
    const featureVector = {
      bmi: user.bmi,
      age: user.age,
      activityLevel: user.activityLevel,
    };

    // Replace with the URL of your decision tree service
    const response = await axios.post('http://localhost:6000/predict', featureVector);
    return response.data.predictedPlan;
  } catch (error) {
    console.error('Decision tree prediction error:', error);
    return null;
  }
}

// Combined Algorithm
async function generateCombinedDietPlan(user) {
  const ruleBasedPlan = generateDietPlanRuleBased(user);
  const decisionTreePlan = await generateDietPlanDecisionTree(user);

  return {
    ruleBased: ruleBasedPlan,
    decisionTree: decisionTreePlan,
  };
}

module.exports = {
  generateDietPlanRuleBased,
  generateDietPlanDecisionTree,
  generateCombinedDietPlan,
};
