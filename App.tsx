
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  FileText, 
  Utensils, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Bell,
  Search,
  Lock
} from 'lucide-react';
import Catalog from './pages/Catalog';
import Oficina from './pages/Oficina';
import LockedModule from './pages/LockedModule';
import PublicView from './pages/PublicView';

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => {
  const location = useLocation();
  
  // Ocultar sidebar na visualização pública
  if (location.pathname.startsWith('/v/')) return null;

  const navItems = [
    { name: 'Início', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Oficina', path: '/oficina', icon: <Wrench size={20} /> },
    { name: 'Orçamentos', path: '/orcamento', icon: <FileText size={20} />, locked: true },
    { name: 'Cardápio', path: '/restaurante', icon: <Utensils size={20} />, locked: true },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={toggle} />}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 uppercase tracking-tight">
            <Wrench size={22} /> Oficina Pro
          </div>
          <button onClick={toggle} className="lg:hidden text-slate-500"><X size={20} /></button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.locked ? '#' : item.path} className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3">{item.icon} {item.name}</div>
              {item.locked && <Lock size={14} className="opacity-40" />}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/v/:data" element={<PublicView />} />
            <Route path="/*" element={
              <div className="lg:ml-64 p-4 lg:p-10">
                <div className="lg:hidden mb-4"><button onClick={toggleSidebar}><Menu /></button></div>
                <Routes>
                  <Route path="/" element={<Catalog />} />
                  <Route path="/oficina/*" element={<Oficina />} />
                  <Route path="/orcamento" element={<LockedModule name="Orçamento" />} />
                  <Route path="/restaurante" element={<LockedModule name="Restaurante" />} />
                </Routes>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
