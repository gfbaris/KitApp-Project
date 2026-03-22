import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchBooks } from '../services/api';

const Navbar = ({ onSearchResults }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !query.trim()) return;
    setSearching(true);
    try {
      const res = await searchBooks(query.trim());
      const books = res.data.books || res.data || [];
      if (onSearchResults) onSearchResults(books, query.trim());
    } catch {
      if (onSearchResults) onSearchResults([], query.trim());
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearchResults) onSearchResults(null, '');
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '';

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          to="/home"
          className="text-xl font-bold text-indigo-600 cursor-pointer flex-shrink-0 hover:text-indigo-700 transition-colors flex items-center gap-1.5"
        >
          <span>📚</span>
          <span>KitApp</span>
        </Link>

        {/* Arama Kutusu — sadece giriş yapılmışsa */}
        {isAuthenticated && (
          <div className="hidden sm:flex flex-1 max-w-md relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {searching ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
              ) : (
                <span className="text-base">🔍</span>
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Kitap adı, yazar veya ISBN ara..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-800 bg-white placeholder:text-gray-400 transition-all"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Sağ Taraf */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Kayıt Ol
              </Link>
            </>
          ) : (
            <>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-indigo-600">{initials}</span>
              </div>
              {/* Ad Soyad */}
              <span className="text-sm text-gray-700 font-medium hidden md:block">
                {user?.firstName} {user?.lastName}
              </span>
              {/* Profil */}
              <Link
                to="/profile"
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                Profil
              </Link>
              {/* Çıkış */}
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
              >
                Çıkış
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
