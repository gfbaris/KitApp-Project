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
      let booksData = [];
      if (Array.isArray(res.data?.data)) booksData = res.data.data;
      else if (Array.isArray(res.data?.books)) booksData = res.data.books;
      else if (Array.isArray(res.data)) booksData = res.data;
      
      if (onSearchResults) onSearchResults(booksData, query.trim());
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
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          to="/home"
          className="group flex items-center gap-2.5 text-2xl font-black tracking-tight cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            <span className="text-white text-xl">📖</span>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-900 drop-shadow-sm group-hover:from-indigo-600 group-hover:to-purple-800 transition-all">
            KitApp
          </span>
        </Link>

        {/* Arama Kutusu */}
        {isAuthenticated && (
          <div className="hidden md:flex flex-1 max-w-lg relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
              {searching ? (
                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Kitaplarda keşfe çık..."
              className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200/60 bg-slate-50/50 backdrop-blur-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal transition-all duration-300 shadow-inner"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            )}
          </div>
        )}

        {/* Sağ Menü */}
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
              >
                Ücretsiz Katıl
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50/50 border border-slate-100 p-1.5 pl-4 rounded-2xl backdrop-blur-md">
              <span className="text-sm text-slate-600 font-bold hidden sm:block mr-2 tracking-wide">
                {user?.firstName}
              </span>
              <div className="group relative">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md transform hover:scale-105 hover:rotate-3 transition-all"
                >
                  {initials}
                </button>
              </div>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <button
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Çıkış Yap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
