const db = require('../config/database');

const getProfileData = async (req, res) => {
  try {
    // Get user data
    const userResult = await db.query(
      'SELECT id, username, email, created_at, theme_preference FROM users WHERE id = $1',
      [req.user.id]
    );
    
    // Get latest test result
    const testResult = await db.query(
      'SELECT * FROM stress_tests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    
    // Get favorites count
    const favoritesResult = await db.query(
      'SELECT COUNT(*) as count FROM favorites WHERE user_id = $1',
      [req.user.id]
    );
    
    // Get test history
    const testHistory = await db.query(
      'SELECT * FROM stress_tests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );
    
    res.json({
      success: true,
      profile: {
        user: userResult.rows[0],
        latestTest: testResult.rows[0],
        favoritesCount: parseInt(favoritesResult.rows[0].count),
        testHistory: testHistory.rows
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getProfileData
};