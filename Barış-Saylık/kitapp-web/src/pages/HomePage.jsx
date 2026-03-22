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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 border border-slate-100">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <span className="text-amber-500">📖</span> Yeni Kitap Ekle
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
              ✕
            </button>
          </div>

          {error && <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-xl px-4 py-3 mb-5 text-sm font-medium">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Kitap Adı</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700" placeholder="Suç ve Ceza" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Yazar</label>
              <input required value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700" placeholder="Fyodor Dostoyevski" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Kategori (Tür)</label>
              <select value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 appearance-none">
                {GENRES.filter(g => g !== 'Hepsi').map(g => <option key={g}>{g}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Sayfa Sayısı</label>
                <input type="number" value={form.pageCount} onChange={e => setForm({...form, pageCount: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700" placeholder="Örn: 350" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Basım Yılı</label>
                <input type="number" value={form.publishYear} onChange={e => setForm({...form, publishYear: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700" placeholder="Örn: 2023" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Kapak Görseli (URL)</label>
              <input value={form.coverImage} onChange={e => setForm({...form, coverImage: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700" placeholder="https://..." />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Kısa Açıklama</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 resize-none" placeholder="Kitap hakkında düşüncelerin..." />
            </div>

            <div className="flex gap-4 pt-4 mt-2">
              <button type="button" onClick={onClose} className="flex-1 bg-white border-2 border-slate-200 text-slate-600 rounded-xl py-3.5 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all">
                İptal Et
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-indigo-600 to-[#1e3a5f] hover:from-indigo-500 hover:to-indigo-700 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 transition-all">
                {loading ? 'Kitap Ekleniyor...' : 'Kitabı Kütüphaneye Ekle'}
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
  const [searchResults, setSearchResults] = useState(null); 

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
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-24 selection:bg-indigo-500/30">
      <Navbar onSearchResults={handleSearchResults} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 flex flex-col lg:flex-row gap-8">
        
        {/* Sol İçerik: Kütüphane Grid */}
        <div className="flex-1 w-full">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-200/60">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                {searchResults !== null ? '🔍 Arama Sonuçları' : 'Kütüphanem'}
              </h2>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">
                {searchResults !== null 
                  ? `${searchResults.length} kitap bulundu.` 
                  : 'Okuduğun ve sakladığın tüm eserler burada sergileniyor.'}
              </p>
            </div>
            {searchResults === null && (
              <div className="text-right mt-3 md:mt-0">
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  TOPLAM {books.length} KİTAP
                </span>
              </div>
            )}
          </div>

          {/* Filtre Pilleri (Pills) */}
          {searchResults === null && (
            <div className="flex flex-wrap gap-2.5 mb-8">
              {GENRES.map((genre) => {
                const isActive = activeGenre === genre;
                return (
                  <button
                    key={genre}
                    onClick={() => handleGenreFilter(genre)}
                    className={`px-5 py-2 rounded-full text-[13px] font-bold tracking-wide transition-all duration-300 ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-md shadow-slate-800/20 ring-2 ring-slate-800 ring-offset-2 ring-offset-[#f8fafc]'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-900 shadow-sm'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          )}

          {/* Kitaplar */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-[spin_1s_linear_infinite]"></div>
                <div className="absolute inset-2 rounded-full border-r-2 border-amber-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
              </div>
            </div>
          ) : displayedBooks.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center mt-4">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner">
                {searchResults !== null ? '📭' : '📚'}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {searchResults !== null ? 'Sonuç Bulunamadı' : 'Kitaplığın Henüz Boş'}
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                {searchResults !== null 
                  ? 'Farklı bir kelime ile aramayı deneyebilirsin.' 
                  : 'Fiziksel kütüphaneni dijitale taşımanın tam vakti. Hemen sağ alttaki "+" butonuna tıkla ve ilk kitabını ekle.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayedBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>

        {/* Sağ Panel: Yapay Zeka Önerileri */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-24 bg-gradient-to-v from-white to-slate-50 rounded-[2rem] shadow-xl shadow-indigo-900/5 border border-indigo-50/50 p-6 relative overflow-hidden group">
            
            {/* Arka plan dekoratif balon */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>

            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 mb-5">
                <span className="text-2xl animate-pulse">✨</span>
              </div>
              <h3 className="font-extrabold text-xl text-slate-800 tracking-tight leading-tight mb-2">
                Yapay Zeka Pick'leri
              </h3>
              <p className="text-xs font-medium text-slate-500 mb-6">
                Senin okuma geçmişini analiz ettik. İşte listeye alman gereken spesifik eserler.
              </p>

              {recommendations.length === 0 ? (
                <div className="bg-white/50 border border-slate-100 rounded-xl p-4 text-center">
                  <p className="text-slate-500 text-xs font-medium">Yeterli veri yok.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, i) => (
                    <div 
                      key={i} 
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-default group/card"
                    >
                      <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1 group-hover/card:text-indigo-600 transition-colors">
                        {rec.title}
                      </h4>
                      <p className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold mb-2">
                        {rec.author}
                      </p>
                      {rec.reason && (
                        <div className="bg-indigo-50/50 rounded-xl p-2.5">
                          <p className="text-indigo-700/80 text-xs leading-relaxed italic font-medium">
                            "{rec.reason}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Modern Yüzen Ekleme Butonu */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 lg:bottom-10 lg:right-10 w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.5)] flex items-center justify-center text-3xl transition-all duration-300 hover:scale-110 active:scale-95 group z-40"
        title="Kitap Ekle"
      >
        <span className="transform transition-transform group-hover:rotate-90">＋</span>
      </button>

      {/* Modal Render */}
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
