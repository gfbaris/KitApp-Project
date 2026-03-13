const Book = require('../models/Book');

// POST /books
const addBook = async (req, res, next) => {
  try {
    const { title, author, isbn, pageCount, publishYear, genre, coverImage, description } = req.body;

    const book = await Book.create({
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

    const [books, total] = await Promise.all([
      Book.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Book.countDocuments(),
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
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Arama sorgusu zorunludur (query)' });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limitNum),
      Book.countDocuments({ $text: { $search: query } }),
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

    const [books, total] = await Promise.all([
      Book.find({ genre: { $regex: genre, $options: 'i' } })
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Book.countDocuments({ genre: { $regex: genre, $options: 'i' } }),
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
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }
    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

// PUT /books/:bookId
const updateBook = async (req, res, next) => {
  try {
    const { title, author, isbn, pageCount, publishYear, genre, coverImage, description } = req.body;

    const book = await Book.findByIdAndUpdate(
      req.params.bookId,
      { title, author, isbn, pageCount, publishYear, genre, coverImage, description },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

// DELETE /books/:bookId
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.bookId);
    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { addBook, listBooks, searchBooks, filterBooks, getBook, updateBook, deleteBook };
