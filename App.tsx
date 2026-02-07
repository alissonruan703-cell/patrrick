
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Wrench, Utensils, FileText, LayoutGrid, Heart, ClipboardCheck, 
  Settings, CreditCard, History, LogOut, Menu, X, Bell, Search, Users, UsersRound
} from 'lucide-react';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Profiles from './pages/Profiles';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import AccountSettings from './pages/AccountSettings';
import Oficina from './pages/Oficina';
import Clients from './pages/Clients';
import LockedModule from './pages/LockedModule';
import { Notification, UserProfile } from './types';

const PrivateRoute = ({ children, currentUser }: { children?: React.ReactNode, currentUser: any }) => {
  if (!currentUser) return <Navigate to="/login" />;
  return <>{children}</>;
};

const ProfileRoute = ({ children, currentUser, activeProfile }: { children?: React.ReactNode, currentUser: any, activeProfile: any }) => {
  if (!currentUser) return <Navigate to="/login" />;
  if (!activeProfile) return <Navigate to="/profiles" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const savedUser = sessionStorage.getItem('crmplus_user');
      const savedProfile = sessionStorage.getItem('crmplus_profile');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      if (savedProfile) setActiveProfile(JSON.parse(savedProfile));
      
      const allNotifs = JSON.parse(localStorage.getItem('crmplus_notifications') || '[]');
      if (activeProfile) {
        setNotifications(allNotifs.filter((n: any) => n.profileId === activeProfile.id || n.profileId === 'admin'));
      }
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [activeProfile?.id]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.clear();
    setCurrentUser(null);
    setActiveProfile(null);
    navigate('/login');
  };

  const handleSwitchProfile = () => {
    sessionStorage.removeItem('crmplus_profile');
    setActiveProfile(null);
    navigate('/profiles');
  };

  const isPublic = ['/', '/login', '/signup'].includes(location.pathname);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      {!isPublic && activeProfile && (
        <header className="fixed top-0 left-0 lg:left-56 right-0 h-16 border-b border-zinc-800 bg-black/80 backdrop-blur-md z-40 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="relative hidden md:block w-64 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input 
                type="text" 
                placeholder="Busca rápida..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-[11px] focus:border-red-600 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative p-2 text-zinc-400 hover:text-white">
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border border-black"></span>}
            </button>
            
            <button 
              onClick={handleSwitchProfile}
              className="flex items-center gap-3 hover:opacity-80 transition-all p-1 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black uppercase text-white leading-none">{activeProfile?.name}</p>
                <p className="text-[7px] font-bold text-zinc-500 uppercase mt-1">Alternar</p>
              </div>
              <div className="w-8 h-8 rounded-lg border border-red-600/30 bg-black flex items-center justify-center text-red-600">
                <UsersRound size={16} />
              </div>
            </button>
          </div>
        </header>
      )}

      {activeProfile && !isPublic && (
        <>
          {/* Overlay for mobile menu */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          <aside className={`fixed left-0 top-0 bottom-0 w-56 border-r border-zinc-800 bg-black flex flex-col z-50 transition-transform lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 flex items-center justify-between">
              <span className="text-xl font-black text-red-600 italic tracking-tighter">CRMPLUS+</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-zinc-500">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
              <Link to="/dashboard" className={`flex items-center gap-3 p-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${location.pathname === '/dashboard' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                <LayoutGrid size={16} /> Painel
              </Link>
              <Link to="/clients" className={`flex items-center gap-3 p-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${location.pathname.startsWith('/clients') ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                <Users size={16} /> Clientes
              </Link>
              
              <div className="pt-6 pb-2 text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] px-3">Operacional</div>
              {currentUser?.subscriptions?.filter((s:any) => s.status.includes('ativa') || s.status === 'teste_ativo').map((sub:any) => (
                <Link key={sub.id} to={`/module/${sub.id}`} className={`flex items-center gap-3 p-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${location.pathname.startsWith(`/module/${sub.id}`) ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                  {sub.id === 'oficina' && <Wrench size={16} />}
                  {sub.id === 'restaurante' && <Utensils size={16} />}
                  {sub.id === 'orcamento' && <FileText size={16} />}
                  <span>{sub.id.toUpperCase()}</span>
                </Link>
              ))}

              <div className="pt-6 pb-2 text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] px-3">Administrativo</div>
              <Link to="/billing" className={`flex items-center gap-3 p-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${location.pathname === '/billing' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                <CreditCard size={16} /> Assinaturas
              </Link>
              <Link to="/account/settings" className={`flex items-center gap-3 p-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${location.pathname === '/account/settings' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                <Settings size={16} /> Ajustes
              </Link>
            </nav>
            <div className="p-3 border-t border-zinc-900">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-black uppercase text-[9px] tracking-widest">
                <LogOut size={16} /> Sair
              </button>
            </div>
          </aside>
        </>
      )}

      <main className={!isPublic && activeProfile ? 'lg:pl-56 pt-16' : ''}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth type="login" onAuth={(user) => setCurrentUser(user)} />} />
          <Route path="/signup" element={<Auth type="signup" />} />
          <Route path="/profiles" element={<PrivateRoute currentUser={currentUser}><Profiles mode="select" onSelect={(p) => setActiveProfile(p)} /></PrivateRoute>} />
          <Route path="/account/profiles" element={<PrivateRoute currentUser={currentUser}><Profiles mode="manage" /></PrivateRoute>} />
          <Route path="/dashboard" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><Dashboard user={currentUser} /></ProfileRoute>} />
          <Route path="/clients/*" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><Clients /></ProfileRoute>} />
          <Route path="/module/oficina" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><Oficina /></ProfileRoute>} />
          <Route path="/module/orcamento" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><LockedModule name="Orçamento" /></ProfileRoute>} />
          <Route path="/module/restaurante" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><LockedModule name="Restaurante" /></ProfileRoute>} />
          <Route path="/billing" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><Billing user={currentUser} /></ProfileRoute>} />
          <Route path="/account/settings" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><AccountSettings user={currentUser} /></ProfileRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
