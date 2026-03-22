import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const RegisterPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.phone) delete payload.phone;
      await registerUser(payload);
      navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#1e3a5f] via-[#0a192f] to-[#0a192f] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Arka Plan Dekoratif Blur Efektleri */}
      <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
      <div className="absolute top-1/2 right-0 w-[24rem] h-[24rem] bg-amber-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-[28rem] relative z-10 my-8">
        
        {/* Glassmorphism Kart */}
        <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.15] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 sm:p-10 transition-all duration-300">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
              <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">📚</span>
              KitApp
            </h1>
            <p className="text-blue-200/70 mt-3 font-medium text-sm">Hayalindeki kütüphaneye ilk adımı at!</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2 backdrop-blur-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Adınız</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Barış"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-white/10 transition-all duration-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Soyadınız</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Saylık"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-white/10 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">E-Posta Adresi</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-white/10 transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Şifre</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="En az 8 karakter"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-white/10 transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">
                Telefon <span className="opacity-50 text-[10px] lowercase">(İsteğe bağlı)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+90 555 123 4567"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-white/10 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none active:scale-95 text-[15px] tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Kayıt Yapılıyor...
                </span>
              ) : 'Hemen Kayıt Ol'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400 font-medium">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors border-b border-transparent hover:border-indigo-300 pb-0.5 ml-1">
              Giriş Yapın
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
