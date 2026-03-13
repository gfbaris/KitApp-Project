const errorMiddleware = (err, req, res, next) => {
  console.error('Hata:', err.message);

  // Mongoose duplicate key hatası (409)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      error: `Bu ${field} zaten kullanımda`,
    });
  }

  // Mongoose validasyon hatası (400)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: 'Doğrulama hatası',
      details: messages,
    });
  }

  // Mongoose CastError - geçersiz ObjectId (400)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: `Geçersiz ${err.path}: ${err.value}`,
    });
  }

  // Varsayılan hata
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Sunucu hatası',
  });
};

module.exports = errorMiddleware;
