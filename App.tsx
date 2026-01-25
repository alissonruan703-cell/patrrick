
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  FileText, 
  Utensils, 
  Menu, 
  X,
  Lock,
  Plus,
  Search,
  Bell,
  User
} from 'lucide-react';
import Catalog from './pages/Catalog';
import Oficina from './pages/Oficina';
import LockedModule from './pages/LockedModule';
import PublicView from './pages/PublicView';

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (location.pathname.startsWith('/v/')) return null;

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Oficina', path: '/oficina' },
    { name: 'Orçamentos', path: '/orcamento', locked: true },
    { name: 'Restaurante', path: '/restaurante', locked: true },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-700 flex items-center justify-between px-6 lg:px-12 py-5 ${isScrolled ? 'bg-[#0f1115]/90 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent'}`}>
      <div className="flex items-center gap-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="bg-violet-600 p-1.5 rounded-lg shadow-xl shadow-violet-600/30">
            <Plus size={20} className="text-white" strokeWidth={4} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase">CRM<span className="text-violet-500">Plus+</span></span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.locked ? '#' : item.path}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${location.pathname === item.path ? 'text-violet-500' : 'text-slate-400 hover:text-white'}`}
            >
              {item.name}
              {item.locked && <Lock size={10} className="opacity-40" />}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6 text-white">
        <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
          <Search size={16} className="text-slate-500" />
          <input placeholder="Busca global..." className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-24 focus:w-48 transition-all" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-[10px] font-black shadow-2xl shadow-violet-600/20 cursor-pointer border border-white/10 hover:scale-110 transition-transform">ADMIN</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden">
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0f1115] z-[60] p-8 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8 text-white">
            <X size={40} />
          </button>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.locked ? '#' : item.path}
              onClick={() => !item.locked && setIsMobileMenuOpen(false)}
              className={`text-3xl font-black uppercase tracking-tighter ${location.pathname === item.path ? 'text-violet-500' : 'text-white'}`}
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
  return (
    <HashRouter>
      <div className="min-h-screen bg-[#0f1115] text-slate-200 selection:bg-violet-600/30 selection:text-violet-400">
        <Navbar />
        <main>
          <Routes>
            <Route path="/v/:data" element={<PublicView />} />
            <Route path="/*" element={
              <Routes>
                <Route path="/" element={<Catalog />} />
                <Route path="/oficina/*" element={<Oficina />} />
                <Route path="/orcamento" element={<LockedModule name="Vendas" />} />
                <Route path="/restaurante" element={<LockedModule name="Gastro Hub" />} />
              </Routes>
            } />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
