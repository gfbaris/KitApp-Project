import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      const { token, user } = res.data;
      // Token ve userId'yi localStorage'a yaz, ardından context'e aktar
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      login(token, user);
      navigate('/home');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'E-posta veya şifre hatalı.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md mx-4">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-2xl font-bold text-gray-900">KitApp</h1>
          <p className="text-sm text-gray-500 mt-1">Kütüphanene hoş geldin</p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              E-posta Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="ornek@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all"
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Giriş Butonu */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Giriş yapılıyor...
              </>
            ) : 'Giriş Yap'}
          </button>
        </form>

        {/* Ayırıcı */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 border-t border-gray-100"></div>
          <span className="text-xs text-gray-400 font-medium">veya</span>
          <div className="flex-1 border-t border-gray-100"></div>
        </div>

        {/* Kayıt Linki */}
        <p className="text-sm text-center text-gray-500">
          Hesabın yok mu?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
