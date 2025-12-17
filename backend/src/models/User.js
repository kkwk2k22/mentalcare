const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT id, username, email, created_at, theme_preference FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0];
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async updateTheme(userId, theme) {
    const result = await db.query(
      'UPDATE users SET theme_preference = $1 WHERE id = $2 RETURNING *',
      [theme, userId]
    );
    
    return result.rows[0];
  }
}

module.exports = User;