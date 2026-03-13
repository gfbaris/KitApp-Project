const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Book = require('../models/Book');
const Rating = require('../models/Rating');
const Favorite = require('../models/Favorite');

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'buraya_gemini_api_key') {
    throw new Error('GEMINI_API_KEY ayarlanmamış');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

// GET /ai/recommendations/:userId
const getRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcının favori kitaplarını al
    const favorites = await Favorite.find({ userId }).populate('bookId');
    const favoriteBooks = favorites.map((f) => f.bookId).filter(Boolean);

    // Kullanıcının yüksek puanlı kitaplarını al (4+)
    const highRatings = await Rating.find({ userId, score: { $gte: 4 } }).populate('bookId');
    const highRatedBooks = highRatings.map((r) => r.bookId).filter(Boolean);

    // Tüm ilgili kitapları birleştir (tekrarsız)
    const allBooks = [...new Map(
      [...favoriteBooks, ...highRatedBooks].map((b) => [b._id.toString(), b])
    ).values()];

    if (allBooks.length === 0) {
      return res.status(200).json({
        message: 'Henüz yeterli okuma geçmişiniz yok. Kitaplar ekleyin ve puanlayın!',
        recommendations: [],
      });
    }

    const bookList = allBooks
      .map((b) => `"${b.title}" - ${b.author} (Tür: ${b.genre || 'Belirtilmemiş'})`)
      .join('\n');

    const prompt = `Sen bir kütüphane asistanısın. Kullanıcının beğendiği kitaplar:
${bookList}

Bu kitaplara göre, kullanıcıya 5 farklı kitap öner. Cevabı SADECE JSON dizisi olarak ver, başka hiçbir açıklama ekleme.
Format:
[
  {"title": "Kitap Adı", "author": "Yazar Adı", "genre": "Tür", "reason": "Öneri sebebi (Türkçe, 1 cümle)"},
  ...
]`;

    const model = getGeminiClient();
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // JSON'ı parse et
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    res.status(200).json({ recommendations });
  } catch (error) {
    next(error);
  }
};

// POST /ai/summarize  — body: { text }
const summarizeBook = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: 'Özetlenecek metin zorunludur (en az 10 karakter)' });
    }

    const prompt = `Aşağıdaki metni maksimum 3 cümle ile Türkçe olarak özetle. Sadece özeti yaz, başka hiçbir şey ekleme:

${text}`;

    const model = getGeminiClient();
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
};

// GET /ai/analysis/:userId
const getReadingAnalysis = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcının tüm puanlarını ve favorilerini al
    const ratings = await Rating.find({ userId }).populate('bookId');
    const favorites = await Favorite.find({ userId }).populate('bookId');

    if (ratings.length === 0 && favorites.length === 0) {
      return res.status(200).json({
        message: 'Henüz yeterli okuma verisi yok.',
        analysis: null,
      });
    }

    // İstatistikleri hesapla
    const totalRatings = ratings.length;
    const avgScore =
      totalRatings > 0
        ? (ratings.reduce((s, r) => s + r.score, 0) / totalRatings).toFixed(2)
        : 0;

    // Türlere göre dağılım
    const genreMap = {};
    ratings.forEach((r) => {
      if (r.bookId?.genre) {
        genreMap[r.bookId.genre] = (genreMap[r.bookId.genre] || 0) + 1;
      }
    });

    const favoriteGenres = Object.entries(genreMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre, count]) => `${genre} (${count} kitap)`)
      .join(', ');

    const highRated = ratings.filter((r) => r.score >= 4).map((r) => r.bookId?.title).filter(Boolean);
    const lowRated = ratings.filter((r) => r.score <= 2).map((r) => r.bookId?.title).filter(Boolean);

    const statsText = `
Kullanıcı: ${user.firstName} ${user.lastName}
Toplam puanlanan kitap: ${totalRatings}
Ortalama puan: ${avgScore}/5
Favori kitap sayısı: ${favorites.length}
En çok okunan türler: ${favoriteGenres || 'Belirtilmemiş'}
Yüksek puan verilen kitaplar (4-5): ${highRated.slice(0, 5).join(', ') || 'Yok'}
Düşük puan verilen kitaplar (1-2): ${lowRated.slice(0, 5).join(', ') || 'Yok'}
`;

    const prompt = `Bir okuma analisti olarak, aşağıdaki kullanıcının okuma istatistiklerini analiz et ve Türkçe içgörüler üret. Maksimum 5 cümle ile özlü bir analiz yap:

${statsText}`;

    const model = getGeminiClient();
    const result = await model.generateContent(prompt);
    const insights = result.response.text().trim();

    res.status(200).json({
      stats: {
        totalRatings,
        averageScore: parseFloat(avgScore),
        totalFavorites: favorites.length,
        topGenres: genreMap,
      },
      insights,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecommendations, summarizeBook, getReadingAnalysis };
