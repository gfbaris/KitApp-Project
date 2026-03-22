import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import BookCard from '../components/BookCard';
import SkeletonCard from '../components/SkeletonCard';
import { getBooks, filterBooks, addBook, getRecommendations } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const GENRES = ['Hepsi', 'Roman', 'Bilim Kurgu', 'Tarih', 'Polisiye', 'Şiir', 'Biyografi'];

// ─── Kitap Ekleme Modalı (Premium) ────────────────────────────
const AddBookModal = ({ onClose, onAdded }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: '', author: '', genre: 'Roman',
    pageCount: '', publishYear: '', description: '', coverImage: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      // ERROR FIX: Boş string'ler veritabanında CastError fırlatıyor
      if (payload.pageCount) payload.pageCount = Number(payload.pageCount);
      else delete payload.pageCount;
      
      if (payload.publishYear) payload.publishYear = Number(payload.publishYear);
      else delete payload.publishYear;
      
      if (!payload.coverImage) delete payload.coverImage;
      
      await addBook(payload);
      showToast('Kitap başarıyla eklendi 🎉', 'success');
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Kitap eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-8 overflow-y-auto custom-scrollbar">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">✨</span>
              Yeni Eser Ekle
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-full w-9 h-9 flex items-center justify-center transition-colors">✕</button>
          </div>

          {error && <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-xl px-4 py-3 mb-5 text-sm font-bold flex items-center gap-2"><span>⚠️</span> {error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Eser Adı <span className="text-rose-400">*</span></label>
              <input name="title" required value={form.title} onChange={handleChange} placeholder="Suç ve Ceza" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition" />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Yazar <span className="text-rose-400">*</span></label>
              <input name="author" required value={form.author} onChange={handleChange} placeholder="Fyodor Dostoyevski" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition" />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tür</label>
              <select name="genre" value={form.genre} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 transition cursor-pointer">
                {GENRES.filter(g => g !== 'Hepsi').map(g => <option key={g} value={g}>{g}</option>)}
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sayfa Sayısı</label>
                <input name="pageCount" type="number" min="1" value={form.pageCount} onChange={handleChange} placeholder="350" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Yayın Yılı</label>
                <input name="publishYear" type="number" min="1000" max="2099" value={form.publishYear} onChange={handleChange} placeholder="1866" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Açıklama & Konu</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Eserin konusu veya sizin düşünceleriniz..." className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition resize-none" />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kapak Görseli URL</label>
              <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="https://..." className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition" />
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button type="button" onClick={onClose} className="flex-1 bg-white border-2 border-slate-200 text-slate-600 rounded-xl py-3.5 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all">Vazgeç</button>
              <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Kütüphaneye Ekle'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

// ─── AI Önerileri Paneli ─────────────────────────────
const AIRecommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getRecommendations(userId)
      .then(res => setRecommendations(res.data.recommendations || []))
      .catch(() => setRecommendations([]))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100/60 p-7 relative overflow-hidden group">
      {/* Dekoratif Arka Plan */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150"></div>
      
      <div className="mb-6 relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner">🤖</div>
        <div>
          <h3 className="text-base font-black text-slate-800 tracking-tight">Edebi Asistan</h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Yapay Zeka Önerileri</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-slate-50 rounded-xl p-4">
              <div className="h-3 bg-slate-200 rounded-full w-3/4 mb-2.5"></div>
              <div className="h-2.5 bg-slate-200 rounded-full w-1/2 mb-3"></div>
              <div className="h-2 bg-indigo-100 rounded-full w-full"></div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center">
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Asistanın seni yeterince  tanımıyor. Kütüphanene eseler ekleyip puanlayarak onunla bağ kurabilirsin!
          </p>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {recommendations.map((rec, i) => (
            <div key={i} className="bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-md rounded-xl p-4 transition-all duration-300">
              <p className="font-extrabold text-slate-800 text-[13px] leading-snug">{rec.title}</p>
              {rec.author && <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wide">{rec.author}</p>}
              {rec.reason && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200/60">
                  <p className="text-[12px] font-medium text-indigo-600 leading-relaxed">{rec.reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Ana Sayfa ───────────────────────────────────────
const HomePage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState('Hepsi');
  const [showModal, setShowModal] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadBooks = useCallback(async (genre = 'Hepsi') => {
    setLoading(true);
    try {
      const res = genre && genre !== 'Hepsi'
        ? await filterBooks(genre)
        : await getBooks();
      
      let booksData = [];
      if (Array.isArray(res.data?.data)) booksData = res.data.data;
      else if (Array.isArray(res.data?.books)) booksData = res.data.books;
      else if (Array.isArray(res.data)) booksData = res.data;
      
      setBooks(booksData);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks('Hepsi');
  }, [loadBooks]);

  const handleGenreFilter = (genre) => {
    setActiveGenre(genre);
    setSearchResults(null);
    setSearchQuery('');
    loadBooks(genre);
  };

  const displayedBooks = searchResults !== null ? searchResults : books;
  const isSearching = searchResults !== null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 selection:bg-indigo-500/30">
      {/* Decorative Blur Backgrounds */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[40%] rounded-full bg-purple-500/5 blur-[100px]"></div>
      </div>

      <Navbar onSearchResults={(res, q) => { setSearchResults(res); setSearchQuery(q); }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="lg:flex gap-10">
          
          {/* Sol Panel: Kitap Listesi */}
          <div className="flex-1 min-w-0">

            {/* Başlık & Buton Alanı */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                  {isSearching ? (
                    <span className="flex items-center gap-3">
                      <span className="text-indigo-500">🔍</span> "{searchQuery}"
                    </span>
                  ) : 'Kütüphane'}
                </h2>
                {!loading && (
                  <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
                    {displayedBooks.length} Eser Seçildi
                  </p>
                )}
              </div>

              {!isSearching && (
                <button
                  onClick={() => setShowModal(true)}
                  className="group relative px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-[#1e3a5f] text-white rounded-[1.25rem] font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all outline-none flex items-center justify-center gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <span className="relative z-10 text-xl leading-none font-black">+</span>
                  <span className="relative z-10 text-sm tracking-wide">Yeni Eser Ekle</span>
                </button>
              )}
            </div>

            {/* Premium Tür Piller'ı */}
            {!isSearching && (
              <div className="flex gap-3 overflow-x-auto pb-4 mb-6 custom-scrollbar">
                {GENRES.map(genre => {
                  const isActive = activeGenre === genre;
                  return (
                    <button
                      key={genre}
                      onClick={() => handleGenreFilter(genre)}
                      className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-300 border ${
                        isActive
                          ? 'bg-slate-800 border-slate-700 text-white shadow-md shadow-slate-800/20 translate-y-0'
                          : 'bg-white border-slate-200/60 text-slate-500 hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-600'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            )}

            {/* İçerik Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : displayedBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-slate-100/50 shadow-sm mt-4">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner text-slate-300">📚</div>
                <p className="text-xl font-extrabold text-slate-800">
                  {isSearching ? 'Sonuç Bulunamadı' : 'Kütüphaneniz Henüz Boş'}
                </p>
                <p className="text-sm font-medium text-slate-500 mt-2 max-w-xs text-center">
                  {isSearching ? 'Farklı bir kelimeyle edebi dünyada aramanızı tekrarlayın.' : 'Koleksiyonunuza ilk kitabınızı ekleyerek edebi yolculuğunuza başlayın!'}
                </p>
                {!isSearching && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-8 px-8 py-3.5 border-2 border-indigo-100 text-indigo-600 bg-indigo-50/50 rounded-2xl font-bold hover:bg-indigo-100 hover:border-indigo-200 transition-colors shadow-sm"
                  >
                    Hemen Ekle
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedBooks.map(book => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            )}
          </div>

          {/* Sağ Panel: AI Önerileri */}
          <div className="w-full lg:w-[340px] flex-shrink-0 mt-8 lg:mt-0 xl:mr-2">
            <div className="sticky top-[100px]">
              <AIRecommendations userId={user?._id} />
            </div>
          </div>

        </div>
      </div>

      {showModal && (
        <AddBookModal
          onClose={() => setShowModal(false)}
          onAdded={() => loadBooks(activeGenre)}
        />
      )}
    </div>
  );
};

export default HomePage;
