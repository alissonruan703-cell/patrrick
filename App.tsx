
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Plus, Search, Lock, Menu, X, User, LogOut, ShieldCheck, Key, LogIn, Activity, LayoutGrid, Rocket, FileText, Utensils, Settings as SettingsIcon, AlertTriangle, Shield, Info, MessageSquare, Send, CheckCircle2
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

const Footer = () => {
  const [modalType, setModalType] = useState<'none' | 'privacy' | 'terms' | 'support'>('none');
  const [supportMsg, setSupportMsg] = useState('');
  const [sent, setSent] = useState(false);

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMsg) return;
    setSent(true);
    setTimeout(() => { setSent(false); setSupportMsg(''); setModalType('none'); }, 3000);
  };

  return (
    <>
      <footer className="px-6 lg:px-20 py-20 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <div className="space-y-6">
            <h4 className="text-xl font-black text-white uppercase tracking-tighter">CRM<span className="text-cyan-500">Plus+</span></h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] font-black leading-relaxed italic">Ecossistema de gestão inteligente para empresas escaláveis.</p>
          </div>
          
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => setModalType('privacy')} className="text-xs text-slate-600 hover:text-cyan-400 transition-colors text-left font-bold uppercase tracking-tight">Política de Privacidade</button>
              <button onClick={() => setModalType('terms')} className="text-xs text-slate-600 hover:text-cyan-400 transition-colors text-left font-bold uppercase tracking-tight">Termos de Uso</button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atendimento</p>
            <button 
              onClick={() => setModalType('support')}
              className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/5 transition-all group"
            >
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Mensagem ao Suporte</span>
              <MessageSquare size={16} className="text-cyan-400" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.5em]">© 2025 CRMPlus+ Management Solutions. All Rights Reserved.</p>
        </div>
      </footer>

      {modalType !== 'none' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in">
           <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 sm:p-14 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
              <button onClick={() => setModalType('none')} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>

              {modalType === 'support' ? (
                <div className="space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto text-cyan-500 shadow-lg border border-cyan-500/20">
                      <MessageSquare size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Falar com o <span className="text-cyan-500">Suporte</span></h2>
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Relate seu problema ou dúvida para nossa equipe técnica.</p>
                  </div>

                  <form onSubmit={handleSendSupport} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sua Mensagem</label>
                       <textarea 
                        value={supportMsg}
                        onChange={(e) => setSupportMsg(e.target.value)}
                        placeholder="Descreva detalhadamente como podemos ajudar..."
                        className="w-full bg-black border border-white/10 rounded-2xl p-6 text-white min-h-[150px] outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                       />
                    </div>
                    <button 
                      type="submit"
                      disabled={sent}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${sent ? 'bg-emerald-500 text-white' : 'bg-cyan-500 text-black hover:brightness-110 shadow-xl shadow-cyan-500/20'}`}
                    >
                      {sent ? <CheckCircle2 size={18} /> : <Send size={18} />}
                      {sent ? 'Mensagem Enviada!' : 'Enviar Mensagem'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-violet-600/10 rounded-xl text-violet-500 border border-violet-500/20">
                      {modalType === 'privacy' ? <Shield size={24}/> : <FileText size={24}/>}
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                      {modalType === 'privacy' ? 'Política de Privacidade' : 'Termos de Uso'}
                    </h2>
                  </div>
                  
                  <div className="space-y-6 text-slate-400 text-xs leading-relaxed uppercase tracking-wider font-medium text-justify">
                    <p>Nossa plataforma adota as melhores práticas de segurança digital. Seus dados são criptografados e armazenados em infraestrutura de alta disponibilidade.</p>
                    <p>Ao contratar nossos serviços, você garante que as informações inseridas no sistema são de sua inteira responsabilidade, servindo o CRMPlus+ apenas como provedor da tecnologia de gestão.</p>
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
                      <Info size={20} className="text-cyan-400 shrink-0" />
                      <p className="text-[9px] font-black tracking-widest">Para suporte jurídico adicional, utilize nosso canal oficial de atendimento.</p>
                    </div>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const location = useLocation();

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

  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/signup' || 
                     location.pathname === '/profiles' || 
                     location.pathname === '/pin';

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex flex-col">
      <Navbar 
        activeProfile={activeProfile} 
        onLogout={handleLogout} 
        onProfileReset={() => setActiveProfile(null)} 
      />
      <main className="flex-grow">
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
      {!isAuthPage && !location.pathname.startsWith('/v/') && <Footer />}
    </div>
  );
};

export default App;
