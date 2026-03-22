import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import BookCard from '../components/BookCard';
import SkeletonCard from '../components/SkeletonCard';
import { getBooks, filterBooks, addBook, getRecommendations } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const GENRES = ['Hepsi', 'Roman', 'Bilim Kurgu', 'Tarih', 'Polisiye', 'Şiir', 'Biyografi'];

// ─── Kitap Ekleme Modalı ────────────────────────────
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
      if (payload.pageCount) payload.pageCount = Number(payload.pageCount);
      if (payload.publishYear) payload.publishYear = Number(payload.publishYear);
      if (!payload.coverImage) delete payload.coverImage;
      await addBook(payload);
      showToast('Kitap başarıyla eklendi ✓', 'success');
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Kitap eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Başlık */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Yeni Kitap Ekle</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Kitap Adı *</label>
              <input
                name="title" required value={form.title} onChange={handleChange}
                placeholder="Suç ve Ceza"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Yazar *</label>
              <input
                name="author" required value={form.author} onChange={handleChange}
                placeholder="Fyodor Dostoyevski"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Tür</label>
              <select
                name="genre" value={form.genre} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white text-sm transition-all"
              >
                {GENRES.filter(g => g !== 'Hepsi').map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Sayfa Sayısı</label>
                <input
                  name="pageCount" type="number" min="1" value={form.pageCount} onChange={handleChange}
                  placeholder="350"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Yayın Yılı</label>
                <input
                  name="publishYear" type="number" min="1000" max="2099" value={form.publishYear} onChange={handleChange}
                  placeholder="1866"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Açıklama</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                rows={4}
                placeholder="Kitap hakkında kısa bir açıklama..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Kapak Görseli URL</label>
              <input
                name="coverImage" value={form.coverImage} onChange={handleChange}
                placeholder="https://... (opsiyonel)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button" onClick={onClose}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                Vazgeç
              </button>
              <button
                type="submit" disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Ekleniyor...
                  </>
                ) : 'Kitabı Ekle'}
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800">🤖 Sana Özel Öneriler</h3>
        <p className="text-xs text-gray-400 mt-0.5">Okuma geçmişine göre önerildi</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse space-y-1.5 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
              <div className="h-3 bg-gray-100 rounded w-3/4"></div>
              <div className="h-2.5 bg-gray-100 rounded w-1/2"></div>
              <div className="h-2.5 bg-gray-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <p className="text-sm text-gray-400 leading-relaxed">
          Daha fazla kitap okuyunca öneriler burada görünür.
        </p>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div key={i} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
              <p className="font-medium text-gray-800 text-sm leading-snug">{rec.title}</p>
              {rec.author && <p className="text-xs text-gray-500 mt-0.5">{rec.author}</p>}
              {rec.reason && <p className="text-xs text-indigo-600 mt-1 leading-relaxed">{rec.reason}</p>}
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
      setBooks(res.data.books || res.data || []);
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

  const handleSearchResults = (results, query) => {
    setSearchResults(results);
    setSearchQuery(query || '');
  };

  const displayedBooks = searchResults !== null ? searchResults : books;
  const isSearching = searchResults !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearchResults={handleSearchResults} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="lg:flex gap-8">

          {/* Sol Panel: Kitap Listesi */}
          <div className="flex-1 min-w-0">

            {/* Başlık */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isSearching ? `"${searchQuery}" Sonuçları` : 'Kütüphane'}
                </h2>
                {!loading && (
                  <p className="text-sm text-gray-500 mt-1">
                    {displayedBooks.length} kitap bulundu
                  </p>
                )}
              </div>
              {!isSearching && (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 text-sm flex items-center gap-1.5 flex-shrink-0"
                >
                  <span className="text-lg leading-none">+</span> Kitap Ekle
                </button>
              )}
            </div>

            {/* Tür Filtreleri — sadece arama yoksa */}
            {!isSearching && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                {GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => handleGenreFilter(genre)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeGenre === genre
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}

            {/* Skeleton / Boş / Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : displayedBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
                <span className="text-6xl text-gray-200 mb-4">📚</span>
                <p className="text-lg font-medium text-gray-500">
                  {isSearching ? 'Sonuç bulunamadı' : 'Kütüphaneniz boş'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {isSearching ? 'Farklı bir kelime deneyin.' : 'İlk kitabınızı ekleyin'}
                </p>
                {!isSearching && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
                  >
                    + İlk Kitabı Ekle
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedBooks.map(book => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            )}
          </div>

          {/* Sağ Panel: AI Önerileri */}
          <div className="w-full lg:w-80 flex-shrink-0 mt-8 lg:mt-0 hidden lg:block">
            <div className="sticky top-20">
              <AIRecommendations userId={user?._id} />
            </div>
          </div>
        </div>
      </div>

      {/* Kitap Ekleme Modal */}
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
