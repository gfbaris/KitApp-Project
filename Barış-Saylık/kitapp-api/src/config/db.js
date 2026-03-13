const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<username>')) {
      console.warn('⚠️  MONGODB_URI ayarlanmamış. Veritabanı bağlantısı atlandı.');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB bağlantısı başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB bağlantı hatası: ${error.message}`);
    // Sadece bağlantı hatasında çık
    process.exit(1);
  }
};

module.exports = connectDB;
