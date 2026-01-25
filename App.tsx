
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
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (location.pathname.startsWith('/v/')) return null;

  const navItems = [
    { name: 'Início', path: '/' },
    { name: 'Oficina', path: '/oficina' },
    { name: 'Orçamentos', path: '/orcamento', locked: true },
    { name: 'Restaurante', path: '/restaurante', locked: true },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-500 flex items-center justify-between px-6 lg:px-12 py-4 ${isScrolled ? 'bg-[#0f1115]' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center gap-8 lg:gap-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-violet-600 p-1.5 rounded-lg shadow-lg shadow-violet-600/20">
            <Plus size={20} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-xl lg:text-2xl font-black tracking-tighter text-white">CRM<span className="text-violet-500">Plus+</span></span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.locked ? '#' : item.path}
              className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${location.pathname === item.path ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {item.name}
              {item.locked && <Lock size={12} className="opacity-40" />}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6 text-white">
        <Search size={20} className="hidden lg:block cursor-pointer hover:text-violet-500 transition-colors" />
        <Bell size={20} className="hidden lg:block cursor-pointer hover:text-violet-500 transition-colors" />
        <div className="w-8 h-8 rounded bg-violet-600 flex items-center justify-center text-xs font-bold shadow-lg">JS</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden">
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0f1115] z-[60] p-8 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-300">
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-white">
            <X size={32} />
          </button>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.locked ? '#' : item.path}
              onClick={() => !item.locked && setIsMobileMenuOpen(false)}
              className={`text-2xl font-black ${location.pathname === item.path ? 'text-violet-500' : 'text-white'}`}
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
      <div className="min-h-screen bg-[#0f1115] text-slate-200">
        <Navbar />
        <main className="pt-0">
          <Routes>
            <Route path="/v/:data" element={<PublicView />} />
            <Route path="/*" element={
              <Routes>
                <Route path="/" element={<Catalog />} />
                <Route path="/oficina/*" element={<Oficina />} />
                <Route path="/orcamento" element={<LockedModule name="Orçamento" />} />
                <Route path="/restaurante" element={<LockedModule name="Restaurante" />} />
              </Routes>
            } />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
