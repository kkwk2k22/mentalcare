const db = require('../config/database');

class Comment {
  static async create({ userId, articleId, content }) {
    const result = await db.query(
      'INSERT INTO comments (user_id, article_id, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, articleId, content]
    );
    
    return result.rows[0];
  }

  static async findByArticle(articleId) {
    const result = await db.query(`
      SELECT c.*, u.username 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.article_id = $1 
      ORDER BY c.created_at DESC
    `, [articleId]);
    
    return result.rows;
  }
}

module.exports = Comment;