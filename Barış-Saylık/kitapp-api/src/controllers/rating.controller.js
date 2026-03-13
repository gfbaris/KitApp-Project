const Rating = require('../models/Rating');
const Book = require('../models/Book');

// POST /books/:bookId/ratings
const rateBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { score } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ error: 'Puan 1 ile 5 arasında olmalıdır' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    const rating = await Rating.create({
      userId: req.user._id,
      bookId,
      score,
    });

    // Kitabın ortalama puanını ve sayısını güncelle
    const allRatings = await Rating.find({ bookId });
    const ratingCount = allRatings.length;
    const averageRating =
      allRatings.reduce((sum, r) => sum + r.score, 0) / ratingCount;

    await Book.findByIdAndUpdate(bookId, {
      averageRating: Math.round(averageRating * 10) / 10,
      ratingCount,
    });

    res.status(201).json(rating);
  } catch (error) {
    next(error);
  }
};

module.exports = { rateBook };
