import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUser, updateUser, deleteUser, getReadingAnalysis } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const [profileRes, analysisRes] = await Promise.allSettled([
        getUser(user._id),
        getReadingAnalysis(user._id),
      ]);
      if (profileRes.status === 'fulfilled') {
        const p = profileRes.value.data.user || profileRes.value.data;
        setProfile(p);
        setForm({ firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone || '' });
      }
      if (analysisRes.status === 'fulfilled') {
        setAnalysis(analysisRes.value.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleSave = async () => {
    setSaveLoading(true);
    setMessage('');
    try {
      const res = await updateUser(user._id, form);
      const updatedUser = res.data.user || res.data;
      setProfile(updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditing(false);
      setMessage('✅ Profil başarıyla güncellendi!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Güncelleme başarısız oldu.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Edebi yolculuğunuzu silmek ve hesabı tamamen kapatmak istediğinize emin misiniz?')) return;
    try {
      await deleteUser(user._id);
      logout();
      navigate('/login');
    } catch {
      alert('Hesap silinemedi.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <Navbar onSearchResults={() => {}} />
        <div className="flex items-center justify-center py-40">
           <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-[spin_1s_linear_infinite]"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-amber-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 pt-24 selection:bg-indigo-500/30">
      <Navbar onSearchResults={() => {}} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-8">

        {/* Kullanıcı Profili Üst Alanı */}
        <div className="bg-white rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 p-8 relative overflow-hidden group">
          
          {/* Arka Plan Dekoratif Blur Efekti */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            
            <div className="flex items-center gap-6">
              {/* Avatar Box */}
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 rounded-[1.5rem] shadow-xl shadow-indigo-500/20 flex items-center justify-center text-white text-4xl font-extrabold transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                {profile?.firstName?.[0]?.toUpperCase() || '?'}
              </div>
              
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <p className="text-slate-500 font-medium tracking-wide mt-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  {profile?.email}
                </p>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors self-start md:self-center shadow-sm"
              >
                ✏️ Bilgileri Düzenle
              </button>
            )}
          </div>

          {message && (
            <div className={`mt-6 rounded-xl px-5 py-3.5 text-sm font-bold backdrop-blur-md ${message.startsWith('✅') ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-rose-50 border border-rose-100 text-rose-700'}`}>
              {message}
            </div>
          )}

          {/* Profil Detayları veya Form */}
          <div className="mt-8 relative z-10 border-t border-slate-100 pt-8">
            {editing ? (
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Adınız</label>
                    <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Soyadınız</label>
                    <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium transition" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Adresiniz</label>
                    <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Telefon</label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+90 555 123 4567" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium transition" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setEditing(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 rounded-xl py-3.5 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                    İptal Et
                  </button>
                  <button onClick={handleSave} disabled={saveLoading} className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0">
                    {saveLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 block">Ad Soyad</span>
                  <span className="text-lg font-bold text-slate-800">{profile?.firstName} {profile?.lastName}</span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 block">Email</span>
                  <span className="text-lg font-bold text-slate-800">{profile?.email}</span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 block">Telefon</span>
                  <span className="text-lg font-bold text-slate-800">{profile?.phone || '—'}</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* AI Okuma Analizi Paneli (Apple/Vercel Tasarımı) */}
        {analysis && (
          <div className="bg-white rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-8 flex items-center gap-3">
              <span className="bg-indigo-50 text-indigo-500 p-2 rounded-xl text-xl shadow-sm">🤖</span>
              KitApp Analizi
            </h2>

            {/* İstatistik Metrikleri */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/50 rounded-2xl p-6 relative overflow-hidden">
                <div className="text-sm font-bold text-indigo-900/40 uppercase tracking-widest mb-1">Puanlanan Eser</div>
                <div className="text-5xl font-extrabold text-indigo-600 tracking-tighter">{analysis.stats?.totalRatings || 0}</div>
              </div>
              
              <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100/50 rounded-2xl p-6 relative overflow-hidden">
                <div className="text-sm font-bold text-rose-900/40 uppercase tracking-widest mb-1">Favori Kitap</div>
                <div className="text-5xl font-extrabold text-rose-500 tracking-tighter">{analysis.stats?.totalFavorites || 0}</div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100/50 rounded-2xl p-6 relative overflow-hidden">
                <div className="text-sm font-bold text-amber-900/40 uppercase tracking-widest mb-1">Puan Ortalaması</div>
                <div className="text-5xl font-extrabold text-amber-500 tracking-tighter">{analysis.stats?.averageScore?.toFixed(1) || '—'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* En Çok Okunan Türler */}
              {analysis.stats?.topGenres && Object.keys(analysis.stats.topGenres).length > 0 && (
                <div>
                  <h3 className="text-[13px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Okuma Yoğunluğu (Tür)</h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {Object.entries(analysis.stats.topGenres)
                      .sort(([,a],[,b]) => b - a)
                      .map(([genre, count]) => (
                        <div key={genre} className="bg-slate-800 text-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
                          <span className="font-bold">{genre}</span>
                          <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-black">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* AI İçgörüler / Yorumlar */}
              {analysis.insights && (
                <div>
                  <h3 className="text-[13px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Yapay Zeka Yorumu</h3>
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
                    <p className="text-slate-600 text-[15px] italic leading-relaxed font-medium">
                      "{analysis.insights}"
                    </p>
                  </div>
                </div>
              )}

            </div>

            {analysis.message && !analysis.insights && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center mt-6">
                <p className="text-slate-500 font-medium">{analysis.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Cautious Zone (Danger) */}
        <div className="pt-6 mt-12 border-t border-slate-200">
           <button 
              onClick={handleDelete} 
              className="group flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-slate-400 hover:text-rose-600 transition-colors bg-white hover:bg-rose-50 border border-slate-200 px-6 py-4 rounded-2xl w-full sm:w-auto"
            >
              <div className="bg-rose-100 text-rose-500 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">🗑️</div>
              <div className="text-center sm:text-left">
                <span className="block font-bold">Hesabınızı Kalıcı Olarak Silin</span>
                <span className="text-xs font-semibold opacity-80">Bu işlem okuma geçmişinizi sonsuza dek silecektir.</span>
              </div>
            </button>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
