const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  addBook, listBooks, searchBooks, filterBooks, getBook, updateBook, deleteBook,
} = require('../controllers/book.controller');

// ÖNEMLİ SIRALAMA: /search ve /filter, /:bookId'den ÖNCE gelmelidir!
router.get('/search', authMiddleware, searchBooks);
router.get('/filter', authMiddleware, filterBooks);

router.post('/', authMiddleware, addBook);
router.get('/', authMiddleware, listBooks);

router.get('/:bookId', authMiddleware, getBook);
router.put('/:bookId', authMiddleware, updateBook);
router.delete('/:bookId', authMiddleware, deleteBook);

module.exports = router;
