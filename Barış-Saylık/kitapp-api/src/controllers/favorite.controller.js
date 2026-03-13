const Favorite = require('../models/Favorite');
const Book = require('../models/Book');

// POST /users/favorites/:bookId
const addFavorite = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    const favorite = await Favorite.create({
      userId: req.user._id,
      bookId,
    });

    res.status(201).json({
      message: 'Kitap favorilere eklendi',
      favorite,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addFavorite };
