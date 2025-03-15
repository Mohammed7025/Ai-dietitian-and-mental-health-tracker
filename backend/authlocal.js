// authLocal.js
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./user'); // The User model

const router = express.Router();

// Register (Local)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Local registration error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login (Local)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // At this point, user is authenticated locally
    // Typically, you'd issue a JWT or session here
    res.json({ message: 'Local login successful!' });
  } catch (error) {
    console.error('Local login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

module.exports = router;
