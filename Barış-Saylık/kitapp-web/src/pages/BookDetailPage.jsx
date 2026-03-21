import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getBook, rateBook, addFavorite, summarizeBook, updateBook, deleteBook } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Yıldızlı Puanlama Bileşeni
const StarRating = ({ onRate }) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  const handleRate = (score) => {
    setSelected(score);
    onRate(score);
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => handleRate(star)}
          className="text-2xl transition-transform hover:scale-110"
        >
          {star <= (hovered || selected) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
};

// Güncelleme Modal
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1e3a5f]">Kitabı Güncelle</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded px-3 py-2 mb-3 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Başlık" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} placeholder="Yazar" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          <input value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} placeholder="Tür" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          <input value={form.coverImage} onChange={e => setForm({...form, coverImage: e.target.value})} placeholder="Kapak URL" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Açıklama" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] resize-none" />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50">İptal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-60">{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
      setFavMessage('❤️ Favorilere eklendi!');
      setTimeout(() => setFavMessage(''), 3000);
    } catch (err) {
      setFavMessage(err.response?.data?.error || 'Favorilere eklenemedi.');
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
    if (!window.confirm(`"${book?.title}" adlı kitabı silmek istediğinizden emin misiniz?`)) return;
    try {
      await deleteBook(bookId);
      navigate('/home');
    } catch {
      alert('Kitap silinemedi.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onSearchResults={() => {}} />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onSearchResults={() => {}} />
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🚫</div>
          <p className="text-lg">Kitap bulunamadı.</p>
          <button onClick={() => navigate('/home')} className="mt-4 text-[#1e3a5f] underline text-sm">Ana sayfaya dön</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearchResults={() => {}} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/home')} className="text-[#1e3a5f] hover:underline text-sm mb-6 flex items-center gap-1">
          ← Geri dön
        </button>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Kapak */}
            <div className="md:w-56 h-64 md:h-auto bg-gradient-to-br from-[#1e3a5f] to-[#254b7a] flex items-center justify-center flex-shrink-0">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-white p-6">
                  <div className="text-7xl mb-2">📖</div>
                  <p className="text-xs opacity-60">Kapak yok</p>
                </div>
              )}
            </div>

            {/* Detaylar */}
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-1">
                <h1 className="text-2xl font-bold text-[#1e3a5f] leading-tight">{book.title}</h1>
                {book.averageRating > 0 && (
                  <span className="text-yellow-500 font-semibold text-lg">⭐ {book.averageRating.toFixed(1)}</span>
                )}
              </div>
              <p className="text-gray-600 mb-1">{book.author}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {book.genre && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{book.genre}</span>}
                {book.pageCount && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{book.pageCount} sayfa</span>}
                {book.publishYear && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{book.publishYear}</span>}
              </div>
              {book.description && <p className="text-gray-600 text-sm leading-relaxed mb-4">{book.description}</p>}

              {/* Puanlama */}
              <div className="border-t pt-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Puan Ver:</p>
                <StarRating onRate={handleRate} />
                {rateMessage && <p className="text-sm mt-1 text-green-600">{rateMessage}</p>}
              </div>

              {/* Butonlar */}
              <div className="flex flex-wrap gap-2">
                <button onClick={handleFavorite} className="flex items-center gap-1 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 text-sm px-4 py-2 rounded-lg transition">
                  ❤️ Favorilere Ekle
                </button>
                <button onClick={handleSummarize} disabled={!book.description || summaryLoading} className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 text-sm px-4 py-2 rounded-lg transition disabled:opacity-50">
                  {summaryLoading ? '⏳ Özetleniyor...' : '🤖 Özet Oluştur'}
                </button>
                <button onClick={() => setShowUpdateModal(true)} className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-sm px-4 py-2 rounded-lg transition">
                  ✏️ Düzenle
                </button>
                <button onClick={handleDelete} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm px-4 py-2 rounded-lg transition">
                  🗑️ Sil
                </button>
              </div>
              {favMessage && <p className="text-sm mt-2 text-pink-600">{favMessage}</p>}
            </div>
          </div>

          {/* AI Özet */}
          {summary && (
            <div className="border-t bg-purple-50 p-6">
              <h3 className="font-bold text-purple-700 mb-2">🤖 Yapay Zeka Özeti</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
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
