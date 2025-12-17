const Article = require('../models/Article');
const Comment = require('../models/Comment');
const db = require('../config/database');

const getArticles = async (req, res) => {
  try {
    const articles = await Article.findAll();
    res.json({ success: true, articles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Get comments for this article
    const comments = await Comment.findByArticle(id);
    
    // Check if article is favorited by user
    let isFavorited = false;
    if (req.user) {
      const favoriteResult = await db.query(
        'SELECT * FROM favorites WHERE user_id = $1 AND article_id = $2',
        [req.user.id, id]
      );
      isFavorited = favoriteResult.rows.length > 0;
    }
    
    res.json({
      success: true,
      article: {
        ...article,
        comments,
        isFavorited
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Article.getCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const addComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const comment = await Comment.create({
      userId: req.user.id,
      articleId,
      content
    });
    
    // Get comment with username
    const result = await db.query(`
      SELECT c.*, u.username 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.id = $1
    `, [comment.id]);
    
    res.status(201).json({
      success: true,
      comment: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    // Check if already favorited
    const existing = await db.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND article_id = $2',
      [req.user.id, articleId]
    );
    
    if (existing.rows.length > 0) {
      // Remove from favorites
      await db.query(
        'DELETE FROM favorites WHERE user_id = $1 AND article_id = $2',
        [req.user.id, articleId]
      );
      res.json({ success: true, isFavorited: false });
    } else {
      // Add to favorites
      await db.query(
        'INSERT INTO favorites (user_id, article_id) VALUES ($1, $2)',
        [req.user.id, articleId]
      );
      res.json({ success: true, isFavorited: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, c.name as category_name 
      FROM favorites f 
      JOIN articles a ON f.article_id = a.id 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE f.user_id = $1 
      ORDER BY f.created_at DESC
    `, [req.user.id]);
    
    res.json({ success: true, articles: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getArticles,
  getArticle,
  getCategories,
  addComment,
  toggleFavorite,
  getFavorites
};