
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
import AccountSettings from './pages/AccountSettings';
import Oficina from './pages/Oficina';
import NotificationsPage from './pages/Notifications';
import PublicView from './pages/PublicView';
import LockedModule from './pages/LockedModule';
import { Notification, UserProfile, AccountLicense } from './types';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [account, setAccount] = useState<AccountLicense | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const sync = () => {
      const accountId = sessionStorage.getItem('crmplus_account_id');
      const savedProfileStr = sessionStorage.getItem('crmplus_profile');
      
      if (accountId) {
        const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
        const acc = accounts.find((a: any) => a.id === accountId);
        if (acc) {
          setAccount(acc);
          const today = new Date();
          const expDate = new Date(acc.expirationDate);
          const expired = today > expDate;
          setIsExpired(expired);
          
          // ANTI-BURLAGEM: Bloqueio forçado se expirado
          const publicPaths = ['/', '/login', '/signup', '/billing'];
          const isPublic = publicPaths.includes(location.pathname) || location.pathname.startsWith('/v/');
          
          if (expired && !isPublic) {
            navigate('/billing');
          }
        }
      }
      
      if (savedProfileStr) setActiveProfile(JSON.parse(savedProfileStr));
      
      if (accountId) {
        const notifKey = `crmplus_notifications_${accountId}`;
        setNotifications(JSON.parse(localStorage.getItem(notifKey) || '[]'));
      }
    };
    
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    setAccount(null);
    setActiveProfile(null);
    navigate('/login');
  };

  const isPublic = ['/', '/login', '/signup', '/billing'].includes(location.pathname) || location.pathname.startsWith('/v/');
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      {/* Banner Superior de Alerta */}
      {isExpired && account && !isPublic && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white p-3 text-center font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl">
          <AlertTriangle size={16} /> ACESSO BLOQUEADO: SUA LICENÇA EXPIROU. <Link to="/billing" className="underline ml-2">PAGAR AGORA</Link>
        </div>
      )}

      {!isPublic && activeProfile && (
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 border-b border-zinc-800 bg-black/80 backdrop-blur-md z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-zinc-400 hover:text-white">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="text-sm font-black uppercase tracking-tighter text-zinc-500 lg:hidden italic">CRMPLUS+</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/notifications')} className="relative p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black">{unreadCount}</span>}
            </button>
            <div className="h-8 w-px bg-zinc-800 mx-2"></div>
            <button onClick={() => navigate('/profiles')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-white uppercase leading-none">{activeProfile.name}</p>
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Trocar Perfil</p>
              </div>
              <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-red-600 shadow-inner">
                <UsersRound size={20} />
              </div>
            </button>
          </div>
        </header>
      )}

      {!isPublic && activeProfile && (
        <aside className={`fixed left-0 top-0 bottom-0 w-64 border-r border-zinc-800 bg-black flex flex-col z-50 transition-transform lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 border-b border-zinc-900 flex items-center justify-between">
            <span className="text-2xl font-black text-red-600 italic tracking-tighter">CRMPLUS+</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-zinc-600"><X size={20}/></button>
          </div>
          
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname === '/dashboard' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <LayoutGrid size={18} /> Painel Geral
            </Link>
            
            <div className="pt-8 pb-3 text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em] px-4">Operacional</div>
            
            <Link to={isExpired ? "/billing" : "/module/oficina"} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center justify-between p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname.startsWith('/module/oficina') ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <div className="flex items-center gap-3"><Wrench size={18} /> Oficina</div>
              {isExpired && <AlertTriangle size={14} className="text-red-600" />}
            </Link>

            <Link to={isExpired ? "/billing" : "/module/restaurante"} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center justify-between p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname.startsWith('/module/restaurante') ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <div className="flex items-center gap-3"><Utensils size={18} /> Restaurante</div>
              {isExpired && <AlertTriangle size={14} className="text-red-600" />}
            </Link>

            <div className="pt-8 pb-3 text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em] px-4">Administrativo</div>
            
            <Link to="/billing" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname === '/billing' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <CreditCard size={18} /> Assinaturas
            </Link>

            <Link to="/account/settings" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname === '/account/settings' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <Settings size={18} /> Ajustes
            </Link>
          </nav>

          <div className="p-4 border-t border-zinc-900">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-600/10 transition-all font-black uppercase text-[10px] tracking-widest">
              <LogOut size={18} /> Sair da Conta
            </button>
          </div>
        </aside>
      )}

      <main className={!isPublic && activeProfile ? 'lg:pl-64 pt-16' : ''}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/v/:data" element={<PublicView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profiles" element={<Profiles mode="select" onSelect={(p) => setActiveProfile(p)} />} />
          <Route path="/dashboard" element={account ? <Dashboard user={account} /> : <Navigate to="/login" />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/module/oficina" element={<Oficina />} />
          <Route path="/module/restaurante" element={<LockedModule name="Restaurante" />} />
          <Route path="/notifications" element={<NotificationsPage profile={activeProfile!} />} />
          <Route path="/account/settings" element={<AccountSettings user={account} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
