import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BookFormModal from '../components/BookFormModal'
import { getBook, rateBook, addFavorite, deleteFavorite, summarizeBook, deleteBook } from '../services/api'
import { useToast } from '../context/ToastContext'

const BookDetailPage = () => {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [book, setBook]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [showEdit, setShowEdit]   = useState(false)

  // Puanlama
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [rateLoading, setRateLoading] = useState(false)
  const [rateDisabled, setRateDisabled] = useState(false)

  // Favori
  const [isFav, setIsFav]         = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  // AI
  const [summary, setSummary]           = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  const loadBook = async () => {
    try {
      const res = await getBook(bookId)
      const data = res.data.book || res.data
      setBook(data)
      setIsFav(data.isFavorite || false)
      setSelectedRating(data.userRating || 0)
    } catch {
      setBook(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBook() }, [bookId])

  const handleRate = async () => {
    if (!selectedRating) return
    setRateLoading(true)
    try {
      await rateBook(bookId, selectedRating)
      showToast('Puanınız güncellendi! ⭐', 'success')
      loadBook()
    } catch (err) {
      showToast('Puanlama başarısız', 'error')
    } finally {
      setRateLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (favLoading) return
    setFavLoading(true)
    try {
      if (isFav) {
        await deleteFavorite(bookId)
        setIsFav(false)
        showToast('Favorilerden çıkarıldı', 'info')
      } else {
        await addFavorite(bookId)
        setIsFav(true)
        showToast('Favorilere eklendi! ❤️', 'success')
      }
    } catch (err) {
      showToast('İşlem başarısız', 'error')
    } finally {
      setFavLoading(false)
    }
  }

  const handleSummarize = async () => {
    if (!book?.description?.trim()) {
      showToast('Kitabın açıklaması yok', 'error')
      return
    }
    setSummaryLoading(true)
    try {
      const res = await summarizeBook(book.description, bookId)
      setSummary(res.data.summary || 'Özet oluşturulamadı.')
      showToast('AI özeti hazır ✨', 'success')
    } catch {
      showToast('AI özeti oluşturulamadı', 'error')
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`"${book?.title}" kalıcı olarak silinecek. Emin misiniz?`)) return
    try {
      await deleteBook(bookId)
      showToast('Kitap silindi', 'info')
      navigate('/home')
    } catch {
      showToast('Silme işlemi başarısız', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-48" />
          <div className="bg-white rounded-3xl border border-slate-100 p-8 flex gap-8">
            <div className="w-40 h-56 rounded-2xl bg-slate-100 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-slate-100 rounded w-2/3" />
              <div className="h-5 bg-slate-100 rounded w-1/3" />
              <div className="h-20 bg-slate-50 rounded-xl mt-6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-lg font-semibold text-slate-700">Kitap bulunamadı</p>
          <Link to="/home" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline">← Kütüphaneye dön</Link>
        </div>
      </div>
    )
  }

  const gradient = {
    'Roman': 'from-purple-100 to-purple-200',
    'Bilim Kurgu': 'from-emerald-100 to-emerald-200',
    'Tarih': 'from-amber-100 to-amber-200',
    'Polisiye': 'from-sky-100 to-sky-200',
  }[book.genre] || 'from-indigo-100 to-indigo-200'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <p className="text-sm text-slate-500">
          <Link to="/home" className="hover:text-indigo-600 transition-colors">← Kütüphane</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{book.title}</span>
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Kart 1 — Kitap Bilgileri */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="flex gap-8 items-start">
            {/* Kapak */}
            <div className="w-40 h-56 flex-shrink-0 rounded-2xl overflow-hidden shadow-md">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <span className="text-5xl">📖</span>
                </div>
              )}
            </div>

            {/* Detaylar */}
            <div className="flex-1 min-w-0">
              {book.genre && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 mb-2">
                  {book.genre}
                </span>
              )}
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">{book.title}</h1>
              <p className="text-lg text-slate-500 mt-1">{book.author}</p>

              {/* Meta Grid */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { label: 'Sayfa', value: book.pageCount || '—' },
                  { label: 'Yıl',   value: book.publishYear || '—' },
                  { label: 'Ort. Puan', value: book.averageRating > 0 ? `★ ${book.averageRating.toFixed(1)}` : '—', yellow: book.averageRating > 0 },
                ].map(({ label, value, yellow }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className={`text-lg font-bold ${yellow ? 'text-amber-500' : 'text-slate-800'}`}>{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {book.description && (
                <p className="text-sm text-slate-600 leading-relaxed mt-4">{book.description}</p>
              )}

              {/* Aksiyon Butonlar */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Kitabı Düzenle
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 hover:bg-red-100 active:scale-95 transition-all"
                >
                  Kitabı Sil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Aksiyon Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Puan Kartı */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 mb-1 text-center">★ Kitabı Puanla</h3>

            <div className="flex gap-1 justify-center my-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  disabled={rateDisabled}
                  onMouseEnter={() => !rateDisabled && setHoverRating(star)}
                  onMouseLeave={() => !rateDisabled && setHoverRating(0)}
                  onClick={() => !rateDisabled && setSelectedRating(star)}
                  className={`text-3xl cursor-pointer transition-transform hover:scale-110 disabled:cursor-not-allowed ${
                    star <= (hoverRating || selectedRating) ? 'text-amber-400' : 'text-slate-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {selectedRating > 0 && (
              <p className="text-sm text-center text-slate-500 mb-3">{selectedRating}/5 yıldız seçildi</p>
            )}

            <button
              onClick={handleRate}
              disabled={!selectedRating || rateLoading}
              className="mt-auto w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rateLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Puanı Güncelle
            </button>
          </div>

          {/* Favori Kartı */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-800 mb-1">❤️ Favorilerim</h3>

            <div
              onClick={handleFavorite}
              className="text-5xl text-center my-4 cursor-pointer select-none"
            >
              {isFav ? '❤️' : '🤍'}
            </div>

            <p className="text-xs text-slate-500 text-center mb-4">
              {isFav ? 'Favorilerinizde ✓' : 'Okuma listenize ekleyin'}
            </p>

            <button
              onClick={handleFavorite}
              disabled={favLoading}
              className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                isFav 
                  ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {favLoading ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : null}
              {isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            </button>
          </div>

          {/* AI Özeti Kartı */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 mb-1 text-center">🤖 AI Özeti</h3>

            {summary ? (
              <div className="bg-indigo-50 rounded-xl p-4 mt-3 flex-1">
                <p className="text-sm text-indigo-800 leading-relaxed">{summary}</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500 text-center mb-4 mt-2 flex-1">
                  Kitabın açıklamasından yapay zeka özeti oluştur
                </p>
                <button
                  onClick={handleSummarize}
                  disabled={summaryLoading || !book.description}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 text-white text-sm font-semibold rounded-xl hover:bg-amber-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {summaryLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Gemini analiz ediyor...</>
                  ) : 'Özet Oluştur'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <BookFormModal
          isOpen={showEdit}
          editBook={book}
          onClose={() => setShowEdit(false)}
          onSuccess={loadBook}
        />
      )}
    </div>
  )
}

export default BookDetailPage
