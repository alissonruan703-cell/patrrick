
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Plus, Search, Lock, Menu, X, User, LogOut, ShieldCheck, Key, LogIn, Activity, LayoutGrid, Rocket, FileText, Utensils, Settings as SettingsIcon, AlertTriangle
} from 'lucide-react';
import Catalog from './pages/Catalog';
import Oficina from './pages/Oficina';
import LockedModule from './pages/LockedModule';
import PublicView from './pages/PublicView';
import Settings from './pages/Settings';
import AuthPages from './pages/AuthPages';
import AdminMaster from './pages/AdminMaster';
import ActivityLog from './pages/ActivityLog';
import { SystemConfig, UserProfile } from './types';

const ProtectedModule: React.FC<{ children: React.ReactNode, permission: string }> = ({ children, permission }) => {
  const isAccountLoggedIn = sessionStorage.getItem('crmplus_account_auth') === 'true';
  const profileRaw = sessionStorage.getItem('crmplus_active_profile');
  const isPinVerified = sessionStorage.getItem('crmplus_pin_verified') === 'true';

  if (!isAccountLoggedIn) return <Navigate to="/login" replace />;
  if (!profileRaw) return <Navigate to="/profiles" replace />;
  if (!isPinVerified) return <Navigate to="/pin" replace />;

  const profile: UserProfile = JSON.parse(profileRaw);
  
  if (!profile.modules?.includes(permission) && permission !== 'any') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <Lock size={64} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-black text-white uppercase mb-4">Acesso Negado</h1>
        <p className="text-slate-400 max-w-md mb-8">Seu perfil não possui permissão para acessar o módulo de <span className="text-white font-bold uppercase">{permission}</span>.</p>
        <Link to="/" className="px-8 py-3 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">Voltar ao Início</Link>
      </div>
    );
  }

  return <>{children}</>;
};

const MasterRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMaster = sessionStorage.getItem('crmplus_is_master') === 'true';
  if (!isMaster) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Navbar = ({ activeProfile, onLogout, onProfileReset }: { 
  activeProfile: UserProfile | null, 
  onLogout: () => void,
  onProfileReset: () => void 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [config, setConfig] = useState<SystemConfig>({ companyName: 'CRMPLUS', companyLogo: '' });

  const isAccountLoggedIn = sessionStorage.getItem('crmplus_account_auth') === 'true';
  const isMaster = sessionStorage.getItem('crmplus_is_master') === 'true';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const loadConfig = () => {
      const saved = localStorage.getItem('crmplus_system_config');
      if (saved) setConfig(JSON.parse(saved));
    };
    loadConfig();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (location.pathname.startsWith('/v/') || 
      location.pathname === '/login' || 
      location.pathname === '/signup' || 
      location.pathname === '/profiles' || 
      location.pathname === '/pin') return null;

  const handleSwitchProfile = () => {
    sessionStorage.removeItem('crmplus_active_profile');
    sessionStorage.removeItem('crmplus_pin_verified');
    onProfileReset();
    navigate('/profiles');
  };

  const systems = [
    { id: 'oficina', name: 'Oficina Pro+', icon: <Rocket size={16}/>, path: '/oficina', active: true },
    { id: 'orcamento', name: 'Vendas Plus', icon: <FileText size={16}/>, path: '/orcamento', active: false },
    { id: 'restaurante', name: 'Gastro Hub', icon: <Utensils size={16}/>, path: '/restaurante', active: false },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-700 flex items-center justify-between px-6 lg:px-12 py-5 ${isScrolled ? 'bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent'}`}>
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-4 group">
            {config.companyLogo ? (
              <img src={config.companyLogo} className="h-8 w-auto object-contain" alt="Logo" />
            ) : (
              <div className="bg-cyan-500 p-2 rounded-xl shadow-xl shadow-cyan-500/30">
                <Rocket size={16} className="text-black" />
              </div>
            )}
            <span className="text-xl font-black tracking-tighter text-white uppercase group-hover:text-cyan-400 transition-colors">
              {config.companyName.split(' ')[0]}
            </span>
          </Link>

          {isAccountLoggedIn && !isMaster && (
            <div className="relative">
               <button 
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all group"
               >
                 <LayoutGrid size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Módulos</span>
               </button>

               {isSwitcherOpen && (
                 <div className="absolute top-full left-0 mt-3 w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Trocar de Sistema</p>
                    <div className="space-y-1">
                      {systems.map(s => (
                        <button 
                          key={s.id}
                          onClick={() => {
                            setIsSwitcherOpen(false);
                            if (s.active) navigate(s.path);
                            else setShowDevModal(true);
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${location.pathname.startsWith(s.path) ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                          <div className="flex items-center gap-3">
                            {s.icon}
                            <span className="text-[10px] font-black uppercase tracking-tight">{s.name}</span>
                          </div>
                          {!s.active && <Lock size={12} className="opacity-40" />}
                        </button>
                      ))}
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {isAccountLoggedIn ? (
            <>
              {!isMaster && (
                <button 
                  onClick={handleSwitchProfile}
                  className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
                >
                  <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/20">
                    <img src={activeProfile?.avatar || ''} className="w-full h-full" alt="Perfil" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{activeProfile?.name}</span>
                </button>
              )}
              <button onClick={onLogout} className="p-2.5 bg-red-600/10 text-red-500 rounded-xl border border-red-500/10 hover:bg-red-600 hover:text-white transition-all shadow-lg" title="Sair">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <div className="flex gap-4">
               <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Entrar</button>
               <button onClick={() => navigate('/signup')} className="px-6 py-2.5 bg-cyan-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/30">Criar Conta</button>
            </div>
          )}
        </div>
      </nav>

      {/* Modal Em Desenvolvimento */}
      {showDevModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-10 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-[60px] rounded-full"></div>
              <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg">
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Em Desenvolvimento</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Estamos trabalhando duro para liberar este módulo. Fique ligado, novidades em breve!</p>
              </div>
              <button onClick={() => setShowDevModal(false)} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl">Entendido</button>
           </div>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('crmplus_active_profile');
    if (saved) setActiveProfile(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setActiveProfile(null);
    window.location.hash = '#/';
    window.location.reload();
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#050505] text-slate-200">
        <Navbar 
          activeProfile={activeProfile} 
          onLogout={handleLogout} 
          onProfileReset={() => setActiveProfile(null)} 
        />
        <main>
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/login" element={<AuthPages.Login />} />
            <Route path="/signup" element={<AuthPages.Signup />} />
            <Route path="/profiles" element={<AuthPages.ProfileSelector onProfileSelect={setActiveProfile} />} />
            <Route path="/pin" element={<AuthPages.PinEntry profile={activeProfile} />} />
            <Route path="/v/:data" element={<PublicView />} />
            <Route path="/admin-panel" element={<MasterRoute><AdminMaster /></MasterRoute>} />
            <Route path="/oficina/*" element={<ProtectedModule permission="oficina"><Oficina /></ProtectedModule>} />
            <Route path="/config" element={<ProtectedModule permission="config"><Settings /></ProtectedModule>} />
            <Route path="/logs" element={<ProtectedModule permission="config"><ActivityLog /></ProtectedModule>} />
            <Route path="/orcamento" element={<ProtectedModule permission="orcamento"><LockedModule name="Vendas" /></ProtectedModule>} />
            <Route path="/restaurante" element={<ProtectedModule permission="restaurante"><LockedModule name="Gastro Hub" /></ProtectedModule>} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
