
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Plus, Search, Lock, Menu, X, User, LogOut, ShieldCheck, Key
} from 'lucide-react';
import Catalog from './pages/Catalog';
import Oficina from './pages/Oficina';
import LockedModule from './pages/LockedModule';
import PublicView from './pages/PublicView';
import Settings from './pages/Settings';
import AuthPages from './pages/AuthPages';
import { SystemConfig, UserProfile } from './types';

// Componente para proteger rotas baseadas no login e perfil selecionado
// Fix: Use React.FC to explicitly define children prop and avoid inference issues
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAccountLoggedIn = sessionStorage.getItem('crmplus_account_auth') === 'true';
  const isProfileSelected = sessionStorage.getItem('crmplus_active_profile') !== null;
  const isPinVerified = sessionStorage.getItem('crmplus_pin_verified') === 'true';

  if (!isAccountLoggedIn) return <Navigate to="/login" replace />;
  if (!isProfileSelected) return <Navigate to="/profiles" replace />;
  if (!isPinVerified) return <Navigate to="/pin" replace />;

  return <>{children}</>;
};

const Navbar = ({ activeProfile, onLogout }: { activeProfile: UserProfile | null, onLogout: () => void }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState<SystemConfig>({ companyName: 'CRMPLUS', companyLogo: '' });

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
      location.pathname === '/profiles' || 
      location.pathname === '/pin') return null;

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Oficina', path: '/oficina' },
    { name: 'Orçamentos', path: '/orcamento', locked: true },
    { name: 'Restaurante', path: '/restaurante', locked: true },
    { name: 'Configurações', path: '/config' },
  ];

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
        
        <div className="hidden lg:flex items-center gap-8 ml-6">
          {navItems.map((item) => (
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
      </div>

      <div className="flex items-center gap-4 sm:gap-6 text-white">
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
           <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/20">
              <img src={activeProfile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'} className="w-full h-full" alt="Perfil" />
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest">{activeProfile?.name}</span>
        </div>
        
        <button onClick={onLogout} className="p-2.5 bg-red-600/10 text-red-500 rounded-xl border border-red-500/10 hover:bg-red-600 hover:text-white transition-all">
          <LogOut size={16} />
        </button>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-white">
          <Menu size={24} />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0f1115] z-[60] p-8 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8 text-white"><X size={32} /></button>
          {navItems.map((item) => (
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
    window.location.href = '/';
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#0f1115] text-slate-200 selection:bg-violet-600/30 selection:text-violet-400">
        <Navbar activeProfile={activeProfile} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/login" element={<AuthPages.Login />} />
            <Route path="/profiles" element={<AuthPages.ProfileSelector onProfileSelect={setActiveProfile} />} />
            <Route path="/pin" element={<AuthPages.PinEntry profile={activeProfile} />} />
            <Route path="/v/:data" element={<PublicView />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/" element={<Catalog />} />
                  <Route path="/oficina/*" element={<Oficina />} />
                  <Route path="/orcamento" element={<LockedModule name="Vendas" />} />
                  <Route path="/restaurante" element={<LockedModule name="Gastro Hub" />} />
                  <Route path="/config" element={<Settings />} />
                </Routes>
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
