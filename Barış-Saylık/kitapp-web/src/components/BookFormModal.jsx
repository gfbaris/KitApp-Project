import { useState } from 'react'
import { addBook, updateBook } from '../services/api'
import { useToast } from '../context/ToastContext'

const GENRE_OPTIONS = ['Roman', 'Bilim Kurgu', 'Tarih', 'Polisiye', 'Şiir', 'Biyografi', 'Felsefe', 'Fantastik', 'Diğer']

const BookFormModal = ({ isOpen, onClose, onSuccess, editBook = null }) => {
  const { showToast } = useToast()
  const isEdit = !!editBook

  const [form, setForm] = useState({
    title:       editBook?.title       || '',
    author:      editBook?.author      || '',
    genre:       editBook?.genre       || 'Roman',
    pageCount:   editBook?.pageCount   || '',
    publishYear: editBook?.publishYear || '',
    description: editBook?.description || '',
    coverImage:  editBook?.coverImage  || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  if (!isOpen) return null

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form }
      if (payload.pageCount)   payload.pageCount   = Number(payload.pageCount)
      else                     delete payload.pageCount
      if (payload.publishYear) payload.publishYear = Number(payload.publishYear)
      else                     delete payload.publishYear
      if (!payload.coverImage) delete payload.coverImage

      if (isEdit) {
        await updateBook(editBook._id, payload)
        showToast('Kitap güncellendi ✓')
      } else {
        await addBook(payload)
        showToast('Kitap başarıyla eklendi ✓')
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Kutusu */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-slate-100 rounded-t-3xl">
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? 'Kitabı Düzenle' : 'Yeni Kitap Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg hover:bg-slate-100 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-600">
              <span>⚠️</span> {error}
            </div>
          )}

          <div>
            <label className={labelClass}>Kitap Adı *</label>
            <input name="title" required value={form.title} onChange={handleChange} placeholder="Suç ve Ceza" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Yazar *</label>
            <input name="author" required value={form.author} onChange={handleChange} placeholder="Fyodor Dostoyevski" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Tür</label>
            <select name="genre" value={form.genre} onChange={handleChange} className={inputClass}>
              {GENRE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Sayfa Sayısı</label>
              <input name="pageCount" type="number" min="1" value={form.pageCount} onChange={handleChange} placeholder="350" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Yayın Yılı</label>
              <input name="publishYear" type="number" min="1000" max="2100" value={form.publishYear} onChange={handleChange} placeholder="1866" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Açıklama</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Kitap hakkında kısa bir özet..." className={inputClass + ' resize-none'} />
          </div>

          <div>
            <label className={labelClass}>Kapak URL <span className="text-slate-400 font-normal normal-case">(opsiyonel)</span></label>
            <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="https://..." className={inputClass} />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEdit ? 'Güncelleniyor...' : 'Ekleniyor...'}
              </>
            ) : (
              isEdit ? 'Değişiklikleri Kaydet' : 'Kitabı Ekle'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookFormModal
