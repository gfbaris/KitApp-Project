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
      setMessage('✅ Profil güncellendi!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Güncelleme başarısız.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;
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
      <div className="min-h-screen bg-gray-50">
        <Navbar onSearchResults={() => {}} />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearchResults={() => {}} />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Profil Kartı */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile?.firstName?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1e3a5f]">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <p className="text-gray-500 text-sm">{profile?.email}</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2 rounded-lg transition"
              >
                ✏️ Düzenle
              </button>
            )}
          </div>

          {message && (
            <div className={`rounded-lg px-4 py-2 mb-4 text-sm ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ad</label>
                  <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Soyad</label>
                  <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+90 555 123 4567" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)} className="flex-1 border text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50">İptal</button>
                <button onClick={handleSave} disabled={saveLoading} className="flex-1 bg-[#1e3a5f] text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-60">
                  {saveLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 block text-xs mb-0.5">Ad Soyad</span>
                <span className="font-medium text-gray-800">{profile?.firstName} {profile?.lastName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs mb-0.5">Email</span>
                <span className="font-medium text-gray-800">{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div>
                  <span className="text-gray-400 block text-xs mb-0.5">Telefon</span>
                  <span className="font-medium text-gray-800">{profile.phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Hesabı Sil */}
          <div className="mt-6 pt-4 border-t">
            <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm underline">
              🗑️ Hesabımı sil
            </button>
          </div>
        </div>

        {/* AI Okuma Analizi Kartı */}
        {analysis && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-[#1e3a5f] mb-4">🤖 Okuma Analizi</h2>

            {/* İstatistikler */}
            {analysis.stats && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center bg-blue-50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-[#1e3a5f]">{analysis.stats.totalRatings || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Puanlanan Kitap</div>
                </div>
                <div className="text-center bg-pink-50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-pink-600">{analysis.stats.totalFavorites || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Favori</div>
                </div>
                <div className="text-center bg-yellow-50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-yellow-600">{analysis.stats.averageScore?.toFixed(1) || '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">Ort. Puan</div>
                </div>
              </div>
            )}

            {/* En Çok Okunan Türler */}
            {analysis.stats?.topGenres && Object.keys(analysis.stats.topGenres).length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">En Çok Okunan Türler</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.stats.topGenres)
                    .sort(([,a],[,b]) => b - a)
                    .map(([genre, count]) => (
                      <span key={genre} className="bg-[#1e3a5f] text-white text-xs px-3 py-1 rounded-full">
                        {genre} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* AI İçgörüler */}
            {analysis.insights && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.insights}</p>
              </div>
            )}

            {/* Mesaj (yeterli veri yoksa) */}
            {analysis.message && (
              <p className="text-gray-500 text-sm text-center py-4">{analysis.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
