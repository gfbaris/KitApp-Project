import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import BookCard from '../components/BookCard';
import { getBooks, filterBooks, addBook } from '../services/api';
import { getRecommendations } from '../services/api';
import { useAuth } from '../context/AuthContext';

const GENRES = ['Hepsi', 'Roman', 'Bilim Kurgu', 'Tarih', 'Polisiye', 'Şiir', 'Fantastik', 'Felsefe'];

// Kitap Ekleme Modal
const AddBookModal = ({ onClose, onAdded }) => {
  const [form, setForm] = useState({ title: '', author: '', genre: 'Roman', pageCount: '', publishYear: '', description: '', coverImage: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.pageCount) payload.pageCount = Number(payload.pageCount);
      if (payload.publishYear) payload.publishYear = Number(payload.publishYear);
      if (!payload.coverImage) delete payload.coverImage;
      await addBook(payload);
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Kitap eklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#1e3a5f]">📖 Yeni Kitap Ekle</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
          {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 mb-3 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input required placeholder="Kitap Adı *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            <input required placeholder="Yazar *" value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            <select value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
              {GENRES.filter(g => g !== 'Hepsi').map(g => <option key={g}>{g}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Sayfa Sayısı" value={form.pageCount} onChange={e => setForm({...form, pageCount: e.target.value})} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              <input type="number" placeholder="Yayın Yılı" value={form.publishYear} onChange={e => setForm({...form, publishYear: e.target.value})} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            </div>
            <input placeholder="Kapak Resmi URL (opsiyonel)" value={form.coverImage} onChange={e => setForm({...form, coverImage: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            <textarea placeholder="Açıklama" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] resize-none" />
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition">İptal</button>
              <button type="submit" disabled={loading} className="flex-1 bg-[#1e3a5f] hover:bg-[#162d4a] text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-60 transition">
                {loading ? 'Ekleniyor...' : 'Kitabı Ekle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState('Hepsi');
  const [recommendations, setRecommendations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchResults, setSearchResults] = useState(null); // null = arama yok

  const loadBooks = useCallback(async (genre) => {
    setLoading(true);
    try {
      let res;
      if (genre && genre !== 'Hepsi') {
        res = await filterBooks(genre);
      } else {
        res = await getBooks();
      }
      setBooks(res.data.books || res.data || []);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecommendations = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await getRecommendations(user._id);
      setRecommendations(res.data.recommendations || []);
    } catch {
      setRecommendations([]);
    }
  }, [user]);

  useEffect(() => {
    loadBooks('Hepsi');
    loadRecommendations();
  }, [loadBooks, loadRecommendations]);

  const handleGenreFilter = (genre) => {
    setActiveGenre(genre);
    setSearchResults(null);
    loadBooks(genre);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const displayedBooks = searchResults !== null ? searchResults : books;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearchResults={handleSearchResults} />

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sol: Ana İçerik */}
        <div className="flex-1">
          {/* Başlık */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">
              {searchResults !== null ? `Arama Sonuçları (${searchResults.length})` : 'Kütüphanem'}
            </h2>
            <p className="text-gray-500 text-sm">
              {searchResults !== null ? 'Arama sonuçları aşağıda listeleniyor.' : 'Tüm kitaplarınız burada.'}
            </p>
          </div>

          {/* Tür Filtre Butonları */}
          {searchResults === null && (
            <div className="flex flex-wrap gap-2 mb-5">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreFilter(genre)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeGenre === genre
                      ? 'bg-[#1e3a5f] text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1e3a5f] hover:text-[#1e3a5f]'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}

          {/* Kitap Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
            </div>
          ) : displayedBooks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-lg font-medium">Kitap bulunamadı</p>
              <p className="text-sm mt-1">Yeni kitap eklemek için + butonuna tıklayın</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedBooks.map(book => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>

        {/* Sağ: AI Önerileri Paneli */}
        <div className="w-72 hidden lg:block">
          <div className="bg-white rounded-xl shadow-md p-4 sticky top-[76px]">
            <h3 className="font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
              🤖 Sana Özel Öneriler
            </h3>
            {recommendations.length === 0 ? (
              <p className="text-gray-400 text-sm">
                Kitap ekle ve puanla! Yapay zeka sana özel öneriler üretsin.
              </p>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <p className="font-medium text-gray-800 text-sm leading-tight">{rec.title}</p>
                    <p className="text-gray-500 text-xs">{rec.author}</p>
                    {rec.reason && (
                      <p className="text-[#1e3a5f] text-xs mt-1 italic">{rec.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kitap Ekle Butonu */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-[#f59e0b] hover:bg-[#d97706] text-white w-14 h-14 rounded-full shadow-lg text-2xl flex items-center justify-center transition-all hover:scale-110 z-40"
        title="Kitap Ekle"
      >
        +
      </button>

      {/* Modal */}
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
