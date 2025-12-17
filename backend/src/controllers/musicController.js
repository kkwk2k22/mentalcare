const db = require('../config/database');

exports.getMusicTracks = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM music ORDER BY category, title');
    res.json({ success: true, tracks: result.rows });
  } catch (error) {
    console.error('Error fetching music:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMusicByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const result = await db.query(
      'SELECT * FROM music WHERE category = $1 ORDER BY title',
      [category]
    );
    res.json({ success: true, tracks: result.rows });
  } catch (error) {
    console.error('Error fetching music by category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMusicCategories = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT DISTINCT category FROM music ORDER BY category'
    );
    const categories = result.rows.map(row => row.category);
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching music categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
};