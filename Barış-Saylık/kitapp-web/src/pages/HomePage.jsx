import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import BookCard from '../components/BookCard'
import SkeletonCard from '../components/SkeletonCard'
import BookFormModal from '../components/BookFormModal'
import { getBooks, filterBooks, getRecommendations } from '../services/api'
import { useAuth } from '../context/AuthContext'

const FILTERS = ['Hepsi', 'Roman', 'Bilim Kurgu', 'Tarih', 'Polisiye', 'Şiir', 'Biyografi']

const parseBooks = (data) => {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.books)) return data.books
  if (Array.isArray(data)) return data
  return []
}



const HomePage = () => {
  const { user } = useAuth()
  const [books, setBooks]                 = useState([])
  const [loading, setLoading]             = useState(true)
  const [activeFilter, setActiveFilter]   = useState('Hepsi')
  const [showModal, setShowModal]         = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [searchQuery, setSearchQuery]     = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [recLoading, setRecLoading]       = useState(true)

  const userId = user?._id || localStorage.getItem('userId')

  const loadBooks = useCallback(async (genre = 'Hepsi') => {
    setLoading(true)
    setSearchResults(null)
    setSearchQuery('')
    try {
      // Kullanıcıya özel kitapları getir (userId filtresi ile)
      const params = { limit: 50 }
      if (userId) params.userId = userId
      const res = genre === 'Hepsi' ? await getBooks(params) : await filterBooks(genre)
      let allBooks = parseBooks(res.data)
      // Eğer API userId filtresini desteklemiyorsa client-side filtrele
      if (userId && allBooks.length > 0 && allBooks[0].userId) {
        allBooks = allBooks.filter(b => b.userId === userId)
      }
      setBooks(allBooks)
    } catch {
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadBooks('Hepsi')

    if (userId) {
      setRecLoading(true)
      getRecommendations(userId)
        .then(res => setRecommendations(res.data?.recommendations || []))
        .catch(() => setRecommendations([]))
        .finally(() => setRecLoading(false))
    } else {
      setRecLoading(false)
    }
  }, [loadBooks, userId])

  const handleFilterClick = (genre) => {
    setActiveFilter(genre)
    loadBooks(genre)
  }

  const handleSearchResults = (results, query) => {
    setSearchResults(results)
    setSearchQuery(query)
    setActiveFilter('Hepsi')
  }

  // Arama temizlendiğinde normal listeye geri dön
  const handleClearSearch = () => {
    setSearchResults(null)
    setSearchQuery('')
    loadBooks(activeFilter)
  }

  const displayed = searchResults !== null ? searchResults : books
  const resultLabel = searchResults !== null
    ? `"${searchQuery}" için ${displayed.length} sonuç`
    : `${displayed.length} kitap bulundu`

  const isLibraryEmpty = !loading && searchResults === null && books.length === 0

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onSearchResults={handleSearchResults} onClearSearch={handleClearSearch} />

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8 items-start">
        {/* Sol Panel — Kitap Listesi */}
        <div className="flex-1 min-w-0">
          {/* Başlık Satırı */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kütüphane</h1>
              <p className="text-sm text-slate-500 mt-0.5">{books.length} eser</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
            >
              <span className="text-lg leading-none font-bold">+</span> Kitap Ekle
            </button>
          </div>

          {/* Arama sonuçları varsa geri dönüş butonu */}
          {searchResults !== null && (
            <button
              onClick={handleClearSearch}
              className="flex items-center gap-2 mb-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Tüm kitaplara dön
            </button>
          )}

          {/* Filtre Butonları (aramada değilse göster) */}
          {searchResults === null && !isLibraryEmpty && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide flex-nowrap">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => handleFilterClick(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all ${
                    activeFilter === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Sonuç Sayısı */}
          {!loading && !isLibraryEmpty && (
            <p className="text-sm text-slate-500 mb-4">{resultLabel}</p>
          )}

          {/* Kitap Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : isLibraryEmpty ? (
            /* ===== BOŞ KÜTÜPHANE DURUMU ===== */
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-100 p-10 text-center max-w-2xl mx-auto my-10">
              <span className="text-6xl block mb-4">📚</span>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Haydi okumaya başla!</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Kütüphanen henüz boş. İlk kitabını ekleyerek dijital kütüphaneni oluşturmaya başla.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md"
              >
                <span className="text-lg leading-none font-bold">+</span> İlk Kitabını Ekle
              </button>
            </div>
          ) : displayed.length === 0 && searchResults !== null ? (
            /* ===== ARAMA SONUÇ YOK ===== */
            <div className="flex flex-col items-center justify-center py-20">
              <span className="text-6xl text-slate-200 mb-4">🔍</span>
              <p className="text-lg font-semibold text-slate-400">Sonuç bulunamadı</p>
              <p className="text-sm text-slate-400 mt-1">Farklı bir arama yapmayı deneyin.</p>
              <button
                onClick={handleClearSearch}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all"
              >
                ← Tüm kitaplara dön
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayed.map(book => <BookCard key={book._id} book={book} />)}
            </div>
          )}
        </div>

        {/* Sağ Panel — AI Önerileri */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-50 rounded-lg p-1.5 text-lg">🤖</div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">Sana Özel Öneriler</p>
                <p className="text-xs text-slate-400">Okuma geçmişine göre</p>
              </div>
            </div>

            {recLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse p-3 rounded-xl bg-slate-50">
                    <div className="h-3 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Daha fazla kitap okuyunca öneriler burada görünür
              </p>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 cursor-pointer transition-colors">
                    <p className="text-sm font-semibold text-slate-800">{rec.title}</p>
                    {rec.author && <p className="text-xs text-slate-500 mt-0.5">{rec.author}</p>}
                    {rec.reason && <p className="text-xs text-indigo-600 mt-1 italic">{rec.reason}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <BookFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => loadBooks(activeFilter)}
      />
    </div>
  )
}

export default HomePage
