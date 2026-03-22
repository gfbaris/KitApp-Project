import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUser, updateUser, deleteUser, getReadingAnalysis } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// ─── Profil Sayfası ───────────────────────────────────
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

    // Paralel yükleme
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
      showToast('Profil güncellendi ✓', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Güncelleme başarısız.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Hesabınız kalıcı olarak silinecek. Emin misiniz?')) return;
    try {
      await deleteUser(user._id);
      logout();
      navigate('/login');
    } catch {
      showToast('Hesap silinemedi.', 'error');
    }
  };

  const initials = profile
    ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  // İstatistikler
  const stats = analysis?.stats || {};
  const topGenres = stats.topGenres ? Object.entries(stats.topGenres).sort(([, a], [, b]) => b - a) : [];
  const topGenreLabel = topGenres.length > 0 ? topGenres[0][0] : '—';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* ─── Kart 1: Profil Bilgileri ─── */}
        {profileLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-100 rounded w-1/3"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded w-full mb-3"></div>
            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            {/* Üst: Avatar + Bilgi + Düzenle */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-indigo-600">{initials}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">{profile?.email}</p>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors duration-200 text-sm flex-shrink-0"
                >
                  Düzenle
                </button>
              )}
            </div>

            {/* Düzenleme Formu */}
            {editing ? (
              <div className="border-t border-gray-100 pt-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Ad</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Soyad</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white text-sm transition-all" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">E-posta</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white text-sm transition-all" />
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Telefon</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                    placeholder="+90 555 123 4567"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white placeholder:text-gray-400 text-sm transition-all" />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                  >
                    {saveLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Kaydediliyor...</>
                    ) : 'Kaydet'}
                  </button>
                </div>
              </div>
            ) : (
              /* Profil Görünümü */
              profile?.phone && (
                <div className="border-t border-gray-50 pt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Telefon</p>
                  <p className="text-sm text-gray-700">{profile.phone}</p>
                </div>
              )
            )}

            {/* Hesabı Sil */}
            <div className="mt-6 pt-4 border-t border-gray-50">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100 hover:bg-red-100 transition-colors duration-200 text-sm"
              >
                Hesabı Sil
              </button>
            </div>
          </div>
        )}

        {/* ─── Kart 2: AI Okuma Analizi ─── */}
        {analysisLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse space-y-4">
            <div className="h-5 bg-gray-100 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>)}
            </div>
            <div className="h-3 bg-gray-100 rounded w-full"></div>
            <div className="h-3 bg-gray-100 rounded w-5/6"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">🤖 Okuma Profilin</h2>

            {/* İstatistik Kutuları */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Toplam Kitap', value: stats.totalRatings || 0 },
                { label: 'Toplam Sayfa', value: stats.totalPages || '—' },
                { label: 'En Sevilen Tür', value: topGenreLabel, small: true },
              ].map(({ label, value, small }) => (
                <div key={label} className="bg-indigo-50 rounded-xl p-4 text-center">
                  <p className={`font-bold text-indigo-600 ${small ? 'text-sm' : 'text-2xl'} leading-tight`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">{label}</p>
                </div>
              ))}
            </div>

            {/* Boş veya analiz */}
            {analysis?.message && !analysis?.insights ? (
              <p className="text-sm text-gray-400 text-center py-4">
                {analysis.message}
              </p>
            ) : null}

            {/* Content yapısı: önce insights, varsa içgörü listesi */}
            {analysis?.insights && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 leading-relaxed">{analysis.insights}</p>
              </div>
            )}

            {/* Tür dağılımı */}
            {topGenres.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-50">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Okuma Dağılımı</p>
                <div className="flex flex-wrap gap-2">
                  {topGenres.map(([genre, count]) => (
                    <span key={genre} className="bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1 rounded-full">
                      {genre} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!analysis && (
              <p className="text-sm text-gray-400 text-center py-4">
                Analiz için daha fazla kitap derecelendirmen gerekiyor.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
