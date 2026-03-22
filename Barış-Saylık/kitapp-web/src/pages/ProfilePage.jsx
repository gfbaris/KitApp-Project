import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, updateUser, deleteUser, getReadingAnalysis } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (!user?._id) return;

    Promise.all([
      getUser(user._id).then(res => res.data.user || res.data).catch(() => null),
      getReadingAnalysis(user._id).then(res => res.data).catch(() => null)
    ]).then(([p, a]) => {
      setProfile(p);
      setAnalysis(a);
      setForm({ firstName: p?.firstName || '', lastName: p?.lastName || '', email: p?.email || '', phone: p?.phone || '' });
      setLoading(false);
    });
  }, [user]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await updateUser(user._id, form);
      const updated = res.data.user || res.data;
      setProfile(updated);
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setEditing(false);
      showToast('Profile updated', 'success');
    } catch {
      showToast('Update failed', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete account permanently?')) return;
    try {
      await deleteUser(user._id);
      logout();
      navigate('/login');
    } catch { showToast('Error deleting account', 'error'); }
  };

  if (loading) {
     return <div className="p-8 text-sm text-slate-500 flex items-center gap-2"><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent animate-spin rounded-full"></div> Loading profile...</div>;
  }

  const stats = analysis?.stats || {};
  const topGenres = stats.topGenres ? Object.entries(stats.topGenres).sort(([, a], [, b]) => b - a) : [];
  const topGenreLabel = topGenres.length > 0 ? topGenres[0][0] : 'N/A';
  const initials = `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="py-8 px-6 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-[14px] text-slate-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <h2 className="text-sm font-semibold text-slate-900">Personal Information</h2>
           {!editing && (
             <button onClick={() => setEditing(true)} className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
               Edit
             </button>
           )}
        </div>
        
        <div className="p-6">
           <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-white text-xl font-semibold shrink-0">
                {initials}
              </div>
              <div>
                 <h3 className="text-lg font-semibold text-slate-900">{profile?.firstName} {profile?.lastName}</h3>
                 <p className="text-sm text-slate-500">{profile?.email}</p>
                 <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Joined {new Date(profile?.createdAt).getFullYear()}</p>
              </div>
           </div>

           {editing ? (
             <form onSubmit={handleSave} className="space-y-4 max-w-md border-t border-slate-100 pt-6">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wide">First Name</label>
                      <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition" />
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wide">Last Name</label>
                      <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition" />
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wide">Email</label>
                   <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition" />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wide">Phone</label>
                   <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition" />
                </div>
                <div className="flex gap-2 pt-2">
                   <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium transition">Cancel</button>
                   <button type="submit" disabled={saveLoading} className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition flex items-center justify-center min-w-[100px]">
                     {saveLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save'}
                   </button>
                </div>
             </form>
           ) : (
             <div className="max-w-md border-t border-slate-100 pt-4 grid grid-cols-2 gap-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Phone Number</p>
                  <p className="text-[13px] font-medium text-slate-900">{profile?.phone || '—'}</p>
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="mb-8">
         <h2 className="text-lg font-semibold text-slate-900 mb-4">Analytics</h2>
         
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
               <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Books Rated</p>
               <p className="text-3xl font-semibold text-slate-900">{stats.totalRatings || 0}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
               <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Pages Read</p>
               <p className="text-3xl font-semibold text-slate-900">{stats.totalPages || 0}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
               <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Favorite Genre</p>
               <p className="text-xl font-semibold text-slate-900 mt-1">{topGenreLabel}</p>
            </div>
         </div>

         <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-[13px] font-semibold text-slate-900 mb-2 flex items-center gap-2">
               <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
               AI Insights
            </h3>
            <p className="text-[14px] text-slate-600 leading-relaxed">
               {analysis?.insights || analysis?.message || 'Read more books to get AI-generated insights about your reading habits.'}
            </p>

            {topGenres.length > 0 && (
               <div className="mt-6 pt-6 border-t border-slate-100">
                 <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Genre Distribution</p>
                 <div className="flex flex-wrap gap-2">
                   {topGenres.map(([genre, count]) => (
                     <span key={genre} className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium px-2.5 py-1 rounded-md">
                       {genre} <span className="opacity-50 ml-1">{count}</span>
                     </span>
                   ))}
                 </div>
               </div>
            )}
         </div>
      </div>

      <div className="border border-rose-200 rounded-2xl bg-rose-50/30 overflow-hidden shadow-sm">
         <div className="px-6 py-5 border-b border-rose-100 bg-rose-50/50">
           <h2 className="text-sm font-semibold text-rose-800">Danger Zone</h2>
         </div>
         <div className="p-6 flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-rose-900 mb-1">Delete Account</p>
               <p className="text-xs text-rose-600/70">Permanently delete your account and all of your content.</p>
            </div>
            <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition shadow-sm">
               Delete Account
            </button>
         </div>
      </div>

    </div>
  );
};

export default ProfilePage;
