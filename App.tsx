
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Plus, Search, Lock, Menu, X, User, LogOut, ShieldCheck, Key, LogIn, Activity
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    window.addEventListener('storage', loadConfig);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', loadConfig);
    };
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

  const navItems = [
    { name: 'Oficina', path: '/oficina', module: 'oficina' },
    { name: 'Orçamentos', path: '/orcamento', module: 'orcamento', locked: true },
    { name: 'Restaurante', path: '/restaurante', module: 'restaurante', locked: true },
    { name: 'Configurações', path: '/config', module: 'config' },
    { name: 'Auditoria', path: '/logs', module: 'config', action: 'view_logs' },
  ];

  const filteredNavItems = navItems.filter(item => 
    isMaster || (
      activeProfile?.modules?.includes(item.module) && 
      (!item.action || activeProfile?.actions?.includes(item.action))
    )
  );

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-700 flex items-center justify-between px-6 lg:px-12 py-5 ${isScrolled ? 'bg-[#0f1115]/90 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent'}`}>
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-4 group">
          {config.companyLogo ? (
            <div className="h-10 w-auto flex items-center justify-center bg-transparent transition-transform group-hover:scale-105">
              <img src={config.companyLogo} className="h-full w-auto object-contain max-w-[120px]" alt="Logo" />
            </div>
          ) : (
            <div className="bg-violet-600 p-2 rounded-xl shadow-xl shadow-violet-600/30">
              <Plus size={16} className="text-white" strokeWidth={4} />
            </div>
          )}
          <span className="text-xl font-black tracking-tighter text-white uppercase group-hover:text-violet-400 transition-colors">
            {config.companyName.split(' ')[0]}
          </span>
        </Link>
        
        {isAccountLoggedIn && !isMaster && (
          <div className="hidden lg:flex items-center gap-8 ml-6">
            <Link to="/" className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all ${location.pathname === '/' ? 'text-violet-500' : 'text-slate-400 hover:text-white'}`}>Dashboard</Link>
            {filteredNavItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.locked ? '#' : item.path}
                className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${location.pathname === item.path ? 'text-violet-500' : 'text-slate-400 hover:text-white'}`}
              >
                {item.name}
                {item.locked && <Lock size={10} className="opacity-40" />}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6 text-white">
        {isAccountLoggedIn ? (
          <>
            {isMaster ? (
              <Link to="/admin-panel" className="px-6 py-2 bg-violet-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-600/20">
                Painel Master
              </Link>
            ) : (
              <button 
                onClick={handleSwitchProfile}
                className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group/profile"
              >
                 <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/20">
                    <img src={activeProfile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'} className="w-full h-full" alt="Perfil" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">{activeProfile?.name || 'Selecionar'}</span>
              </button>
            )}
            
            <button onClick={onLogout} className="p-2.5 bg-red-600/10 text-red-500 rounded-xl border border-red-500/10 hover:bg-red-600 hover:text-white transition-all shadow-lg" title="Sair">
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <div className="flex gap-4">
             <button 
               onClick={() => navigate('/login')}
               className="px-6 py-3 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
             >
               Entrar
             </button>
             <button 
               onClick={() => navigate('/signup')}
               className="px-8 py-3 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-violet-500 transition-all shadow-xl shadow-violet-600/20 flex items-center gap-2"
             >
               Começar
             </button>
          </div>
        )}

        {isAccountLoggedIn && (
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-white">
            <Menu size={24} />
          </button>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0f1115] z-[60] p-8 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8 text-white"><X size={32} /></button>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black uppercase tracking-tighter text-white">Dashboard</Link>
          {filteredNavItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.locked ? '#' : item.path}
              onClick={() => !item.locked && setIsMobileMenuOpen(false)}
              className={`text-2xl font-black uppercase tracking-tighter ${location.pathname === item.path ? 'text-violet-500' : 'text-white'}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
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

  const handleProfileReset = () => {
    setActiveProfile(null);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#0f1115] text-slate-200 selection:bg-violet-600/30 selection:text-violet-400">
        <Navbar 
          activeProfile={activeProfile} 
          onLogout={handleLogout} 
          onProfileReset={handleProfileReset} 
        />
        <main>
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/login" element={<AuthPages.Login />} />
            <Route path="/signup" element={<AuthPages.Signup />} />
            <Route path="/profiles" element={<AuthPages.ProfileSelector onProfileSelect={setActiveProfile} />} />
            <Route path="/pin" element={<AuthPages.PinEntry profile={activeProfile} />} />
            <Route path="/v/:data" element={<PublicView />} />
            <Route path="/admin-panel" element={
              <MasterRoute>
                <AdminMaster />
              </MasterRoute>
            } />
            <Route path="/oficina/*" element={
              <ProtectedModule permission="oficina">
                <Oficina />
              </ProtectedModule>
            } />
            <Route path="/config" element={
              <ProtectedModule permission="config">
                <Settings />
              </ProtectedModule>
            } />
            <Route path="/logs" element={
              <ProtectedModule permission="config">
                <ActivityLog />
              </ProtectedModule>
            } />
            <Route path="/orcamento" element={
              <ProtectedModule permission="orcamento">
                <LockedModule name="Vendas" />
              </ProtectedModule>
            } />
            <Route path="/restaurante" element={
              <ProtectedModule permission="restaurante">
                <LockedModule name="Gastro Hub" />
              </ProtectedModule>
            } />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
