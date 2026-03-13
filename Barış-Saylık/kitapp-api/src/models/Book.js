const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Kitap adı zorunludur'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Yazar adı zorunludur'],
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
    pageCount: {
      type: Number,
      min: [1, 'Sayfa sayısı en az 1 olmalıdır'],
    },
    publishYear: {
      type: Number,
    },
    genre: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// title, author, isbn için full-text index
bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

module.exports = mongoose.model('Book', bookSchema);
