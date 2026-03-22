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
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    navigate('/home');
    return null;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

    setLoading(true);

    try {
      const payload = { ...form };
      if (!payload.phone) delete payload.phone;

      await registerUser(payload);
      showToast('Account created successfully', 'success');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-slate-900 font-sans py-12">
      <div className="w-full max-w-[440px]">
        
        <div className="flex flex-col items-center justify-center mb-8">
           <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4 shadow-sm">
             K
           </div>
           <h1 className="text-2xl font-semibold tracking-tight text-center">Create an account</h1>
           <p className="text-[14px] text-slate-500 mt-2 text-center">Start your library journey with KitApp.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-100/50 rounded-lg p-3 text-[13px] font-medium text-rose-600 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center text-[10px]">!</span>
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1.5">First Name</label>
                  <input name="firstName" required value={form.firstName} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 font-medium text-slate-900 placeholder:text-slate-400 transition-all text-sm shadow-sm" placeholder="John" />
               </div>
               <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Last Name</label>
                  <input name="lastName" required value={form.lastName} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 font-medium text-slate-900 placeholder:text-slate-400 transition-all text-sm shadow-sm" placeholder="Doe" />
               </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 font-medium text-slate-900 placeholder:text-slate-400 transition-all text-sm shadow-sm" placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Phone <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 font-medium text-slate-900 placeholder:text-slate-400 transition-all text-sm shadow-sm" placeholder="+1 234 567 890" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Password</label>
                 <input type="password" name="password" required value={form.password} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 font-medium text-slate-900 transition-all text-sm shadow-sm" placeholder="••••••••" />
               </div>
               <div>
                 <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Confirm</label>
                 <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 font-medium text-slate-900 transition-all text-sm shadow-sm" placeholder="••••••••" />
               </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium text-[14px] shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-70 flex justify-center items-center mt-4">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-slate-500">
             Already have an account?{' '}
             <Link to="/login" className="font-semibold text-slate-900 hover:underline">
               Log in
             </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default RegisterPage;
