const express = require('express');
const router = express.Router();
const {
  submitTest,
  getTestHistory,
  getLatestResult,
  getDailyTip
} = require('../controllers/testController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route
router.get('/daily-tip', getDailyTip);

// Protected routes
router.post('/submit', authMiddleware, submitTest);
router.get('/history', authMiddleware, getTestHistory);
router.get('/latest', authMiddleware, getLatestResult);

module.exports = router;