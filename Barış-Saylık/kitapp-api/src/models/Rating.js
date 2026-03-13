const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    score: {
      type: Number,
      required: [true, 'Puan zorunludur'],
      min: [1, 'Puan en az 1 olmalıdır'],
      max: [5, 'Puan en fazla 5 olabilir'],
    },
  },
  { timestamps: true }
);

// Aynı kullanıcı aynı kitabı bir kez puanlayabilir
ratingSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
