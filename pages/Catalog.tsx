
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, FileText, Utensils, Play, Info, Plus, ChevronRight, Shield, Zap, BarChart3, Rocket } from 'lucide-react';
import { SystemConfig } from '../types';

const ModuleCard: React.FC<{ mod: any, onNavigate: (path: string) => void }> = ({ mod, onNavigate }) => {
  return (
    <div 
      onClick={() => mod.status === 'ACTIVE' && onNavigate(mod.path)}
      className={`relative group overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/10 transition-all duration-700 hover:border-cyan-500/50 hover:shadow-[0_0_60px_rgba(0,240,255,0.2)] cursor-pointer`}
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img 
          src={mod.image} 
          className="w-full h-full object-cover opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-1000 ease-out" 
          alt={mod.name}
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90 transition-opacity"></div>
      
      <div className="absolute bottom-0 left-0 w-full p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-2xl shadow-lg text-white">
            {mod.iconSmall}
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">{mod.name}</h3>
        </div>
        <p className="text-sm text-slate-200 font-medium leading-relaxed opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0">
          {mod.description}
        </p>
      </div>

      {mod.status === 'LOCKED' && (
        <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Expansão</span>
        </div>
      )}
    </div>
  );
};

const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<SystemConfig>({ companyName: 'CRMPLUS+', companyLogo: '' });

  useEffect(() => {
    const saved = localStorage.getItem('crmplus_system_config');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  const handleModuleClick = (path: string) => {
    const isAccountLoggedIn = sessionStorage.getItem('crmplus_account_auth') === 'true';
    if (isAccountLoggedIn) {
      navigate(path);
    } else {
      sessionStorage.setItem('crmplus_auth_redirect', path);
      navigate('/login');
    }
  };

  const systems = [
    {
      id: 'oficina',
      name: 'Oficina Pro+',
      description: 'Gestão de fluxo, O.S. digitais e faturamento industrial em tempo real.',
      iconSmall: <Wrench size={20} />,
      status: 'ACTIVE',
      path: '/oficina',
      image: 'https://images.unsplash.com/photo-1486006396113-ad750276bc92?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'orcamento',
      name: 'Vendas Plus',
      description: 'Plataforma de orçamentos rápidos com CRM integrado de alta conversão.',
      iconSmall: <FileText size={20} />,
      status: 'LOCKED',
      path: '/orcamento',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'restaurante',
      name: 'Gastro Hub',
      description: 'Operação completa para gastronomia, mesas e delivery unificado.',
      iconSmall: <Utensils size={20} />,
      status: 'LOCKED',
      path: '/restaurante',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] overflow-x-hidden">
      <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-20 py-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.12),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(217,70,239,0.08),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 text-center space-y-12 max-w-6xl animate-in fade-in zoom-in duration-1000">
          <div className="inline-flex items-center gap-3 bg-white/[0.03] backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/10 mb-4 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
            <Rocket size={14} className="text-cyan-400" fill="currentColor" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-cyan-400 neon-text-cyan">Plataforma SaaS Multisetorial</span>
          </div>

          <div className="flex flex-col items-center">
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter uppercase break-words">
              CRM<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Plus+</span>
            </h1>
            <p className="mt-8 text-cyan-400 font-black tracking-[0.8em] text-sm uppercase neon-text-cyan opacity-80">Conexão e Resultados</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-12">
            <p className="text-slate-200 text-xl lg:text-2xl font-medium leading-relaxed italic px-4 drop-shadow-lg">
              "Escolha o seu sistema e impulsione sua empresa agora."
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 px-6 sm:px-0">
              <button 
                onClick={() => handleModuleClick('/oficina')}
                className="w-full sm:w-auto group px-12 py-5 bg-gradient-to-r from-cyan-500 via-violet-600 to-magenta-500 text-white font-black rounded-2xl hover:brightness-125 hover:scale-105 transition-all duration-500 flex items-center justify-center gap-4 text-lg shadow-[0_15px_50px_rgba(0,240,255,0.3)] active:scale-95"
              >
                <Play size={20} fill="currentColor" /> 
                Acessar Dashboard
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-12 py-5 bg-white/[0.03] text-white font-black rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center gap-4 text-lg border border-white/10 backdrop-blur-xl"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-20 py-32 space-y-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                Sistemas <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500">Disponíveis</span>
              </h2>
              <div className="w-24 h-2 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full" />
            </div>
            <p className="text-slate-200 max-w-md font-semibold text-lg leading-relaxed">
              Soluções modulares de alta performance prontas para escalar o seu negócio imediatamente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {systems.map((mod) => (
              <ModuleCard key={mod.id} mod={mod} onNavigate={handleModuleClick} />
            ))}
          </div>
        </div>
      </section>

      <footer className="px-12 py-32 border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col items-center space-y-16">
          <div className="flex flex-col items-center gap-6">
            <div className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase">
              CRM<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-500 to-magenta-500">Plus+</span>
            </div>
            <p className="text-cyan-400 font-bold uppercase tracking-[0.6em] text-[10px] neon-text-cyan">Conexão e Resultados</p>
          </div>

          <div className="flex flex-wrap justify-center gap-12 text-sm font-black text-slate-300 uppercase tracking-[0.3em]">
            <a href="#" className="hover:text-cyan-400 transition-colors">Segurança Digital</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Infraestrutura Cloud</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Suporte 24/7</a>
          </div>

          <div className="text-center space-y-4 w-full">
            <div className="h-px w-64 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mx-auto" />
            <p className="text-slate-400 text-[10px] font-bold tracking-[0.6em] uppercase">© 2025 CRMPlus+ SaaS. Management Intelligence Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Catalog;
