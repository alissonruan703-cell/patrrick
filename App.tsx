
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Wrench, Utensils, FileText, LayoutGrid, Heart, ClipboardCheck, 
  Settings, CreditCard, History, UserCircle, LogOut, Menu, X, Plus, 
  ChevronRight, AlertCircle, Trash2, Bell, Search, Users, Check, ExternalLink
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

// Auth Guard Components
const PrivateRoute = ({ children, currentUser }: { children: React.ReactNode, currentUser: any }) => {
  if (!currentUser) return <Navigate to="/login" />;
  return <>{children}</>;
};

const ProfileRoute = ({ children, currentUser, activeProfile }: { children: React.ReactNode, currentUser: any, activeProfile: any }) => {
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Sync session and storage
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

  const markAllRead = () => {
    const allNotifs = JSON.parse(localStorage.getItem('crmplus_notifications') || '[]');
    const updated = allNotifs.map((n: any) => 
      (n.profileId === activeProfile?.id || n.profileId === 'admin') ? { ...n, read: true } : n
    );
    localStorage.setItem('crmplus_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    
    const clients: Client[] = JSON.parse(localStorage.getItem('crmplus_clients') || '[]');
    const orders: ServiceOrder[] = JSON.parse(localStorage.getItem('crmplus_oficina_orders') || '[]');
    
    const results = [
      ...clients.filter(c => c.name.toLowerCase().includes(q.toLowerCase())).map(c => ({ ...c, type: 'Cliente', label: c.name, path: `/clients/${c.id}` })),
      ...orders.filter(o => o.plate.toLowerCase().includes(q.toLowerCase()) || o.clientName.toLowerCase().includes(q.toLowerCase())).map(o => ({ ...o, type: 'O.S.', label: `${o.clientName} [${o.plate}]`, path: `/module/oficina?id=${o.id}` }))
    ].slice(0, 8);
    
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const isPublic = ['/', '/login', '/signup', '/terms', '/privacy', '/support'].includes(location.pathname);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      {/* Internal Header */}
      {!isPublic && activeProfile && (
        <div className="fixed top-0 left-64 right-0 h-20 border-b border-zinc-800 bg-black/80 backdrop-blur-md z-40 px-8 flex items-center justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Busca global: Clientes, Placas, O.S..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:border-red-600 outline-none transition-all"
            />
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                {searchResults.map((res, i) => (
                  <button 
                    key={i} 
                    onClick={() => { navigate(res.path); setShowSearchResults(false); setSearchQuery(''); }}
                    className="w-full text-left p-4 hover:bg-zinc-800 border-b border-zinc-800 last:border-0 flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase text-red-600 mb-1">{res.type}</p>
                      <p className="text-sm font-bold text-white">{res.label}</p>
                    </div>
                    <ExternalLink size={14} className="text-zinc-700 group-hover:text-white" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                className="relative p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-red-600 transition-all group"
              >
                <Bell size={20} className="text-zinc-400 group-hover:text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <div className="absolute top-full right-0 mt-4 w-96 bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                    <h3 className="font-black uppercase tracking-widest text-xs">Avisos</h3>
                    <button onClick={markAllRead} className="text-[10px] font-black uppercase text-red-600">Lido Tudo</button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.sort((a,b) => b.timestamp.localeCompare(a.timestamp)).map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => { if(n.link) navigate(n.link); setShowNotifPanel(false); }}
                          className={`p-6 border-b border-zinc-800 last:border-0 hover:bg-zinc-800 transition-colors cursor-pointer ${!n.read ? 'bg-red-600/5' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black uppercase text-zinc-500">{n.moduleId || 'Sistema'}</span>
                            <span className="text-[9px] font-bold text-zinc-600">{new Date(n.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm font-black text-white mb-1 uppercase tracking-tight">{n.title}</p>
                          <p className="text-xs text-zinc-400 font-medium leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-zinc-600">
                        <Bell size={32} className="mx-auto mb-4 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhum aviso</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => { navigate('/notifications'); setShowNotifPanel(false); }} className="w-full p-4 text-[10px] font-black uppercase text-center bg-zinc-950 hover:text-red-600 transition-colors border-t border-zinc-800">Ver Todas</button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black uppercase text-white leading-none">{activeProfile?.name}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">{currentUser?.companyName}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-xl">
                <img src={activeProfile?.avatar} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Internal Sidebar */}
      {activeProfile && !isPublic && (
        <div className="fixed left-0 top-0 bottom-0 w-64 border-r border-zinc-800 bg-black flex flex-col z-50">
          <div className="p-8">
            <span className="text-2xl font-black text-red-600 italic tracking-tighter">CRMPLUS+</span>
          </div>
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
            <Link to="/dashboard" className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname === '/dashboard' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
              <LayoutGrid size={18} /> Painel
            </Link>
            <Link to="/clients" className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname.startsWith('/clients') ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
              <Users size={18} /> Clientes
            </Link>
            <div className="pt-6 pb-2 text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] px-4">Operacional</div>
            {currentUser?.subscriptions?.filter((s:any) => s.status.includes('ativa') || s.status === 'trial_ativo').map((sub:any) => (
              <Link key={sub.id} to={`/module/${sub.id}`} className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname.startsWith(`/module/${sub.id}`) ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
                {sub.id === 'oficina' && <Wrench size={18} />}
                {sub.id === 'restaurante' && <Utensils size={18} />}
                {sub.id === 'orcamento' && <FileText size={18} />}
                {sub.id === 'funil' && <LayoutGrid size={18} />}
                {sub.id === 'nps' && <Heart size={18} />}
                {sub.id === 'inspeção' && <ClipboardCheck size={18} />}
                <span className="truncate">{sub.id}</span>
              </Link>
            ))}
            <div className="pt-6 pb-2 text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] px-4">Administrativo</div>
            <Link to="/billing" className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname === '/billing' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
              <CreditCard size={18} /> Assinaturas
            </Link>
            <Link to="/account/settings" className={`flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${location.pathname === '/account/settings' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
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

      {/* Main Content Area */}
      <div className={!isPublic && activeProfile ? 'pl-64 pt-20' : ''}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth type="login" onAuth={(user) => setCurrentUser(user)} />} />
          <Route path="/signup" element={<Auth type="signup" />} />
          <Route path="/profiles" element={<PrivateRoute currentUser={currentUser}><Profiles onSelect={(p) => setActiveProfile(p)} /></PrivateRoute>} />
          <Route path="/dashboard" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><Dashboard user={currentUser} /></ProfileRoute>} />
          <Route path="/clients/*" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><Clients /></ProfileRoute>} />
          <Route path="/notifications" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><NotificationsPage profile={activeProfile!} /></ProfileRoute>} />
          <Route path="/billing" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><Billing user={currentUser} /></ProfileRoute>} />
          <Route path="/account/settings" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><AccountSettings user={currentUser} /></ProfileRoute>} />
          <Route path="/account/my-history" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><MyHistory profile={activeProfile} /></ProfileRoute>} />
          
          <Route path="/module/oficina" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><Oficina /></ProfileRoute>} />
          <Route path="/module/orcamento" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><LockedModule name="Orçamento" /></ProfileRoute>} />
          <Route path="/module/restaurante" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><LockedModule name="Restaurante" /></ProfileRoute>} />
          <Route path="/module/funil" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><LockedModule name="Funil de Vendas" /></ProfileRoute>} />
          <Route path="/module/nps" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><LockedModule name="NPS" /></ProfileRoute>} />
          <Route path="/module/inspeção" element={<ProfileRoute currentUser={currentUser} activeProfile={activeProfile}><LockedModule name="Inspeção" /></ProfileRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
