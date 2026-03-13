const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { addFavorite } = require('../controllers/favorite.controller');

// ÖNEMLİ: Bu route app.js'de /users/favorites/:bookId şeklinde mount edildiği için
// /users/:userId'den ÖNCE tanımlanmalıdır (app.js'de yönetiliyor)
router.post('/favorites/:bookId', authMiddleware, addFavorite);

module.exports = router;
