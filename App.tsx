
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Wrench, Utensils, FileText, LayoutGrid, Heart, ClipboardCheck, 
  Settings, CreditCard, History, UserCircle, LogOut, Menu, X, Plus, 
  ChevronRight, AlertCircle, Trash2, Bell, Search, Users, Check, ExternalLink, UsersRound
} from 'lucide-react';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Profiles from './pages/Profiles';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import AccountSettings from './pages/AccountSettings';
import MyHistory from './pages/MyHistory';
import Oficina from './pages/Oficina';
import Clients from './pages/Clients';
import NotificationsPage from './pages/Notifications';
import LockedModule from './pages/LockedModule';
import { Notification, UserProfile, ServiceOrder, Client } from './types';

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
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        <div className="fixed top-0 left-64 right-0 h-20 border-b border-zinc-800 bg-black/80 backdrop-blur-md z-40 px-8 flex items-center justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Busca global..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:border-red-600 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="relative p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-red-600 transition-all"
            >
              <Bell size={20} className="text-zinc-400" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black animate-pulse">{unreadCount}</span>}
            </button>
            
            <button 
              onClick={handleSwitchProfile}
              className="flex items-center gap-3 hover:opacity-80 transition-all p-2 rounded-2xl bg-zinc-900/50 border border-zinc-800/50"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black uppercase text-white leading-none">{activeProfile?.name}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">Trocar Perfil</p>
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-red-600/30 shadow-xl bg-black flex items-center justify-center text-red-600">
                <UsersRound size={20} />
              </div>
            </button>
          </div>
        </div>
      )}

      {activeProfile && !isPublic && (
        <div className="fixed left-0 top-0 bottom-0 w-64 border-r border-zinc-800 bg-black flex flex-col z-50">
          <div className="p-8">
            <span className="text-2xl font-black text-red-600 italic tracking-tighter">CRMPLUS+</span>
          </div>
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
            <Link to="/dashboard" className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname === '/dashboard' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <LayoutGrid size={18} /> Painel
            </Link>
            <Link to="/clients" className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname.startsWith('/clients') ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <Users size={18} /> Clientes
            </Link>
            <div className="pt-6 pb-2 text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] px-4">Operacional</div>
            {currentUser?.subscriptions?.filter((s:any) => s.status.includes('ativa') || s.status === 'teste_ativo').map((sub:any) => (
              <Link key={sub.id} to={`/module/${sub.id}`} className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname.startsWith(`/module/${sub.id}`) ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                {sub.id === 'oficina' && <Wrench size={18} />}
                {sub.id === 'restaurante' && <Utensils size={18} />}
                {sub.id === 'orcamento' && <FileText size={18} />}
                <span>{sub.id.toUpperCase()}</span>
              </Link>
            ))}
            <div className="pt-6 pb-2 text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] px-4">Administrativo</div>
            <Link to="/billing" className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname === '/billing' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <CreditCard size={18} /> Assinaturas
            </Link>
            <Link to="/account/settings" className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname === '/account/settings' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
              <Settings size={18} /> Configurações
            </Link>
          </nav>
          <div className="p-4 border-t border-zinc-900">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-black uppercase text-[10px] tracking-widest">
              <LogOut size={18} /> Sair
            </button>
          </div>
        </div>
      )}

      <div className={!isPublic && activeProfile ? 'pl-64 pt-20' : ''}>
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
      </div>
    </div>
  );
};

export default App;
