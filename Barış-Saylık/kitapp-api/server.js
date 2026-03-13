require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 KitApp API sunucusu ${PORT} portunda çalışıyor`);
  console.log(`📖 Ortam: ${process.env.NODE_ENV || 'development'}`);
});
