import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import BookCard from '../components/BookCard'
import { getUser, updateUser, deleteUser, getReadingAnalysis, getBooks, getFavorites } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'

const parseBooks = (data) => {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.books)) return data.books
  if (Array.isArray(data)) return data
  return []
}

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [profile, setProfile]       = useState(null)
  const [analysis, setAnalysis]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(true)

  // Kullanıcının kendi kitaplarından hesaplanan gerçek istatistikler
  const [userBookCount, setUserBookCount]     = useState(0)
  const [userTotalPages, setUserTotalPages]   = useState(0)
  const [booksLoading, setBooksLoading]       = useState(true)

  const [favorites, setFavorites]             = useState([])
  const [favLoading, setFavLoading]           = useState(true)

  const [editMode, setEditMode]     = useState(false)
  const [form, setForm]             = useState({})
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    const userId = user?._id || localStorage.getItem('userId')
    if (!userId) return

    // 1) Profil bilgileri
    getUser(userId)
      .then(res => {
        const p = res.data.user || res.data
        setProfile(p)
        setForm({ firstName: p.firstName || '', lastName: p.lastName || '', email: p.email || '', phone: p.phone || '' })
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    // 2) AI Okuma analizi
    getReadingAnalysis(userId)
      .then(res => setAnalysis(res.data))
      .catch(() => setAnalysis(null))
      .finally(() => setAnalysisLoading(false))

    // 3) Kitapları çekip doğru istatistikleri hesapla
    getBooks({ userId, limit: 200 })
      .then(res => {
        let allBooks = parseBooks(res.data)
        // Client-side userId filtresi (API filtrelemiyorsa)
        if (allBooks.length > 0 && allBooks[0].userId) {
          allBooks = allBooks.filter(b => b.userId === userId)
        }
        setUserBookCount(allBooks.length)
        const totalPages = allBooks.reduce((sum, b) => sum + (b.pageCount || 0), 0)
        setUserTotalPages(totalPages)
      })
      .catch(() => {
        setUserBookCount(0)
        setUserTotalPages(0)
      })
      .finally(() => setBooksLoading(false))

    // 4) Favori Kitaplar
    getFavorites()
      .then(res => setFavorites(res.data?.data || []))
      .catch(() => setFavorites([]))
      .finally(() => setFavLoading(false))
  }, [user])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const userId = user?._id || localStorage.getItem('userId')
      const res = await updateUser(userId, form)
      const updated = res.data.user || res.data
      setProfile(updated)
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(updated))
      setEditMode(false)
      showToast('Profil güncellendi! ✓', 'success')
    } catch {
      showToast('Güncelleme başarısız', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Hesabınız kalıcı silinecek. Emin misiniz?')) return
    try {
      const userId = user?._id || localStorage.getItem('userId')
      await deleteUser(userId)
      logout()
      navigate('/login')
    } catch {
      showToast('Silme işlemi başarısız', 'error')
    }
  }

  const initials = profile
    ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase()
    : '??'

  const stats = analysis?.stats || {}
  const topGenres = stats.topGenres ? Object.entries(stats.topGenres).sort(([, a], [, b]) => b - a) : []
  const topGenre = topGenres[0]?.[0] || '—'
  const insights = analysis?.insights ? (typeof analysis.insights === 'string' ? [analysis.insights] : analysis.insights) : []

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Kart 1 — Profil Bilgileri */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 animate-pulse">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            {/* Üst Satır */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0 select-none">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                {!editMode ? (
                  <>
                    <h2 className="text-2xl font-bold text-slate-900">{profile?.firstName} {profile?.lastName}</h2>
                    <p className="text-slate-500 text-sm mt-0.5">{profile?.email}</p>
                    {profile?.phone && <p className="text-slate-400 text-sm mt-0.5">{profile.phone}</p>}
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Ad</label>
                      <input id="profile-firstName" name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Soyad</label>
                      <input id="profile-lastName" name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>E-posta</label>
                      <input id="profile-email" name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Telefon</label>
                      <input id="profile-phone" name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                )}
              </div>

              {/* Butonlar */}
              <div className="flex gap-2 flex-shrink-0 self-start">
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    Profili Düzenle
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                      Kaydet
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
                    >
                      İptal
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Ayırıcı + Hesap Sil */}
            <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Hesabı Sil</p>
                <p className="text-xs text-slate-400 mt-0.5">Bu işlem geri alınamaz</p>
              </div>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 hover:bg-red-100 active:scale-95 transition-all"
              >
                Kalıcı Olarak Sil
              </button>
            </div>
          </div>
        )}

        {/* Kart 2 — Okuma Analizi */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          {/* Başlık */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-50 rounded-xl p-2">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Okuma Profilin</h2>
              <p className="text-sm text-slate-400">Yapay zeka analizi</p>
            </div>
          </div>

          {analysisLoading || booksLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
              </div>
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-50 rounded-xl" />)}
            </div>
          ) : (
            <>
              {/* İstatistik Grid — Kitap sayısı ve sayfa sayısı artık doğru hesaplanıyor */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Toplam Kitap', value: userBookCount },
                  { label: 'Toplam Sayfa', value: userTotalPages >= 1000 ? `${(userTotalPages / 1000).toFixed(1)}K` : userTotalPages },
                  { label: 'Favori Tür', value: topGenre, bold: true },
                ].map(({ label, value, bold }) => (
                  <div key={label} className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-5 text-center">
                    <p className={`text-3xl font-bold text-indigo-600 ${bold ? 'text-xl' : ''}`}>{value}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Okuma Sıklığı */}
              {analysis?.readingFrequency && (
                <p className="text-sm text-slate-600 mb-4">
                  📊 {analysis.readingFrequency}
                </p>
              )}

              {/* İçgörüler */}
              {insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400 text-center py-4">
                  {analysis?.message || 'Kitap değerlendirince analiz burada görünür'}
                </div>
              )}
            </>
          )}
        </div>

        {/* Kart 3 — Favori Kitaplarım */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-rose-50 rounded-xl p-2">
              <span className="text-2xl">❤️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Favori Kitaplarım</h2>
              <p className="text-sm text-slate-400">En sevdiğin {favorites.length > 0 ? favorites.length : ''} kitap</p>
            </div>
          </div>

          {favLoading ? (
            <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-2xl" />)}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {favorites.map(book => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              <span className="text-4xl block mb-2 opacity-40 grayscale">📚</span>
              <p className="text-sm font-semibold text-slate-600">Henüz favori kitabınız bulunmuyor.</p>
              <p className="text-xs text-slate-400 mt-1">Kitapları incelerken kalp ikonuna tıklayarak favori listenizi oluşturabilirsiniz.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default ProfilePage
