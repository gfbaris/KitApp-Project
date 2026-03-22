import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getBook, rateBook, addFavorite, summarizeBook, updateBook, deleteBook } from '../services/api';

// Modern Yıldızlı Puanlama Bileşeni
const StarRating = ({ onRate }) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  const handleRate = (score) => {
    setSelected(score);
    onRate(score);
  };

  return (
    <div className="flex gap-1.5 mb-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => handleRate(star)}
          className={`text-3xl transition-all duration-300 transform hover:scale-125 focus:outline-none ${
            star <= (hovered || selected)
              ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
              : 'text-slate-200 hover:text-amber-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

// Premium Güncelleme Modal
const UpdateModal = ({ book, onClose, onUpdated }) => {
  const [form, setForm] = useState({ title: book.title || '', author: book.author || '', genre: book.genre || '', description: book.description || '', coverImage: book.coverImage || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateBook(book._id, form);
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Güncelleme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <span className="text-indigo-500">✏️</span> Eseri Güncelle
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>
        {error && <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-xl px-4 py-3 mb-5 text-sm font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Başlık" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition" />
          <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} placeholder="Yazar" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition" />
          <input value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} placeholder="Tür" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition" />
          <input value={form.coverImage} onChange={e => setForm({...form, coverImage: e.target.value})} placeholder="Kapak URL" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition" />
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Açıklama" rows={3} className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition resize-none" />
          <div className="flex gap-4 pt-4 mt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white border-2 border-slate-200 text-slate-600 rounded-xl py-3 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all">İptal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-indigo-600 to-[#1e3a5f] hover:from-indigo-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0">
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [rateMessage, setRateMessage] = useState('');
  const [favMessage, setFavMessage] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const loadBook = async () => {
    try {
      const res = await getBook(bookId);
      setBook(res.data.book || res.data);
    } catch {
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBook(); }, [bookId]);

  const handleRate = async (score) => {
    try {
      await rateBook(bookId, score);
      setRateMessage(`✅ ${score} yıldız verdiniz!`);
      setTimeout(() => setRateMessage(''), 3000);
      loadBook();
    } catch (err) {
      setRateMessage(err.response?.data?.error || 'Puanlama başarısız.');
      setTimeout(() => setRateMessage(''), 3000);
    }
  };

  const handleFavorite = async () => {
    try {
      await addFavorite(bookId);
      setFavMessage('❤️ Harika, favorilere eklendi!');
      setTimeout(() => setFavMessage(''), 3000);
    } catch (err) {
      setFavMessage(err.response?.data?.error || 'Görünüşe göre favorilerde zaten var.');
      setTimeout(() => setFavMessage(''), 3000);
    }
  };

  const handleSummarize = async () => {
    if (!book?.description) return;
    setSummaryLoading(true);
    setSummary('');
    try {
      const res = await summarizeBook(book.description, bookId);
      setSummary(res.data.summary || 'Özet oluşturulamadı.');
    } catch {
      setSummary('Özet oluşturulurken bir hata oluştu.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${book?.title}" adlı eseri edebi dünyanızdan silmek istediğinize emin misiniz?`)) return;
    try {
      await deleteBook(bookId);
      navigate('/home');
    } catch {
      alert('Kitap silinemedi.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <Navbar onSearchResults={() => {}} />
        <div className="flex justify-center py-32">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-[spin_1s_linear_infinite]"></div>
            <div className="absolute inset-3 rounded-full border-r-4 border-amber-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <Navbar onSearchResults={() => {}} />
        <div className="flex flex-col items-center justify-center py-40 text-slate-400">
          <div className="text-7xl mb-6">🚫</div>
          <p className="text-2xl font-bold text-slate-800">Eser Bulunamadı</p>
          <button onClick={() => navigate('/home')} className="mt-6 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-full shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
            Kütüphaneye Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 pt-24 selection:bg-indigo-500/30">
      <Navbar onSearchResults={() => {}} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        <button 
          onClick={() => navigate('/home')} 
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-8 transition-colors"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          Geri Dön
        </button>

        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative">
          
          <div className="flex flex-col lg:flex-row">
            
            {/* Sol: Kapak Paneli */}
            <div className="lg:w-[400px] h-[350px] lg:h-auto bg-slate-900 relative">
              {book.coverImage ? (
                <>
                  <div className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-50 scale-110" style={{ backgroundImage: `url(${book.coverImage})` }}></div>
                  <img src={book.coverImage} alt={book.title} className="absolute inset-0 w-full h-full object-contain p-8 drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)] z-10" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] to-indigo-900 flex flex-col items-center justify-center text-white/40">
                  <div className="text-8xl mb-4 drop-shadow-xl">📖</div>
                  <p className="font-semibold tracking-widest uppercase text-xs">Kapak Yok</p>
                </div>
              )}
            </div>

            {/* Sağ: Detaylar */}
            <div className="p-8 md:p-12 flex-1 flex flex-col">
              
              {/* Üst Bilgi Kartı */}
              <div className="mb-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-[1.1]">{book.title}</h1>
                  {book.averageRating > 0 && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-600 px-4 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-sm transform hover:scale-105 transition-transform">
                      <span className="text-lg">⭐</span>
                      <span className="font-extrabold text-xl">{book.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl md:text-2xl font-medium text-slate-500 mb-6">{book.author}</h2>
                
                <div className="flex flex-wrap items-center gap-3">
                  {book.genre && <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">{book.genre}</span>}
                  {book.pageCount && <span className="bg-slate-50 text-slate-600 border border-slate-200 text-sm font-bold px-4 py-1.5 rounded-full">Sayfa: {book.pageCount}</span>}
                  {book.publishYear && <span className="bg-slate-50 text-slate-600 border border-slate-200 text-sm font-bold px-4 py-1.5 rounded-full">Yıl: {book.publishYear}</span>}
                </div>
              </div>

              {/* Açıklama */}
              {book.description ? (
                <div className="prose prose-slate max-w-none mb-10">
                  <p className="text-slate-600 leading-relaxed text-[15px] font-medium">{book.description}</p>
                </div>
              ) : (
                <p className="text-slate-400 italic mb-10">Bu kitap için henüz bir açıklama eklenmemiş.</p>
              )}

              {/* Alt Action Bölümü - Puanlama & Butonlar */}
              <div className="mt-auto grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                
                {/* Puanla */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Eseri Değerlendir</h3>
                  <StarRating onRate={handleRate} />
                  {rateMessage && <p className="text-sm font-semibold text-emerald-500 animate-in fade-in">{rateMessage}</p>}
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex flex-wrap gap-3 justify-start md:justify-end items-end">
                  <button onClick={handleFavorite} className="group flex items-center gap-2 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-500 text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-rose-500/30">
                    <span className="group-hover:scale-110 transition-transform">❤️</span> Favorilere Al
                  </button>
                  {favMessage && <p className="w-full text-right text-sm font-semibold text-rose-500 animate-in fade-in">{favMessage}</p>}
                </div>

              </div>

              {/* Operasyonlar (Yapay Zeka / Düzenle / Sil) */}
              <div className="flex flex-wrap gap-4 mt-8 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <button 
                  onClick={handleSummarize} 
                  disabled={!book.description || summaryLoading} 
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 text-sm font-bold px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {summaryLoading ? '⏳ Literatür Taranıyor...' : '🤖 Yapay Zeka Özeti İste'}
                </button>
                <div className="flex gap-4 flex-1">
                  <button onClick={() => setShowUpdateModal(true)} className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm">
                    ✏️ Düzenle
                  </button>
                  <button onClick={handleDelete} className="flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-slate-200 hover:border-red-200 text-sm font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm">
                    🗑️ Sil
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* AI Özet Sonucu */}
          {summary && (
            <div className="border-t border-purple-100 bg-gradient-to-b from-purple-50 to-white p-8 md:p-12 relative overflow-hidden animate-in slide-in-from-top-4 fade-in duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="font-extrabold text-2xl text-purple-900 mb-4 flex items-center gap-3 relative z-10">
                <span className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner">🤖</span>
                Eser Analizi & Özet
              </h3>
              <p className="text-slate-700 text-[15px] font-medium leading-loose relative z-10 max-w-4xl">{summary}</p>
            </div>
          )}

        </div>
      </div>

      {showUpdateModal && (
        <UpdateModal
          book={book}
          onClose={() => setShowUpdateModal(false)}
          onUpdated={() => { loadBook(); setShowUpdateModal(false); }}
        />
      )}
    </div>
  );
};

export default BookDetailPage;
