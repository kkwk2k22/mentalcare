const db = require('../config/database');

class Music {
  static async findByCategory(category) {
    const query = `
      SELECT * FROM music_tracks 
      WHERE category = $1 
      ORDER BY title
    `;
    const result = await db.query(query, [category]);
    return result.rows;
  }

  static async findAll() {
    const query = 'SELECT * FROM music_tracks ORDER BY category, title';
    const result = await db.query(query);
    return result.rows;
  }

  static async getCategories() {
    const query = `
      SELECT category, COUNT(*) as track_count
      FROM music_tracks 
      GROUP BY category
    `;
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = Music;