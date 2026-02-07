
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Wrench, Utensils, FileText, LayoutGrid, Settings, CreditCard, LogOut, Menu, X, Bell, Search, UsersRound
} from 'lucide-react';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Profiles from './pages/Profiles';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import AccountSettings from './pages/AccountSettings';
import Oficina from './pages/Oficina';
import NotificationsPage from './pages/Notifications';
import PublicView from './pages/PublicView';
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
      const savedUserStr = sessionStorage.getItem('crmplus_user');
      const savedProfileStr = sessionStorage.getItem('crmplus_profile');
      
      if (savedUserStr) {
        const user = JSON.parse(savedUserStr);
        setCurrentUser(user);
        // Chave de notificação isolada por usuário
        const notifKey = `crmplus_notifications_${user.id}`;
        const allNotifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
        setNotifications(allNotifs);
      }
      
      if (savedProfileStr) {
        setActiveProfile(JSON.parse(savedProfileStr));
      }
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [location.pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.clear();
    setCurrentUser(null);
    setActiveProfile(null);
    navigate('/login');
  };

  const isPublic = ['/', '/login', '/signup'].includes(location.pathname) || location.pathname.startsWith('/v/');
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      {!isPublic && activeProfile && (
        <header className="fixed top-0 left-0 lg:left-56 right-0 h-16 border-b border-zinc-800 bg-black/80 backdrop-blur-md z-40 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-zinc-400 hover:text-white">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="text-sm font-black uppercase tracking-tighter text-zinc-500 lg:hidden">CRMPLUS+</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/notifications')} className="relative p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            
            <button onClick={() => navigate('/profiles')} className="flex items-center gap-3 hover:opacity-80 transition-all p-1 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="w-8 h-8 rounded-lg border border-red-600/30 bg-black flex items-center justify-center text-red-600">
                <UsersRound size={16} />
              </div>
            </button>
          </div>
        </header>
      )}

      {activeProfile && !isPublic && (
        <>
          {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
          <aside className={`fixed left-0 top-0 bottom-0 w-56 border-r border-zinc-800 bg-black flex flex-col z-50 transition-transform lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6">
              <span className="text-xl font-black text-red-600 italic tracking-tighter">CRMPLUS+</span>
            </div>
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
              <Link to="/dashboard" className={`flex items-center gap-3 p-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${location.pathname === '/dashboard' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                <LayoutGrid size={16} /> Painel
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
          <Route path="/v/:data" element={<PublicView />} />
          <Route path="/login" element={<Auth type="login" onAuth={(user) => setCurrentUser(user)} />} />
          <Route path="/signup" element={<Auth type="signup" />} />
          <Route path="/profiles" element={<PrivateRoute currentUser={currentUser}><Profiles mode="select" onSelect={(p) => setActiveProfile(p)} /></PrivateRoute>} />
          <Route path="/account/profiles" element={<PrivateRoute currentUser={currentUser}><Profiles mode="manage" /></PrivateRoute>} />
          <Route path="/dashboard" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><Dashboard user={currentUser} /></ProfileRoute>} />
          <Route path="/notifications" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><NotificationsPage profile={activeProfile!} /></ProfileRoute>} />
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
