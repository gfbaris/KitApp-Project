const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { rateBook } = require('../controllers/rating.controller');

router.post('/:bookId/ratings', authMiddleware, rateBook);

module.exports = router;
