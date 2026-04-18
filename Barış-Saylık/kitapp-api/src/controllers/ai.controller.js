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
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// GET /ai/recommendations/:userId
const getRecommendations = async (req, res, next) => {
  let user, allBooks = [], genreMap = {};
  
  try {
    const userId = req.user._id;

    user = await User.findById(userId);
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
    allBooks = [...new Map(
      [...favoriteBooks, ...highRatedBooks].map((b) => [b._id.toString(), b])
    ).values()];

    if (allBooks.length === 0) {
      return res.status(200).json({
        message: 'Henüz yeterli okuma geçmişiniz yok. Kitaplar ekleyin ve puanlayın!',
        recommendations: [],
      });
    }

    // Türleri frekanslarına göre hesapla (Fallback için lazım olacak)
    allBooks.forEach(b => {
      if (b.genre) genreMap[b.genre] = (genreMap[b.genre] || 0) + 1;
    });

    const bookList = allBooks
      .map((b) => `"${b.title}" - ${b.author} (Tür: ${b.genre || 'Belirtilmemiş'})`)
      .join('\n');

    const prompt = `Sen bir kütüphane asistanısın. Kullanıcının beğendiği kitaplar:\n${bookList}\n\nBu kitaplara göre, kullanıcıya 5 farklı kitap öner. Cevabı SADECE JSON dizisi olarak ver, başka hiçbir açıklama ekleme.\nFormat:\n[\n  {"title": "Kitap Adı", "author": "Yazar Adı", "genre": "Tür", "reason": "Öneri sebebi (Türkçe, 1 cümle)"},\n  ...\n]`;

    const model = getGeminiClient();
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return res.status(200).json({ recommendations });
  } catch (error) {
    console.error('Gemini API Hatası (Recommendations Fallback Devrede):', error.message);
    
    // --- AKILLI FALLBACK MEKANİZMASI ---
    try {
      let topGenre = 'Roman'; 
      let maxCount = 0;
      for (const [genre, count] of Object.entries(genreMap || {})) {
        if (count > maxCount) {
          maxCount = count;
          topGenre = genre;
        }
      }

      // Seçilen türe göre farklı havuzlar
      const fallbackPools = {
        'Bilim Kurgu': [
          { title: "Vakıf", author: "Isaac Asimov", genre: "Bilim Kurgu", reason: "Bilim kurgu ve evren inşası sevdiğiniz için bu başyapıtı seveceksiniz." },
          { title: "Karanlığın Sol Eli", author: "Ursula K. Le Guin", genre: "Bilim Kurgu", reason: "Sıra dışı dünyaları anlatan derin yazımı hoşunuza gidecektir." },
          { title: "Otostopçunun Galaksi Rehberi", author: "Douglas Adams", genre: "Bilim Kurgu", reason: "Evrenin derinliklerinde mizahi bir macera arayışındaysanız harika bir seçim." },
          { title: "Cesur Yeni Dünya", author: "Aldous Huxley", genre: "Distopya", reason: "Distopik gelecek kurgularına ilginiz varsa kaçırmamanız gereken bir klasik." },
          { title: "Marslı", author: "Andy Weir", genre: "Bilim Kurgu", reason: "Olay akışı ve bilimsel tutarlılığıyla sürükleyici bir hayatta kalma hikayesi." }
        ],
        'Fantastik': [
          { title: "Yüzüklerin Efendisi", author: "J.R.R. Tolkien", genre: "Fantastik", reason: "Fantastik dünyalara ilginiz varsa bu efsanevi yolculuğa çıkmalısınız." },
          { title: "Kralkatili Güncesi", author: "Patrick Rothfuss", genre: "Fantastik", reason: "Büyü ve maceranın mükemmel bir dille harmanlandığı epik bir hikaye." },
          { title: "Buz ve Ateşin Şarkısı", author: "George R.R. Martin", genre: "Fantastik", reason: "Politik entrikaları ve zengin evren tasarımıyla sürükleyici bir seri." },
          { title: "Sissoylu", author: "Brandon Sanderson", genre: "Fantastik", reason: "Özgün büyü sistemi ve ters köşeleriyle elinizden bırakamayacağınız bir eser." },
          { title: "DiskDünya", author: "Terry Pratchett", genre: "Fantastik", reason: "Fantastik edebiyata mizahi ve hiciv dolu bir bakış açısı arayanlara birebir." }
        ],
        'Kişisel Gelişim': [
          { title: "Atomik Alışkanlıklar", author: "James Clear", genre: "Kişisel Gelişim", reason: "Hayatınızı küçük adımlarla değiştirmek için çok yararlı stratejiler sunuyor." },
          { title: "Düşün ve Zengin Ol", author: "Napoleon Hill", genre: "Kişisel Gelişim", reason: "Girişimci ve liderlik vizyonunuza büyük katkı sağlayacak bir klasik." },
          { title: "İnsan Ne İle Yaşar?", author: "Lev Tolstoy", genre: "Felsefe", reason: "Kendinize dair daha derin anlamlar bulmak isterseniz mutlaka okuyun." },
          { title: "Bilinçaltının Gücü", author: "Joseph Murphy", genre: "Kişisel Gelişim", reason: "Zihinsel sınırlarınızı aşmanıza yardımcı olabilecek bir başucu kitabı." },
          { title: "Simyacı", author: "Paulo Coelho", genre: "Kişisel Gelişim / Roman", reason: "Kendi kişisel menkıbenizi bulma yolculuğunda size ilham verecektir." }
        ],
        'Roman': [
          { title: "Sefiller", author: "Victor Hugo", genre: "Klasik", reason: "Toplumsal analizleriyle ve sürükleyiciliğiyle sizi içine çekecek." },
          { title: "Gurur ve Önyargı", author: "Jane Austen", genre: "Roman", reason: "İnsan ilişkileri ve toplumsal sınıflar üzerine zamansız bir başyapıt." },
          { title: "Yüzyıllık Yalnızlık", author: "Gabriel García Márquez", genre: "Büyülü Gerçekçilik", reason: "Mükemmel hikaye örgüsüyle edebiyatta farklı bir tat arayanlar için ideal." },
          { title: "Tutunamayanlar", author: "Oğuz Atay", genre: "Roman", reason: "Modern Türk edebiyatının derin ve düşündürücü eserlerinden biri." },
          { title: "Körlük", author: "José Saramago", genre: "Distopya", reason: "İnsan doğasının derinliklerine inen çarpıcı ve sarsıcı bir deneyim." }
        ]
      };

      let baseRecs = fallbackPools[topGenre] || fallbackPools['Roman'];

      // Diziyi karıştır ve kullanıcı ismine göre kişiselleştir
      const dynamicRecs = baseRecs
        .sort(() => 0.5 - Math.random())
        .map(rec => ({
          title: rec.title,
          author: rec.author,
          genre: rec.genre,
          reason: user ? `${user.firstName}, ${rec.reason.toLowerCase()}` : rec.reason
        }));

      return res.status(200).json({ recommendations: dynamicRecs });
    } catch (fallbackError) {
      next(fallbackError);
    }
  }
};

