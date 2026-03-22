import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      login(token, user);
      
      showToast(`Hoş geldin, ${user.firstName}! 👋`, 'success');
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş yapılamadı.');
      showToast('Giriş bilgileri hatalı', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dekoratif Arka Plan (Glow Effects) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        
        {/* Logo / Başlık Alanı */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-6 transform hover:rotate-6 transition-transform">
            <span className="text-3xl drop-shadow-md text-white">📖</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Başlıyoruz!</h1>
          <p className="text-[15px] font-medium text-slate-500">KitApp dünyasına tekrar hoş geldin.</p>
        </div>

        {/* Giriş Kartı */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/50 relative overflow-hidden">
           {/* Kart içi glow */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[50px]"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-rose-50 border border-rose-100/50 rounded-2xl p-4 text-sm font-bold text-rose-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">⚠️</span> {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-Posta Adresi</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                  </div>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium text-slate-800 placeholder:text-slate-400 transition-all text-[15px]"
                    placeholder="ornek@posta.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Şifre</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                   </div>
                  <input
                    type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium text-slate-800 placeholder:text-slate-400 transition-all text-[15px]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-[15px] shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
            >
              {loading ? <><div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div> Sisteme Giriliyor...</> : 'Giriş Yap'}
            </button>
          </form>

          {/* Alt Yönlendirme */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] relative z-10">
             <span className="text-slate-500 font-medium">Henüz üye değil misin?</span>
             <Link to="/register" className="font-black text-indigo-600 hover:text-purple-600 transition-colors flex items-center gap-1 bg-indigo-50 px-4 py-2 rounded-xl">
               Ücretsiz Hesap Oluştur <span className="text-lg leading-none">→</span>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
