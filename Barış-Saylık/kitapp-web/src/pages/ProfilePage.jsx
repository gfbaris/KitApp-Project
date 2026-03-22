import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUser, updateUser, deleteUser, getReadingAnalysis } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// ─── Profil Sayfası (Premium) ───────────────────────────────────
const ProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (!user?._id) return;

    getUser(user._id)
      .then(res => {
        const p = res.data.user || res.data;
        setProfile(p);
        setForm({ firstName: p.firstName || '', lastName: p.lastName || '', email: p.email || '', phone: p.phone || '' });
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));

    getReadingAnalysis(user._id)
      .then(res => setAnalysis(res.data))
      .catch(() => setAnalysis(null))
      .finally(() => setAnalysisLoading(false));
  }, [user]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await updateUser(user._id, form);
      const updated = res.data.user || res.data;
      setProfile(updated);
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setEditing(false);
      showToast('Kişisel bilgilerin güncellendi ✨', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Güncelleme başarısız.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu geri dönüşü olmayan bir karardır. Hesabını silmek istediğinden emin misin?')) return;
    try {
      await deleteUser(user._id);
      logout();
      navigate('/login');
    } catch {
      showToast('Hesap silinirken bir hata oluştu.', 'error');
    }
  };

  const initials = profile ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() : '🌟';

  const stats = analysis?.stats || {};
  const topGenres = stats.topGenres ? Object.entries(stats.topGenres).sort(([, a], [, b]) => b - a) : [];
  const topGenreLabel = topGenres.length > 0 ? topGenres[0][0] : 'Keşfedilmedi';

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 overflow-x-hidden">
      {/* Arka Plan Dekorasyon */}
      <div className="fixed top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0 opacity-60">
        <div className="absolute top-[-20%] left-[60%] w-[50%] h-[100%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
        <div className="absolute top-[30%] left-[-10%] w-[40%] h-[80%] rounded-full bg-rose-500/5 blur-[120px]"></div>
      </div>

      <Navbar />

      <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-8">

        {/* ─── Kart 1: Profil Bilgileri ─── */}
        {profileLoading ? (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 animate-pulse">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-slate-200 rounded-full"></div>
              <div className="space-y-3 flex-1">
                <div className="h-8 bg-slate-200 rounded-full w-1/3"></div>
                <div className="h-4 bg-slate-100 rounded-full w-1/4"></div>
              </div>
            </div>
            <div className="h-4 bg-slate-100 rounded-full w-full mb-4"></div>
            <div className="h-4 bg-slate-100 rounded-full w-2/3"></div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100/60 p-8 md:p-12 relative overflow-hidden group hover:shadow-lg transition-all">
            {profile?.createdAt && (
               <div className="absolute top-8 right-8 text-right hidden md:block">
                  <p className="text-[11px] font-black tracking-widest uppercase text-slate-400">Üyelik Tarihi</p>
                  <p className="text-sm font-medium text-slate-600 mt-1">{new Date(profile.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}</p>
               </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity duration-700"></div>
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl shadow-indigo-500/20 relative z-10">
                    <span className="text-4xl font-black text-white">{initials}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <p className="text-[15px] font-medium text-slate-500 mt-1 bg-clip-text text-transparent bg-gradient-to-r from-slate-500 to-slate-400">{profile?.email}</p>
                </div>
              </div>

              {!editing && (
                <button onClick={() => setEditing(true)} className="px-6 py-3 bg-slate-50 text-indigo-600 rounded-xl font-bold shadow-sm hover:bg-indigo-50 hover:shadow-md transition-all sm:self-center self-start text-sm">
                  Profili Düzenle
                </button>
              )}
            </div>

            {editing ? (
              <div className="pt-8 border-t border-slate-100/60 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adınız</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 transition" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Soyadınız</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 transition" />
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-Posta Adresi</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition" />
                </div>
                <div className="mb-8">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cep Telefonu</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+90 555 123 4567" className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition" />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100/60">
                  <button onClick={() => setEditing(false)} className="px-8 py-3.5 bg-white text-slate-600 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-sm">
                    İptal Et
                  </button>
                  <button onClick={handleSave} disabled={saveLoading} className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2">
                    {saveLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Kaydediliyor...</> : 'Bilgileri Kaydet'}
                  </button>
                </div>
              </div>
            ) : (
              profile?.phone && (
                <div className="pt-6 border-t border-slate-100/60">
                   <div className="inline-block bg-slate-50 rounded-2xl p-4 border border-slate-100">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kayıtlı Telefon</p>
                     <p className="text-base font-bold text-slate-700 ml-1">{profile.phone}</p>
                   </div>
                </div>
              )
            )}

            {/* Tehlikeli Bölge */}
            {!editing && (
              <div className="mt-8 pt-8 border-t border-rose-100/60 flex justify-end">
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-white text-rose-500 border border-rose-200 rounded-xl font-bold hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-sm text-sm"
                >
                  Hesabımı Kalıcı Olarak Sil
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── Kart 2: AI Okuma Profil Analizi ─── */}
        {analysisLoading ? (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 animate-pulse space-y-6">
            <div className="h-6 bg-slate-200 rounded-full w-1/4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-[1.5rem]"></div>)}
            </div>
            <div className="h-4 bg-slate-100 rounded-full w-full"></div>
            <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100/60 p-8 md:p-12 relative overflow-hidden group hover:shadow-lg transition-all">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform"></div>

             <div className="relative z-10 flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-4xl shadow-inner">🤖</div>
               <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kişisel Analiz</h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Yapay Zeka Okuma Profiliniz</p>
               </div>
             </div>

             {/* İstatistik Kutuları */}
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 mb-8 relative z-10">
                {[
                  { label: 'Değerlendirme', value: stats.totalRatings || 0, color: 'text-indigo-600', bg: 'bg-indigo-50/50 border-indigo-100' },
                  { label: 'Okunan Sayfa', value: stats.totalPages || 'Kayıt Yok', color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100' },
                  { label: 'Favori Tür', value: topGenreLabel, color: 'text-rose-600', bg: 'bg-rose-50/50 border-rose-100', sm: true },
                ].map(({ label, value, color, bg, sm }) => (
                  <div key={label} className={`rounded-[1.5rem] p-5 flex flex-col justify-center items-center text-center border shadow-sm ${bg} hover:shadow-md transition-shadow`}>
                    <p className={`font-black tracking-tight ${color} ${sm ? 'text-xl' : 'text-3xl'} mb-1`}>{value}</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                  </div>
                ))}
             </div>

             {/* Yapay Zeka Yorumu */}
             {analysis?.message && !analysis?.insights ? (
               <div className="bg-slate-50 rounded-[1.5rem] p-8 text-center border border-slate-100/80">
                  <p className="text-[15px] font-medium text-slate-500 leading-relaxed max-w-md mx-auto">
                    {analysis.message}
                  </p>
               </div>
             ) : (
                <div className="bg-gradient-to-br from-slate-50 bg-slate-50/50 rounded-[1.5rem] p-8 border border-slate-100/80 shadow-inner relative z-10">
                   <p className="text-[15px] font-medium text-slate-700 leading-loose italic relative">
                     <span className="text-4xl text-indigo-300 absolute -top-4 -left-4 opacity-50">"</span>
                     {analysis?.insights}
                     <span className="text-4xl text-indigo-300 absolute -bottom-6 -right-2 opacity-50">"</span>
                   </p>
                </div>
             )}

             {/* Okuma Dağılımı Tags */}
             {topGenres.length > 0 && (
               <div className="mt-10 relative z-10">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Edebi Tercihleriniz</p>
                 <div className="flex flex-wrap gap-2.5">
                   {topGenres.map(([genre, count]) => (
                     <span key={genre} className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-default">
                       {genre} <span className="ml-1 text-slate-400">({count})</span>
                     </span>
                   ))}
                 </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