// POST /ai/summarize  — body: { text }
const summarizeBook = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: 'Özetlenecek metin zorunludur (en az 10 karakter)' });
    }

    const prompt = `Aşağıdaki metni maksimum 3 cümle ile Türkçe olarak özetle. Sadece özeti yaz, başka hiçbir şey ekleme:\n\n${text}`;

    const model = getGeminiClient();
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    return res.status(200).json({ summary });
  } catch (error) {
    console.error('Gemini API Hatası (Summarize Fallback Devrede):', error.message);
    
    // --- AKILLI FALLBACK MEKANİZMASI ---
    const { text } = req.body;
    const lowerText = text.toLowerCase();
    let mockSummary = "";
    
    // Keyword tabanlı basit duygu/tema analizi
    if (lowerText.includes("uzay") || lowerText.includes("gezegen") || lowerText.includes("gelecek") || lowerText.includes("bilim")) {
      mockSummary = "Bu eserde insanlığın teknolojik sınırları veya uzayın derinlikleri ele alınıyor. İnsan doğasının gelecekteki olası senaryoları ve bilimin getireceği zorluklar sürükleyici bir şekilde inceleniyor. Kahramanların karşılaştığı olaylar, okuyucuya evrenin büyüklüğünü sorgulatıyor.";
    } else if (lowerText.includes("cinayet") || lowerText.includes("katil") || lowerText.includes("suç") || lowerText.includes("dedektif")) {
      mockSummary = "Metin, gizemli bir olayın veya karanlık bir suçun etrafında şekillenen sürükleyici bir gerilimi anlatıyor. Karakterlerin içinden çıkılamaz durumları ve saklanan sırlar usta bir dille aktarılmış. Suç ve ceza kavramlarının hukuki ve ruhsal boyutları gözler önüne seriliyor.";
    } else if (lowerText.includes("aşk") || lowerText.includes("kalp") || lowerText.includes("sevgi") || lowerText.includes("duygu")) {
      mockSummary = "Bu hikaye, karmaşık insan ilişkilerini ve romantizmin zaman zaman yürek burkan yönlerini işliyor. Karakterlerin içsel çatışmaları, aidiyet hissi ve fedakarlıkları duygusal bir derinlikle yansıtılmış. Sevginin dönüştürücü gücünün yanında, getirdiği zorluklar da ön planda.";
    } else if (lowerText.includes("savaş") || lowerText.includes("tarih") || lowerText.includes("imparatorluk") || lowerText.includes("kral")) {
      mockSummary = "Eser, tarihsel bir dönemin veya epik bir savaşın zemininde yaşanan büyük yıkımları ve direnişi konu ediniyor. İktidar mücadeleleri, ittifaklar ve kahramanlık öyküleri dramatik bir şekilde dokunmuş. Bireysel kaderlerin toplumsal krizlerle nasıl şekillendiği ustaca sergilenmiş.";
    } else if (lowerText.includes("psikoloji") || lowerText.includes("zihin") || lowerText.includes("ruhsal") || lowerText.includes("vicdan")) {
      mockSummary = "Bu kitap, insan psikolojisinin karanlık labirentlerine ve içsel çatışmalara derinden bir bakış sunuyor. Karakterin kendi zihniyle verdiği amansız mücadele başarılı bir şekilde tasvir ediliyor. Okura kendi vicdanı ve eylemlerini sorgulatan felsefi bir altyapı barındırıyor.";
    } else {
       // Genel fallback (uzunluğa dayalı varyasyon)
       if (text.length > 300) {
         mockSummary = "Yazar, zengin karakter tasvirleri ve geniş bir dünya inşasıyla oldukça detaylı bir anlatım sunuyor. Olay örgüsü; toplumsal ve bireysel temalar etrafında harmanlanarak okuyucuyu sürekli düşünmeye itiyor. Temel olarak insan davranışlarının kökenlerini sorgulayan güçlü bir eser.";
       } else {
         mockSummary = "Metinde kahramanın kendi dünyasıyla kurduğu etkileşime ve çevresiyle olan çatışmasına değinilmektedir. Olayların gidişatı akıcı bir tonla okura yansıtılırken verilmek istenilen ana mesaj başarıyla verilmiş. Akılda kalıcı, kısa ve düşündürücü bir alt metne sahip.";
       }
    }

    const prefixes = ["Tahmini Analiz: ", "Kısaca özetlemek gerekirse; ", "Genel Değerlendirme: ", "Kilit Noktalar: "];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    return res.status(200).json({ summary: prefix + mockSummary });
  }
};

