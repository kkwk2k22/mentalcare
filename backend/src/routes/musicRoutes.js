const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');

// Get all music tracks
router.get('/', musicController.getMusicTracks);

// Get music by category
router.get('/category/:category', musicController.getMusicByCategory);

// Get all music categories
router.get('/categories', musicController.getMusicCategories);

module.exports = router;