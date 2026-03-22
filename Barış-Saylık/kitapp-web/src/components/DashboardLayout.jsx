import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchBooks } from '../services/api';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Search logic is handled inside HomePage now? 
  // Wait, if search is global, we can pass it via context or outlet context.
  // Actually, Vercel/Notion style often has a global search (Cmd+K) or just page-level search.
  // Let's pass the search query via Outlet context.
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      // Trigger global search or pass down
    }
  };

  const navItems = [
    { label: 'Library', path: '/home', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { label: 'Profile', path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 border-r border-slate-200 bg-[#F7F7F8] flex flex-col pt-6 hidden md:flex">
        <div className="px-6 mb-8 flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">K</span>
          </div>
          <span className="font-semibold tracking-tight text-slate-800">KitApp</span>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-200/60 text-slate-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-200/40 hover:text-slate-900'
                }`
              }
            >
              <svg className="w-[18px] h-[18px] opacity-70" fill="currentColor" viewBox="0 0 24 24"><path d={item.icon} /></svg>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 mt-auto">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-medium uppercase border border-slate-300">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.firstName}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-slate-400 hover:text-slate-700 transition" title="Logout">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Responsive Mobile Header */}
        <header className="h-[60px] flex-shrink-0 md:hidden flex items-center justify-between px-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">K</span>
            </div>
            <span className="font-semibold text-sm">KitApp</span>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-xs font-medium text-slate-500">Logout</button>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
