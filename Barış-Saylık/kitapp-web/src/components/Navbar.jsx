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
      onSearchResults(null); // Aramayı sıfırla
      return;
    }
    try {
      const res = await searchBooks(query);
      onSearchResults(res.data.books || res.data || []);
    } catch {
      onSearchResults([]);
    }
  };

  return (
    <nav className="bg-[#1e3a5f] text-white px-6 py-3 flex items-center justify-between shadow-lg sticky top-0 z-50">
      {/* Logo */}
      <Link
        to="/home"
        className="text-xl font-bold flex items-center gap-2 hover:text-[#f59e0b] transition-colors"
      >
        📚 KitApp
      </Link>

      {/* Arama */}
      <div className="flex-1 mx-8 max-w-md">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Sağ Butonlar */}
      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="text-sm font-medium hover:text-[#f59e0b] transition-colors flex items-center gap-1"
        >
          👤 Profil
        </Link>
        <button
          onClick={handleLogout}
          className="bg-[#f59e0b] hover:bg-[#d97706] text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          Çıkış Yap
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
