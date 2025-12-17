const TestResult = require('../models/TestResult');
const db = require('../config/database');

const calculateStressLevel = (score) => {
  if (score <= 10) return 'Low stress';
  if (score <= 20) return 'Medium stress';
  return 'High stress';
};

const getRecommendations = (level) => {
  const recommendations = {
    'Low stress': [
      'Continue your healthy habits',
      'Practice mindfulness regularly',
      'Maintain work-life balance'
    ],
    'Medium stress': [
      'Take regular breaks',
      'Try relaxation techniques',
      'Talk to friends or family',
      'Exercise regularly'
    ],
    'High stress': [
      'Seek professional help if needed',
      'Practice deep breathing daily',
      'Take time off if possible',
      'Establish a support system',
      'Prioritize self-care activities'
    ]
  };
  
  return recommendations[level] || [];
};

const submitTest = async (req, res) => {
  try {
    const { answers } = req.body; // Array of answer values
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid answers format' });
    }
    
    // Calculate total score (each answer 1-5 points)
    const score = answers.reduce((sum, answer) => sum + answer, 0);
    const level = calculateStressLevel(score);
    const recommendations = getRecommendations(level).join('; ');
    
    // Save test result
    const testResult = await TestResult.create({
      userId: req.user.id,
      score,
      level,
      recommendations
    });
    
    res.status(201).json({
      success: true,
      result: {
        score,
        level,
        recommendations: getRecommendations(level),
        date: testResult.created_at
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getTestHistory = async (req, res) => {
  try {
    const history = await TestResult.findByUser(req.user.id);
    res.json({ success: true, history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getLatestResult = async (req, res) => {
  try {
    const latest = await TestResult.getLatest(req.user.id);
    res.json({ success: true, latest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getDailyTip = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM tips ORDER BY RANDOM() LIMIT 1'
    );
    
    res.json({ success: true, tip: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  submitTest,
  getTestHistory,
  getLatestResult,
  getDailyTip
};