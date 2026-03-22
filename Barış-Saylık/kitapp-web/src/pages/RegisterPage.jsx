import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const PasswordStrength = ({ password }) => {
  const len = password.length;
  const strength = len === 0 ? 0 : len < 6 ? 1 : len < 8 ? 2 : 3;
  const labels = ['', 'Zayıf', 'Orta', 'Güçlü'];
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400'];
  const textColors = ['', 'text-red-500', 'text-amber-500', 'text-emerald-500'];

  if (!password) return null;

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${strength >= s ? colors[strength] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[strength]}`}>{labels[strength]}</p>
    </div>
  );
};

const RegisterPage = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.phone) delete payload.phone;
      await registerUser(payload);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Kayıt sırasında bir hata oluştu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-lg mx-4">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-2xl font-bold text-gray-900">KitApp'a Katıl</h1>
          <p className="text-sm text-gray-500 mt-1">Kişisel kütüphaneni oluşturmaya başla</p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        {/* Başarı Mesajı */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5 flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            <span className="text-sm text-emerald-700 font-medium">Hesabın oluşturuldu! Giriş sayfasına yönlendiriliyorsun...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ad & Soyad — 2'li grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Ad</label>
              <input
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                required
                placeholder="Barış"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Soyad</label>
              <input
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                required
                placeholder="Saylık"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all"
              />
            </div>
          </div>

          {/* E-posta */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">E-posta Adresi</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="ornek@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all"
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Şifre</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="En az 8 karakter"
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
            <PasswordStrength password={form.password} />
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Telefon <span className="normal-case text-gray-400 font-normal">(opsiyonel)</span>
            </label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+90 555 123 4567"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all"
            />
          </div>

          {/* Kayıt Butonu */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Kayıt yapılıyor...
              </>
            ) : 'Kayıt Ol'}
          </button>
        </form>

        {/* Giriş Linki */}
        <p className="text-sm text-center text-gray-500 mt-6">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
