const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create user
    const user = await User.create({ username, email, password });
    
    // Generate token
    const token = generateToken(user.id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await User.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        theme_preference: user.theme_preference
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    const user = await User.updateTheme(req.user.id, theme);
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateTheme
};