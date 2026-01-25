
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  FileText, 
  Utensils, 
  Menu, 
  X,
  Lock,
  Plus
} from 'lucide-react';
import Catalog from './pages/Catalog';
import Oficina from './pages/Oficina';
import LockedModule from './pages/LockedModule';
import PublicView from './pages/PublicView';

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => {
  const location = useLocation();
  if (location.pathname.startsWith('/v/')) return null;

  const navItems = [
    { name: 'Navegar', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Minha Oficina', path: '/oficina', icon: <Wrench size={20} /> },
    { name: 'Orçamentos', path: '/orcamento', icon: <FileText size={20} />, locked: true },
    { name: 'Restaurante', path: '/restaurante', icon: <Utensils size={20} />, locked: true },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" onClick={toggle} />}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-72 bg-[#0f1115] border-r border-white/5 transition-all duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-2 p-8 mb-4">
          <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2 rounded-lg shadow-lg shadow-violet-500/20">
            <Plus size={24} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">CRM<span className="text-violet-500">Plus+</span></span>
        </div>
        
        <nav className="px-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.locked ? '#' : item.path} 
              onClick={() => !item.locked && toggle()}
              className={`group flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${location.pathname === item.path ? 'bg-white/5 text-white shadow-[0_0_20px_rgba(139,92,246,0.1)] border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-4">
                <span className={`${location.pathname === item.path ? 'text-violet-500' : 'text-slate-500 group-hover:text-violet-400'}`}>{item.icon}</span>
                {item.name}
              </div>
              {item.locked && <Lock size={14} className="opacity-20" />}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-8">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 border border-white/5">
            <p className="text-xs font-black text-violet-400 uppercase tracking-widest mb-2">Plano Pro</p>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Acesso total às ferramentas de gestão inteligentes.</p>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-full h-full bg-violet-500"></div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#0f1115] flex text-slate-200">
        <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/v/:data" element={<PublicView />} />
            <Route path="/*" element={
              <div className="lg:ml-72 flex-1">
                <header className="lg:hidden p-6 border-b border-white/5 flex items-center justify-between bg-[#0f1115]">
                   <div className="flex items-center gap-2">
                    <div className="bg-violet-600 p-1.5 rounded-lg"><Plus size={18} className="text-white" /></div>
                    <span className="font-black text-white">CRMPlus+</span>
                   </div>
                   <button onClick={toggleSidebar} className="text-white"><Menu size={28}/></button>
                </header>
                <div className="p-6 lg:p-12 animate-in fade-in duration-700">
                  <Routes>
                    <Route path="/" element={<Catalog />} />
                    <Route path="/oficina/*" element={<Oficina />} />
                    <Route path="/orcamento" element={<LockedModule name="Orçamento" />} />
                    <Route path="/restaurante" element={<LockedModule name="Restaurante" />} />
                  </Routes>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;