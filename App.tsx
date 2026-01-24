
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Catálogo', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Oficina', path: '/oficina', icon: <Wrench size={20} /> },
    { name: 'Orçamento', path: '/orcamento', icon: <FileText size={20} />, locked: true },
    { name: 'Restaurante', path: '/restaurante', icon: <Utensils size={20} />, locked: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={toggle}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <div className="bg-indigo-600 text-white p-1 rounded">
              <Wrench size={20} />
            </div>
            SaaS Pro
          </div>
          <button onClick={toggle} className="lg:hidden p-1 rounded-md text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.locked ? '#' : item.path}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${location.pathname === item.path 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}
                ${item.locked ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.name}
              </div>
              {item.locked && <Lock size={14} className="text-slate-400" />}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              JS
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">João Silva</p>
              <p className="text-xs text-slate-500 truncate">Admin</p>
            </div>
          </div>
          <button className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white/80 backdrop-blur-md border-b border-slate-200 lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-600 rounded-md lg:hidden hover:bg-slate-100"
        >
          <Menu size={20} />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="pl-10 pr-4 py-2 text-sm bg-slate-100 border-transparent rounded-full focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all w-64"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
          <Settings size={20} />
        </button>
        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
        <button className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <User size={18} className="text-slate-500" />
          </div>
          <span className="hidden sm:inline text-sm font-medium text-slate-700">Minha Conta</span>
        </button>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
        
        <main className="flex-1 lg:ml-64 flex flex-col">
          <Header onMenuClick={toggleSidebar} />
          
          <div className="p-4 lg:p-8 flex-1">
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/oficina/*" element={<Oficina />} />
              <Route path="/orcamento" element={<LockedModule name="Orçamento" />} />
              <Route path="/restaurante" element={<LockedModule name="Restaurante" />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
