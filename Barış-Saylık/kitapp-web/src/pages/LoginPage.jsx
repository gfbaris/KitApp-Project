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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please fill all fields.');

    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      login(token, user);
      
      showToast('Welcome back', 'success');
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
      <div className="w-full max-w-[400px]">
        
        <div className="flex flex-col items-center justify-center mb-8">
           <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4 shadow-sm">
             K
           </div>
           <h1 className="text-2xl font-semibold tracking-tight text-center">Log in to KitApp</h1>
           <p className="text-[14px] text-slate-500 mt-2 text-center">Welcome back! Please enter your details.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-100/50 rounded-lg p-3 text-[13px] font-medium text-rose-600 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center text-[10px]">!</span>
                {error}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 font-medium text-slate-900 placeholder:text-slate-400 transition-all text-sm shadow-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5 flex justify-between">
                <span>Password</span>
              </label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 font-medium text-slate-900 placeholder:text-slate-400 transition-all text-sm shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium text-[14px] shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-70 flex justify-center items-center mt-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-slate-500">
             Don't have an account?{' '}
             <Link to="/register" className="font-semibold text-slate-900 hover:underline">
               Sign up
             </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default LoginPage;
