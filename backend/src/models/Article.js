const db = require('../config/database');

class Article {
  static async findAll() {
    const result = await db.query(`
      SELECT a.*, c.name as category_name 
      FROM articles a 
      LEFT JOIN categories c ON a.category_id = c.id 
      ORDER BY a.created_at DESC
    `);
    
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(`
      SELECT a.*, c.name as category_name 
      FROM articles a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.id = $1
    `, [id]);
    
    if (result.rows.length > 0) {
      await db.query(
        'UPDATE articles SET read_count = read_count + 1 WHERE id = $1',
        [id]
      );
    }
    
    return result.rows[0];
  }

  static async findByCategory(categoryId) {
    const result = await db.query(
      'SELECT * FROM articles WHERE category_id = $1 ORDER BY created_at DESC',
      [categoryId]
    );
    
    return result.rows;
  }

  static async getCategories() {
    const result = await db.query('SELECT * FROM categories ORDER BY name');
    return result.rows;
  }
}

module.exports = Article;