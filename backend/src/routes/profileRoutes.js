const express = require('express');
const router = express.Router();
const { getProfileData } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getProfileData);

module.exports = router;