import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      login(token, user);
      navigate('/home');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Giriş başarısız. Email veya şifre hatalı.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a192f] to-[#0a192f] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Arka Plan Dekoratif Blur Efektleri */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Glassmorphism Kart */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 sm:p-10 transition-all duration-300 transform">
          
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">📚</div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight">
              KitApp
            </h1>
            <p className="text-blue-200/80 mt-2 font-medium">Hoş Geldiniz, Kütüphanenize Bağlanın</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2 backdrop-blur-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-200 ml-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-white/10 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-200 ml-1">Şifre</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-white/10 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Giriş Yapılıyor...
                </span>
              ) : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-amber-400 font-bold hover:text-amber-300 transition-colors border-b border-transparent hover:border-amber-300 pb-0.5">
              Hemen Kayıt Olun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