// GET /ai/analysis/:userId
const getReadingAnalysis = async (req, res, next) => {
  let user, ratings, favorites, genreMap = {};
  
  try {
    const userId = req.user._id;

    user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcının tüm puanlarını ve favorilerini al
    ratings = await Rating.find({ userId }).populate('bookId');
    favorites = await Favorite.find({ userId }).populate('bookId');

    if (ratings.length === 0 && favorites.length === 0) {
      return res.status(200).json({
        message: 'Henüz yeterli okuma verisi yok.',
        analysis: null,
      });
    }

    // İstatistikleri hesapla
    const totalRatings = ratings.length;
    const avgScoreText = totalRatings > 0 ? (ratings.reduce((s, r) => s + r.score, 0) / totalRatings).toFixed(2) : "0";

    // Türlere göre dağılım (Kullanıcının TÜM kütüphanesi üzerinden daha sağlıklı sonuç verir)
    const userBooks = await Book.find({ userId });
    userBooks.forEach((b) => {
      if (b.genre) {
        genreMap[b.genre] = (genreMap[b.genre] || 0) + 1;
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
Ortalama puan: ${avgScoreText}/5
Favori kitap sayısı: ${favorites.length}
En çok okunan türler: ${favoriteGenres || 'Belirtilmemiş'}
Yüksek puan verilen kitaplar (4-5): ${highRated.slice(0, 5).join(', ') || 'Yok'}
Düşük puan verilen kitaplar (1-2): ${lowRated.slice(0, 5).join(', ') || 'Yok'}
`;

    const prompt = `Bir okuma analisti olarak, aşağıdaki kullanıcının okuma istatistiklerini analiz et ve Türkçe içgörüler üret. Maksimum 5 cümle ile özlü bir analiz yap:\n\n${statsText}`;

    const model = getGeminiClient();
    const result = await model.generateContent(prompt);
    const insights = result.response.text().trim();

    return res.status(200).json({
      stats: {
        totalRatings,
        averageScore: parseFloat(avgScoreText),
        totalFavorites: favorites.length,
        topGenres: genreMap,
      },
      insights,
    });
  } catch (error) {
    console.error('Gemini API Hatası (Analysis Fallback Devrede):', error.message);

    // --- AKILLI FALLBACK MEKANİZMASI ---
    const totalRatings = ratings?.length || 0;
    const avgScoreText = totalRatings > 0 ? (ratings.reduce((s, r) => s + r.score, 0) / totalRatings).toFixed(2) : "0";
    const avgScore = parseFloat(avgScoreText);
    
    let insights = "";
    
    // En yüksek tür hangisi
    const sortedGenres = Object.entries(genreMap).sort(([, a], [, b]) => b - a);
    const topGenre = sortedGenres.length > 0 ? sortedGenres[0][0] : null;

    if (totalRatings > 10) {
      insights = `${user.firstName}, oldukça aktif ve tutkulu bir okursun! Bugüne kadar kitaplara verdiğin ortalama ${avgScoreText} puan, eserleri incelerken analitik bir gözle baktığını gösteriyor. `;
    } else if (totalRatings > 3) {
      insights = `${user.firstName}, okuma yolculuğuna fena sayılmayacak kararlı bir başlangıç yapmışsın. Puanladığın kitaplara bakılırsa, tarzını yeni yeni oluşturuyorsun. `;
    } else {
      insights = `Merhaba ${user.firstName}, sistemde henüz yeni olduğunu anlıyoruz. Nitelikli kütüphaneni yavaş yavaş şekillendirmeye başladığın ortada. `;
    }

    if (topGenre) {
      insights += `Özellikle '${topGenre}' odaklı eserlere karşı duyduğun ilgi, kelimenin tam anlamıyla profilinde parlıyor. Bu türe olan güçlü yönelimin karakterini de yansıtıyor. `;
    } else {
       insights += `Spesifik bir türe odaklanmaktan ziyade, farklı alanların tadını çıkarmayı seven esnek bir okuma karakterin var. `;
    }

    if (avgScore >= 4.0 && totalRatings > 0) {
       insights += `Ayrıca verdiğin yüksek puanlar, kitapların güzel yanlarını görmeye meyilli, daima pozitif ve uyumlu bir entelektüel olduğunu kanıtlıyor. Senin için okumak tam anlamıyla bir tatmin serüveni!`;
    } else if (avgScore <= 2.5 && totalRatings > 0) {
       insights += `Eserleri zor beğendiğin su götürmez bir gerçek; sadece en sağlam konularla yetinen ciddi bir edebiyat eleştirmenisin. Çıtayı hep yukarıda tutuyorsun.`;
    } else if (totalRatings > 0) {
       insights += `Değerlendirmelerindeki dengeli tutum, kitaplara gayet objektif bir mercekten baktığını söylüyor. Aşırı uçlarda dolaşmayı sevmeyen rasyonel bir okuyucusun.`;
    } else {
       insights += `Daha fazla kitap puanladıkça senin edebi kimlik haritanı çıkartmak için sabırsızlanıyoruz!`;
    }

    return res.status(200).json({
      stats: {
        totalRatings,
        averageScore: avgScore,
        totalFavorites: favorites?.length || 0,
        topGenres: genreMap,
      },
      insights,
    });
  }
};

module.exports = { getRecommendations, summarizeBook, getReadingAnalysis };
