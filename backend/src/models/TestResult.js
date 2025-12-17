const db = require('../config/database');

class TestResult {
  static async create({ userId, score, level, recommendations }) {
    const result = await db.query(
      'INSERT INTO stress_tests (user_id, score, level, recommendations) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, score, level, recommendations]
    );
    
    return result.rows[0];
  }

  static async findByUser(userId) {
    const result = await db.query(
      'SELECT * FROM stress_tests WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return result.rows;
  }

  static async getLatest(userId) {
    const result = await db.query(
      'SELECT * FROM stress_tests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    
    return result.rows[0];
  }
}

module.exports = TestResult;