const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { getRecommendations, summarizeBook, getReadingAnalysis } = require('../controllers/ai.controller');

router.get('/recommendations/:userId', authMiddleware, getRecommendations);
router.post('/summarize', authMiddleware, summarizeBook);
router.get('/analysis/:userId', authMiddleware, getReadingAnalysis);

module.exports = router;
