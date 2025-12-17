const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticle,
  getCategories,
  addComment,
  toggleFavorite,
  getFavorites
} = require('../controllers/articleController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', getArticles);
router.get('/categories', getCategories);
router.get('/:id', getArticle);

// Protected routes
router.post('/:articleId/comments', authMiddleware, addComment);
router.post('/:articleId/favorite', authMiddleware, toggleFavorite);
router.get('/user/favorites', authMiddleware, getFavorites);

module.exports = router;