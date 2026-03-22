import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Zaten giriş yapmışsa yönlendir
  if (isAuthenticated) {
    navigate('/home');
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) return setError('Şifre en az 6 karakter olmalıdır.');
    if (form.password !== form.confirmPassword) return setError('Şifreler eşleşmiyor, lütfen kontrol edin.');

    setLoading(true);

    try {
      const payload = { ...form };
      if (!payload.phone) delete payload.phone; // Telefon opsiyonel

      await registerUser(payload);
      
      showToast('Harika! Hesabınız oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz.', 'success');
      setSuccess(true);
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıt olurken bir hata oluştu.');
      showToast('Kayıt işlemi başarısız', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Parola gücü göstergesi (Basit)
  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let strength = 0;
    if (p.length >= 6) strength += 25;
    if (p.length >= 10) strength += 25;
    if (/[A-Z]/.test(p)) strength += 25;
    if (/[0-9]/.test(p)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthColor = strength < 50 ? 'bg-rose-400' : strength < 100 ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-x-hidden pb-12 pt-12">
      {/* Dekoratif Arka Plan (Glow Effects) */}
      <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[50%] rounded-full bg-rose-500/10 blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-xl relative z-10">
        
        {/* Logo / Başlık Alanı */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-rose-600 mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-6 transform hover:rotate-6 transition-transform">
            <span className="text-3xl drop-shadow-md text-white">📖</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Aramıza Katıl</h1>
          <p className="text-[15px] font-medium text-slate-500">Kitap kurdu topluluğumuzun bir parçası ol.</p>
        </div>

        {/* Kayıt Kartı */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/50 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[50px]"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-rose-50 border border-rose-100/50 rounded-2xl p-4 text-sm font-bold text-rose-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">⚠️</span> {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-100/50 rounded-2xl p-4 text-sm font-bold text-emerald-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                 <span className="bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">🎉</span> Hesabınız başarıyla oluşturuldu! Girişe yönlendiriliyorsunuz...
              </div>
            )}

            {/* Grid Yapısı ile Ad Soyad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adınız <span className="text-rose-400">*</span></label>
                <input
                  name="firstName" required value={form.firstName} onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium text-slate-800 placeholder:text-slate-400 transition-all text-[15px]"
                  placeholder="Ahmet"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Soyadınız <span className="text-rose-400">*</span></label>
                <input
                  name="lastName" required value={form.lastName} onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium text-slate-800 placeholder:text-slate-400 transition-all text-[15px]"
                  placeholder="Yılmaz"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-Posta Adresi <span className="text-rose-400">*</span></label>
              <input
                name="email" type="email" required value={form.email} onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium text-slate-800 placeholder:text-slate-400 transition-all text-[15px]"
                placeholder="ornek@posta.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex justify-between">
                <span>Cep Telefonu</span>
                <span className="text-slate-300 font-medium normal-case tracking-normal">İsteğe bağlı</span>
              </label>
              <input
                name="phone" type="tel" value={form.phone} onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium text-slate-800 placeholder:text-slate-400 transition-all text-[15px]"
                placeholder="+90 555 123 4567"
              />
            </div>

            {/* Pano - Şifreler */}
            <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] space-y-5">
               <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Güvenli Şifre <span className="text-rose-400">*</span></label>
                  <div className="relative group">
                    <input
                      name="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={handleChange}
                      className="w-full pl-5 pr-12 py-4 bg-white border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium text-slate-800 placeholder:text-slate-300 transition-all text-[15px]"
                      placeholder="En az 6 karakter"
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                      )}
                    </button>
                  </div>
                  {/* Güç Çubuğu */}
                  {form.password && (
                    <div className="mt-3 px-1">
                      <div className="flex gap-1.5 h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ease-out ${strengthColor}`} style={{ width: `${strength}%` }}></div>
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${strength < 50 ? 'text-rose-500' : strength < 100 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {strength < 50 ? 'Zayıf Parola' : strength < 100 ? 'Orta Düzey Parola' : 'Güçlü Parola'}
                      </p>
                    </div>
                  )}
               </div>

               <div>
                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Şifre Tekrar <span className="text-rose-400">*</span></label>
                 <input
                   name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={form.confirmPassword} onChange={handleChange}
                   className="w-full px-5 py-4 bg-white border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium text-slate-800 placeholder:text-slate-300 transition-all text-[15px]"
                   placeholder="Aynı şifreyi giriniz"
                 />
               </div>
            </div>

            <button
              type="submit" disabled={loading || success}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-rose-600 text-white rounded-2xl font-black text-[15px] shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
            >
              {loading ? <><div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div> Hesap Oluşturuluyor...</> : 'Kayıt Ol'}
            </button>
          </form>

          {/* Alt Yönlendirme */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] relative z-10">
             <span className="text-slate-500 font-medium">Zaten üye misiniz?</span>
             <Link to="/login" className="font-black text-indigo-600 hover:text-purple-600 transition-colors flex items-center gap-1 bg-indigo-50 px-4 py-2 rounded-xl">
               Sisteme Giriş Yap <span className="text-lg leading-none">→</span>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
