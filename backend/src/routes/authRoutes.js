const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getProfile, updateTheme } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Validation rules
const registerValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authMiddleware, getProfile);
router.put('/theme', authMiddleware, updateTheme);

module.exports = router;