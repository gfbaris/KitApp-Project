const Favorite = require('../models/Favorite');
const Book = require('../models/Book');

// POST /users/favorites/:bookId
const addFavorite = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findOne({ _id: bookId, userId: req.user._id });
    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı veya size ait değil' });
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

// GET /users/favorites
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate('bookId')
      .sort({ createdAt: -1 });
    
    // Geçerli kitapları filtrele ve sadece kitap objesini döndür
    const books = favorites
      .map(f => f.bookId)
      .filter(b => b !== null);

    res.status(200).json({ data: books });
  } catch (error) {
    next(error);
  }
};

// DELETE /users/favorites/:bookId
const removeFavorite = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      userId: req.user._id,
      bookId,
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favori kaydı bulunamadı' });
    }

    res.status(200).json({ message: 'Kitap favorilerden çıkarıldı' });
  } catch (error) {
    next(error);
  }
};

module.exports = { addFavorite, getFavorites, removeFavorite };
