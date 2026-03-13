const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const bookRoutes = require('./src/routes/book.routes');
const ratingRoutes = require('./src/routes/rating.routes');
const favoriteRoutes = require('./src/routes/favorite.routes');
const aiRoutes = require('./src/routes/ai.routes');

// Sağlık kontrolü
app.get('/', (req, res) => {
  res.json({ message: '📚 KitApp API çalışıyor' });
});

// API route'ları
app.use('/auth', authRoutes);
app.use('/users', favoriteRoutes); // /users/favorites/:bookId önce tanımlanmalı
app.use('/users', userRoutes);
app.use('/books', bookRoutes);
app.use('/books', ratingRoutes);
app.use('/ai', aiRoutes);

// Hata yönetimi middleware (en sonda olmalı)
const errorMiddleware = require('./src/middleware/error.middleware');
app.use(errorMiddleware);

module.exports = app;
