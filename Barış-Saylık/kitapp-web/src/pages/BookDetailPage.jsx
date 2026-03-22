import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getBook, rateBook, addFavorite, summarizeBook, updateBook, deleteBook } from '../services/api';
import { useToast } from '../context/ToastContext';

// ─── Yıldız Puanlama ─────────────────────────────────
const StarRating = ({ onRate, disabled, initialRating }) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(initialRating || 0);

  const handleSelect = (star) => {
    if (disabled) return;
    setSelected(star);
  };

  const handleRate = () => {
    if (!selected || disabled) return;
    onRate(selected);
  };

  return (
    <div>
      <div className="flex gap-1.5 mb-4 justify-center sm:justify-start">
        {[1, 2, 3, 4, 5].map(star => {
          const isActive = star <= (hovered || selected);
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onMouseEnter={() => !disabled && setHovered(star)}
              onMouseLeave={() => !disabled && setHovered(0)}
              onClick={() => handleSelect(star)}
              className={`text-3xl transition-all duration-300 drop-shadow-sm ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-125 hover:-translate-y-1'} ${isActive ? 'text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]' : 'text-slate-200'} `}
            >
              ★
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleRate}
        disabled={!selected || disabled}
        className="w-full h-[46px] bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
      >
        Puanı Gönder
      </button>
    </div>
  );
};

// ─── Güncelleme Modalı ───────────────────────────────
const UpdateModal = ({ book, onClose, onUpdated }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: book.title || '',
    author: book.author || '',
    genre: book.genre || '',
    description: book.description || '',
    coverImage: book.coverImage || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateBook(book._id, form);
      showToast('Kitap güncellendi ✓', 'success');
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Güncelleme başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md mx-4 p-8 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800">Eseri Düzenle</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center text-slate-400 text-sm transition-colors">✕</button>
        </div>

        {error && <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-4 text-sm font-bold text-rose-600 flex items-center gap-2"><span>⚠️</span> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'title', label: 'Eser Adı', placeholder: 'Kitap adı' },
            { name: 'author', label: 'Yazar', placeholder: 'Yazar adı' },
            { name: 'genre', label: 'Tür', placeholder: 'Roman, Şiir...' },
            { name: 'coverImage', label: 'Kapak URL', placeholder: 'https://...' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
              <input name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition-all text-sm" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Açıklama</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition-all text-sm resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-3.5 bg-white text-slate-600 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-sm">Vazgeç</button>
            <button type="submit" disabled={loading} className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Kaydediliyor...</> : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Kitap Detay Sayfası ─────────────────────────────
const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Aksiyonlar
  const [rateLoading, setRateLoading] = useState(false);
  const [rateDisabled, setRateDisabled] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [favAdded, setFavAdded] = useState(false); // Başlangıçta false, favori kontrol endpoint'i yok
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

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
    setRateLoading(true);
    try {
      await rateBook(bookId, score);
      showToast(`${score} yıldız puanınız kaydedildi!`, 'success');
      setRateDisabled(true);
      loadBook();
    } catch (err) {
      const msg = err.response?.status === 409 ? 'Bu kitabı zaten puanladınız.' : (err.response?.data?.error || 'Puanlama başarısız.');
      showToast(msg, 'error');
      if (err.response?.status === 409) setRateDisabled(true);
    } finally {
      setRateLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (favAdded) return;
    setFavLoading(true);
    try {
      await addFavorite(bookId);
      setFavAdded(true);
      showToast('Koleksiyonunuza eklendi ❤️', 'success');
    } catch (err) {
      const msg = err.response?.status === 409 ? 'Zaten koleksiyonunuzda.' : (err.response?.data?.error || 'Favoriye eklenemedi.');
      showToast(msg, 'error');
      if (err.response?.status === 409) setFavAdded(true);
    } finally {
      setFavLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!book?.description || summaryLoading) return;
    setSummaryLoading(true);
    setSummary('');
    try {
      const res = await summarizeBook(book.description, bookId);
      setSummary(res.data.summary || 'Özet oluşturulamadı.');
      showToast('Yapay Zeka özeti hazır! ✨', 'success');
    } catch {
      setSummary('Özet oluşturulurken asistanımız bir pürüzle karşılaştı.');
      showToast('AI özeti alınamadı.', 'error');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${book?.title}" eserini kalıcı olarak silmek istediğinizden emin misiniz?`)) return;
    try {
      await deleteBook(bookId);
      showToast('Eser başarıyla silindi.', 'info');
      navigate('/home');
    } catch {
      showToast('Eser silinemedi.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 animate-pulse">
           <div className="h-4 bg-slate-200 rounded-full w-32 mb-8"></div>
           <div className="lg:flex gap-10">
             <div className="w-56 h-80 bg-slate-200 rounded-[2rem] flex-shrink-0"></div>
             <div className="flex-1 space-y-4 py-4">
                <div className="h-10 bg-slate-200 rounded-full w-2/3"></div>
                <div className="h-6 bg-slate-200 rounded-full w-1/3"></div>
                <div className="h-24 bg-slate-100 rounded-2xl w-full mt-6"></div>
             </div>
           </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-24">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner text-red-300">💔</div>
          <h2 className="text-2xl font-black text-slate-800">Eser Bulunamadı</h2>
          <p className="text-slate-500 font-medium mt-2">Aradığınız kitap sayfaları arasında kayboldu veya kütüphaneden kaldırıldı.</p>
          <button onClick={() => navigate('/home')} className="mt-8 px-8 py-3.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg">
            Kütüphaneye Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12">
      {/* Decorative Blur */}
      <div className="fixed top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none z-0 opacity-50">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[100%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
      </div>

      <Navbar />
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Üst Kısım: Geri / Actions */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/home')} className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Kütüphaneye Dön
          </button>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowUpdateModal(true)} className="p-2.5 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors border border-slate-100 shadow-sm" title="Eseri Düzenle">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            <button onClick={handleDelete} className="p-2.5 bg-white text-rose-500 rounded-xl font-bold hover:bg-rose-50 transition-colors border border-slate-100 shadow-sm" title="Eseri Sil">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>

        {/* Ana Detay Başlığı */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100/60 p-8 md:p-10 mb-8 relative overflow-hidden">
          {/* İç Dekoratif Blur */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>

          <div className="flex flex-col md:flex-row gap-10 relative z-10">
            {/* Kapak Görseli */}
            <div className="w-full md:w-64 h-auto aspect-[2/3] flex-shrink-0 cursor-pointer group">
              <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-indigo-400 to-purple-500 shadow-xl overflow-hidden relative">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/40"><span className="text-8xl drop-shadow-md">📖</span></div>
                )}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem]"></div>
              </div>
            </div>

            {/* Bilgiler Tablosu */}
            <div className="flex-1 flex flex-col justify-center">
              {book.genre && (
                <div className="mb-4">
                  <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
                    {book.genre}
                  </span>
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight tracking-tight mb-2">{book.title}</h1>
              <p className="text-xl md:text-2xl text-slate-500 font-medium mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-500 to-slate-400">{book.author}</p>

              {/* Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Sayfa', value: book.pageCount, icon: '📄' },
                  { label: 'Yıl', value: book.publishYear, icon: '📅' },
                  { label: 'ISBN', value: book.isbn, icon: '🔢' },
                  { label: 'Değerlendirme', value: book.averageRating > 0 ? `${book.averageRating.toFixed(1)} ⭐` : 'Yok', icon: '🏆' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
                    <span className="text-lg mb-2">{stat.icon}</span>
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">{stat.value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Açıklama Okuma */}
              {book.description && (
                <div className="mt-auto">
                  <p className={`text-[15px] font-medium text-slate-600 leading-relaxed ${showMore ? '' : 'line-clamp-3'}`}>
                    {book.description}
                  </p>
                  {book.description.length > 250 && (
                    <button onClick={() => setShowMore(v => !v)} className="text-sm font-bold text-indigo-600 mt-2 hover:text-indigo-500 transition-colors uppercase tracking-wide">
                      {showMore ? 'Daha Az Göster' : 'Tümünü Oku'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Aksiyon Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Puan Kartı */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100/60 p-8 hover:shadow-md transition-all">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">⭐</div> Puanla</h3>
            <StarRating onRate={handleRate} disabled={rateDisabled || rateLoading} />
          </div>

          {/* Favori Kartı */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100/60 p-8 hover:shadow-md transition-all flex flex-col">
             <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">❤️</div> Koleksiyon</h3>
             <div className="flex-1 flex flex-col items-center justify-center">
                <button
                  onClick={handleFavorite}
                  disabled={favAdded || favLoading}
                  className={`relative group w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${favAdded ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-400'} disabled:cursor-not-allowed`}
                >
                  <svg className={`w-10 h-10 transition-transform duration-500 ${favAdded ? 'fill-current scale-110' : 'fill-none stroke-current stroke-2 group-hover:scale-110'}`} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  {favLoading && <div className="absolute inset-0 rounded-full border-4 border-rose-100 border-t-rose-500 animate-spin"></div>}
                </button>
                <p className={`text-sm font-bold mt-4 uppercase tracking-wider ${favAdded ? 'text-rose-500' : 'text-slate-400'}`}>
                  {favAdded ? 'Koleksiyonda' : 'Koleksiyona Ekle'}
                </p>
             </div>
          </div>

          {/* AI Özet Kartı */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100/60 p-8 hover:shadow-md transition-all flex flex-col relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10"><div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">🤖</div> AI Modülü</h3>
            
            <div className="flex-1 flex flex-col relative z-10">
              {summary ? (
                <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100/60 overflow-y-auto custom-scrollbar">
                  <p className="text-[13px] font-medium text-slate-600 leading-relaxed">{summary}</p>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center flex-col text-center">
                   <p className="text-sm font-bold text-slate-400 mb-6 px-4">Yapay zekanın eseri senin için analiz etmesini sağla.</p>
                   <button
                    onClick={handleSummarize}
                    disabled={!book.description || summaryLoading}
                    className="w-full h-[46px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {summaryLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Analiz Ediliyor...</> : 'Bana Özeti Çıkar'}
                  </button>
                  {!book.description && !summary && <p className="text-[11px] font-bold text-amber-500 mt-3 uppercase tracking-wider">Açıklama Gerekiyor</p>}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {showUpdateModal && (
        <UpdateModal
          book={book}
          onClose={() => setShowUpdateModal(false)}
          onUpdated={loadBook}
        />
      )}
    </div>
  );
};

export default BookDetailPage;
