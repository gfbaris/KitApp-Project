const Book = require('../models/Book');
const Favorite = require('../models/Favorite');
const Rating = require('../models/Rating');

// POST /books
const addBook = async (req, res, next) => {
  try {
    const { title, author, isbn, pageCount, publishYear, genre, coverImage, description } = req.body;

    const book = await Book.create({
      userId: req.user._id,
      title, author, isbn, pageCount, publishYear, genre, coverImage, description,
    });

    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

// GET /books  (sayfalama: page, limit)
const listBooks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    const [books, total] = await Promise.all([
      Book.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Book.countDocuments(query),
    ]);

    res.status(200).json({
      data: books,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /books/search?query=...
const searchBooks = async (req, res, next) => {
  try {
    const { query: searchQuery, page = 1, limit = 10 } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ error: 'Arama sorgusu zorunludur (query)' });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = { $text: { $search: searchQuery }, userId: req.user._id };

    const [books, total] = await Promise.all([
      Book.find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limitNum),
      Book.countDocuments(query),
    ]);

    res.status(200).json({
      data: books,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /books/filter?genre=...
const filterBooks = async (req, res, next) => {
  try {
    const { genre, page = 1, limit = 10 } = req.query;

    if (!genre) {
      return res.status(400).json({ error: 'Tür filtresi zorunludur (genre)' });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = { genre: { $regex: genre, $options: 'i' }, userId: req.user._id };

    const [books, total] = await Promise.all([
      Book.find(query)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Book.countDocuments(query),
    ]);

    res.status(200).json({
      data: books,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /books/:bookId
const getBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.bookId, userId: req.user._id });
    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı veya erişim yetkiniz yok' });
    }

    // Kullanıcıya özel bilgileri ekle
    const [favorite, rating] = await Promise.all([
      Favorite.findOne({ userId: req.user._id, bookId: book._id }),
      Rating.findOne({ userId: req.user._id, bookId: book._id })
    ]);

    const bookData = book.toObject();
    bookData.isFavorite = !!favorite;
    bookData.userRating = rating ? rating.score : 0;

    res.status(200).json(bookData);
  } catch (error) {
    next(error);
  }
};

// PUT /books/:bookId
const updateBook = async (req, res, next) => {
  try {
    const { title, author, isbn, pageCount, publishYear, genre, coverImage, description } = req.body;

    const book = await Book.findOneAndUpdate(
      { _id: req.params.bookId, userId: req.user._id },
      { title, author, isbn, pageCount, publishYear, genre, coverImage, description },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı veya yetkisiz işlem' });
    }

    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

// DELETE /books/:bookId
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.bookId, userId: req.user._id });
    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı veya yetkisiz işlem' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { addBook, listBooks, searchBooks, filterBooks, getBook, updateBook, deleteBook };
