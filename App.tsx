
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Wrench, Utensils, FileText, LayoutGrid, Settings, CreditCard, LogOut, Menu, X, Bell, UsersRound, AlertTriangle
} from 'lucide-react';

import Landing from './pages/Landing';
import { Login, Signup } from './pages/AuthPages';
import Profiles from './pages/Profiles';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Oficina from './pages/Oficina';
import PublicView from './pages/PublicView';
import LockedModule from './pages/LockedModule';
import { AccountLicense } from './types';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [account, setAccount] = useState<AccountLicense | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const accountId = sessionStorage.getItem('crmplus_account_id') || localStorage.getItem('crmplus_last_account_id');
      const publicPaths = ['/', '/login', '/signup'];
      const isPublic = publicPaths.includes(location.pathname) || location.pathname.startsWith('/v/');

      if (accountId) {
        const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
        const acc = accounts.find((a: any) => a.id === accountId);
        if (acc) {
          setAccount(acc);
          localStorage.setItem('crmplus_last_account_id', accountId);
          const expired = new Date() > new Date(acc.expirationDate);
          setIsExpired(expired);
          
          if (expired && !isPublic && location.pathname !== '/billing') {
            navigate('/billing');
          }
        } else if (!isPublic) {
          navigate('/login');
        }
      } else if (!isPublic) {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('crmplus_last_account_id');
    setAccount(null);
    navigate('/login');
  };

  const isPublic = ['/', '/login', '/signup'].includes(location.pathname) || location.pathname.startsWith('/v/');

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      {!isPublic && account && (
        <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-zinc-800 bg-black flex flex-col z-50">
          <div className="p-8 border-b border-zinc-900">
            <span className="text-2xl font-black text-red-600 italic tracking-tighter">CRMPLUS+</span>
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-1">{account.companyName}</p>
          </div>
          <nav className="flex-1 px-4 py-8 space-y-2">
            <Link to="/dashboard" className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname === '/dashboard' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <LayoutGrid size={18} /> Painel Geral
            </Link>
            <div className="pt-8 pb-2 text-[8px] font-black text-zinc-700 uppercase tracking-widest px-4">Sistemas</div>
            <Link to="/module/oficina" className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname.startsWith('/module/oficina') ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <Wrench size={18} /> Oficina
            </Link>
            <Link to="/module/restaurante" className="flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-zinc-500 opacity-40 cursor-not-allowed">
              <Utensils size={18} /> Restaurante
            </Link>
            <Link to="/billing" className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname === '/billing' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <CreditCard size={18} /> Assinatura
            </Link>
          </nav>
          <div className="p-4 border-t border-zinc-900">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-600/10 transition-all font-black uppercase text-[10px] tracking-widest">
              <LogOut size={18} /> Sair
            </button>
          </div>
        </aside>
      )}

      <main className={!isPublic && account ? 'pl-64' : ''}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/v/:data" element={<PublicView />} />
          <Route path="/dashboard" element={<Dashboard user={account!} />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/module/oficina" element={<Oficina />} />
          <Route path="/module/restaurante" element={<LockedModule name="Restaurante" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
