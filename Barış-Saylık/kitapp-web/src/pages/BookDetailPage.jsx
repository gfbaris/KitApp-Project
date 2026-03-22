import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getBook, rateBook, addFavorite, summarizeBook, updateBook, deleteBook } from '../services/api';
import { useToast } from '../context/ToastContext';

// ─── Yıldız Puanlama ─────────────────────────────────
const StarRating = ({ onRate, disabled }) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

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
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => !disabled && setHovered(0)}
            onClick={() => handleSelect(star)}
            className={`text-2xl transition-all duration-150 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-110'} ${star <= (hovered || selected) ? 'text-amber-400' : 'text-gray-200'}`}
          >
            ★
          </button>
        ))}
      </div>
      {selected > 0 && (
        <p className="text-sm text-gray-500 mb-3">Seçilen: {selected} yıldız</p>
      )}
      <button
        type="button"
        onClick={handleRate}
        disabled={!selected || disabled}
        className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Puanı Kaydet
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
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Kitabı Düzenle</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition-colors">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'title', label: 'Başlık', placeholder: 'Kitap adı' },
            { name: 'author', label: 'Yazar', placeholder: 'Yazar adı' },
            { name: 'genre', label: 'Tür', placeholder: 'Roman, Şiir...' },
            { name: 'coverImage', label: 'Kapak URL', placeholder: 'https://...' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
              <input
                name={name} value={form[name]} onChange={handleChange} placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Açıklama</label>
            <textarea
              name="description" value={form.description} onChange={handleChange} rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              Vazgeç
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Kaydediliyor...</> : 'Kaydet'}
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

  // Kart 1: Puan
  const [rateLoading, setRateLoading] = useState(false);
  const [rateDisabled, setRateDisabled] = useState(false);
  // Kart 2: Favori
  const [favLoading, setFavLoading] = useState(false);
  const [favAdded, setFavAdded] = useState(false);
  // Kart 3: AI Özet
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
      const msg = err.response?.status === 409
        ? 'Bu kitabı zaten puanladınız.'
        : (err.response?.data?.error || 'Puanlama başarısız.');
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
      showToast('Favorilere eklendi!', 'success');
    } catch (err) {
      const msg = err.response?.status === 409
        ? 'Zaten favorilerinizde.'
        : (err.response?.data?.error || 'Favoriye eklenemedi.');
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
      showToast('AI özeti oluşturuldu!', 'success');
    } catch {
      setSummary('Özet oluşturulurken bir hata oluştu.');
      showToast('AI özeti alınamadı.', 'error');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${book?.title}" kitabını silmek istediğinizden emin misiniz?`)) return;
    try {
      await deleteBook(bookId);
      showToast('Kitap silindi.', 'info');
      navigate('/home');
    } catch {
      showToast('Kitap silinemedi.', 'error');
    }
  };

  // ─── Yükleniyor ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-24 mb-6"></div>
          <div className="lg:flex gap-8">
            <div className="w-48 h-64 bg-gray-100 rounded-2xl flex-shrink-0"></div>
            <div className="flex-1 space-y-4 mt-6 lg:mt-0">
              <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              <div className="h-8 bg-gray-100 rounded w-3/4"></div>
              <div className="h-5 bg-gray-100 rounded w-1/2"></div>
              <div className="h-3 bg-gray-100 rounded w-full"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <span className="text-6xl text-gray-200 block mb-4">📭</span>
          <p className="text-lg font-medium text-gray-500">Kitap bulunamadı.</p>
          <button onClick={() => navigate('/home')} className="mt-4 text-indigo-600 hover:underline text-sm font-medium">
            ← Kütüphaneye Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Geri Butonu */}
        <button
          onClick={() => navigate('/home')}
          className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1 mb-6"
        >
          ← Kütüphaneye Dön
        </button>

        {/* Üst Bölüm */}
        <div className="lg:flex gap-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          {/* Kapak */}
          <div className="w-full lg:w-48 h-64 flex-shrink-0 mb-6 lg:mb-0">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover rounded-2xl shadow-lg"
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-5xl text-white/60">📖</span>
              </div>
            )}
          </div>

          {/* Bilgiler */}
          <div className="flex-1 min-w-0">
            {book.genre && (
              <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1 rounded-full mb-3">
                {book.genre}
              </span>
            )}
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{book.title}</h1>
            <p className="text-lg text-gray-500 mt-1">{book.author}</p>

            {/* Meta bilgiler */}
            <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-500">
              {book.pageCount && <span>📄 {book.pageCount} sayfa</span>}
              {book.publishYear && <span>📅 {book.publishYear}</span>}
              {book.averageRating > 0 && <span>⭐ {book.averageRating.toFixed(1)} ortalama</span>}
            </div>

            {/* Açıklama */}
            {book.description && (
              <div className="mt-4">
                <p className={`text-sm text-gray-600 leading-relaxed ${showMore ? '' : 'line-clamp-4'}`}>
                  {book.description}
                </p>
                {book.description.length > 200 && (
                  <button
                    onClick={() => setShowMore(v => !v)}
                    className="text-sm text-indigo-600 font-medium mt-1 hover:text-indigo-700 transition-colors"
                  >
                    {showMore ? 'Daha az göster' : 'Devamını gör'}
                  </button>
                )}
              </div>
            )}

            {/* İşlemler */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-50">
              <button
                onClick={() => setShowUpdateModal(true)}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                ✏️ Kitabı Düzenle
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100 hover:bg-red-100 transition-colors duration-200 text-sm"
              >
                🗑️ Kitabı Sil
              </button>
            </div>
          </div>
        </div>

        {/* 3 Kart Bölümü */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kart 1: Puan Ver */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4">⭐ Kitabı Puanla</h3>
            <StarRating onRate={handleRate} disabled={rateDisabled || rateLoading} />
          </div>

          {/* Kart 2: Favori */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4">❤️ Favoriler</h3>
            <div className="flex flex-col items-center">
              <button
                onClick={handleFavorite}
                disabled={favAdded || favLoading}
                className={`text-5xl mb-4 transition-all duration-300 ${favAdded ? 'grayscale-0' : 'grayscale'} hover:scale-110 disabled:cursor-default`}
              >
                {favAdded ? '❤️' : '🤍'}
              </button>
              <button
                onClick={handleFavorite}
                disabled={favAdded || favLoading}
                className="w-full px-4 py-2.5 rounded-xl font-medium text-sm transition-colors duration-200 bg-pink-50 text-pink-600 border border-pink-100 hover:bg-pink-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {favLoading ? (
                  <><div className="w-4 h-4 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div> Ekleniyor...</>
                ) : favAdded ? '✓ Favorilerde' : 'Favorilere Ekle'}
              </button>
            </div>
          </div>

          {/* Kart 3: AI Özeti */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col">
            <h3 className="text-base font-semibold text-gray-800 mb-4">🤖 AI Özeti</h3>
            {summary ? (
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{summary}</p>
            ) : (
              <button
                onClick={handleSummarize}
                disabled={!book.description || summaryLoading}
                className="w-full px-4 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {summaryLoading ? (
                  <><div className="w-4 h-4 border-2 border-amber-300 border-t-white rounded-full animate-spin"></div> Özet oluşturuluyor...</>
                ) : '✨ Özet Oluştur'}
              </button>
            )}
            {!book.description && !summary && (
              <p className="text-xs text-gray-400 mt-2 text-center">Özet için kitabın açıklaması gereklidir.</p>
            )}
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
