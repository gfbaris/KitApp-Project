import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import { searchBooks } from '../services/api';

const Navbar = ({ onSearchResults }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = async (query) => {
    if (!query) {
      if (onSearchResults) onSearchResults(null);
      return;
    }
    try {
      const res = await searchBooks(query);
      if (onSearchResults) onSearchResults(res.data.books || res.data || []);
    } catch {
      if (onSearchResults) onSearchResults([]);
    }
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-lg border-b border-gray-200/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link
            to="/home"
            className="flex-shrink-0 flex items-center gap-2 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📚</span>
            <span className="text-xl font-extrabold text-[#1e3a5f] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#1e3a5f] to-indigo-600">
              KitApp
            </span>
          </Link>

          {/* Arama Çubuğu */}
          <div className="flex-1 max-w-lg mx-8 hidden sm:block">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Sağ Menü */}
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-indigo-50/50"
            >
              <span className="text-lg">👤</span> <span className="hidden md:block">Profil</span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-sm font-bold px-5 py-2 rounded-xl shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.23)] hover:-translate-y-0.5 transition-all duration-200"
            >
              Çıkış
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
