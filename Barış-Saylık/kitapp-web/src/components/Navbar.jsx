import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { searchBooks } from '../services/api'

const Navbar = ({ onSearchResults, onClearSearch }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await searchBooks(query.trim())
      let books = []
      if (Array.isArray(res.data?.data))  books = res.data.data
      else if (Array.isArray(res.data?.books)) books = res.data.books
      else if (Array.isArray(res.data))   books = res.data
      onSearchResults?.(books, query.trim())
    } catch {
      onSearchResults?.([], query.trim())
    } finally {
      setSearching(false)
    }
  }

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    // Kullanıcı arama çubuğunu tamamen temizlediğinde normal listeye geri dön
    if (val === '') {
      onClearSearch?.()
    }
  }

  const handleClear = () => {
    setQuery('')
    onClearSearch?.()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : ''

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <span
          onClick={() => navigate('/home')}
          className="text-xl font-bold text-indigo-600 cursor-pointer flex items-center gap-2 flex-shrink-0 select-none"
        >
          📚 KitApp
        </span>

        {/* Arama (giriş yapılmışsa) */}
        {isAuthenticated && (
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="navbar-search"
              name="search"
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Kitap adı, yazar veya ISBN..."
              className="pl-10 pr-10 py-2 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searching ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            ) : query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Sağ — Kullanıcı alanı */}
        {isAuthenticated && (
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => navigate('/profile')}
              className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Profil
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer transition-colors"
            >
              Çıkış
            </button>
            <div
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-indigo-700 transition-colors select-none"
            >
              {initials}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
