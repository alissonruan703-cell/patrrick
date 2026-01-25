
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, FileText, Utensils, Play, Info, Plus, ChevronRight, Shield, Zap, BarChart3 } from 'lucide-react';
import { SystemConfig } from '../types';

const ModuleCard: React.FC<{ mod: any, onNavigate: (path: string) => void }> = ({ mod, onNavigate }) => {
  return (
    <div 
      onClick={() => mod.status === 'ACTIVE' && onNavigate(mod.path)}
      className={`relative group overflow-hidden rounded-3xl bg-[#1a1d23] border border-white/5 transition-all duration-700 hover:border-violet-500/30 hover:shadow-[0_30px_80px_rgba(0,0,0,0.8)] cursor-pointer`}
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img 
          src={mod.image} 
          className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out" 
          alt={mod.name}
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/20 to-transparent opacity-90 group-hover:opacity-70 transition-opacity"></div>
      
      <div className="absolute bottom-0 left-0 w-full p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-600 rounded-xl shadow-lg text-white">
            {mod.iconSmall}
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">{mod.name}</h3>
        </div>
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          {mod.description}
        </p>
      </div>

      {mod.status === 'LOCKED' && (
        <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Expansão</span>
        </div>
      )}
    </div>
  );
};

const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<SystemConfig>({ companyName: 'SISTEMA', companyLogo: '' });

  useEffect(() => {
    const saved = localStorage.getItem('crmplus_system_config');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  const systems = [
    {
      id: 'oficina',
      name: 'Oficina Pro+',
      description: 'Gestão completa de fluxo de trabalho, O.S. digitais e faturamento em tempo real.',
      iconSmall: <Wrench size={20} />,
      status: 'ACTIVE',
      path: '/oficina',
      image: 'https://images.unsplash.com/photo-1486006396113-ad750276bc92?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'orcamento',
      name: 'Vendas Plus',
      description: 'Plataforma de orçamentos rápidos com fechamento digital e CRM integrado.',
      iconSmall: <FileText size={20} />,
      status: 'LOCKED',
      path: '/orcamento',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'restaurante',
      name: 'Gastro Hub',
      description: 'Controle operacional para gastronomia, mesas, cozinha e delivery unificado.',
      iconSmall: <Utensils size={20} />,
      status: 'LOCKED',
      path: '/restaurante',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] overflow-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center px-6 lg:px-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600" 
            className="w-full h-full object-cover opacity-20 scale-105"
            alt="Fundo Tecnológico"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1115]/80 via-[#0f1115] to-[#0f1115]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-6xl animate-in fade-in zoom-in duration-1000">
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/10 mb-4">
            <Zap size={16} className="text-violet-500" fill="currentColor" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-400">Plataforma SaaS Corporativa</span>
          </div>

          <div className="flex flex-col items-center">
             {config.companyLogo && (
               <div className="h-24 w-auto flex items-center justify-center mb-10 animate-in slide-in-from-top duration-1000 transition-transform hover:scale-105 bg-transparent">
                 <img src={config.companyLogo} alt="Logo Empresa" className="h-full w-auto object-contain max-w-[320px]" />
               </div>
             )}
            <h1 className="text-6xl sm:text-8xl md:text-[8rem] font-black text-white leading-[0.85] tracking-tighter uppercase break-words px-4">
              {config.companyName.split(' ')[0]}<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-400">
                {config.companyName.split(' ').slice(1).join(' ') || 'MODERNO'}
              </span>
            </h1>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-10">
            <p className="text-slate-400 text-lg md:text-2xl font-medium leading-relaxed italic">
              "Bem-vindo ao centro de comando inteligente da sua empresa."
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6">
              <button 
                onClick={() => navigate('/oficina')}
                className="group px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-violet-500 hover:text-white transition-all duration-500 flex items-center gap-4 text-lg shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95"
              >
                <Play size={24} fill="currentColor" className="group-hover:text-white" /> 
                Acessar Oficina
              </button>
              <button onClick={() => navigate('/config')} className="px-10 py-5 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all flex items-center gap-4 text-lg border border-white/10 backdrop-blur-xl">
                Personalizar Sistema
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Values Section */}
      <section className="px-6 lg:px-20 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex gap-6 items-start">
            <div className="bg-violet-600/10 p-4 rounded-2xl border border-violet-500/20 text-violet-500">
              <Shield size={32} />
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">Segurança</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Dados criptografados e backup automático em nuvem industrial.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="bg-emerald-600/10 p-4 rounded-2xl border border-emerald-500/20 text-emerald-500">
              <Zap size={32} />
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">Performance</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Infraestrutura otimizada para tempo de resposta sub-milissegundo.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20 text-blue-500">
              <BarChart3 size={32} />
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">Insights</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Relatórios visuais inteligentes para tomada de decisão estratégica.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Modules Grid Section */}
      <section className="px-6 lg:px-20 py-32 space-y-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                Módulos <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-400">Ativos</span>
              </h2>
              <div className="w-24 h-2 bg-violet-600 rounded-full" />
            </div>
            <p className="text-slate-500 max-w-md font-medium text-lg leading-relaxed">
              Explore nossos módulos especializados projetados para elevar a eficiência operacional da sua empresa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {systems.map((mod) => (
              <ModuleCard key={mod.id} mod={mod} onNavigate={navigate} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="mt-20 px-12 py-32 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col items-center space-y-16">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-10">
              {config.companyLogo ? (
                <div className="h-16 w-auto flex items-center justify-center bg-transparent">
                  <img src={config.companyLogo} className="h-full w-auto object-contain max-w-[220px]" alt="Logo" />
                </div>
              ) : (
                <div className="bg-violet-600 p-2.5 rounded-xl shadow-2xl shadow-violet-600/40">
                  <Plus className="text-white" size={32} strokeWidth={4} />
                </div>
              )}
              <div className="text-5xl font-black text-white tracking-tighter uppercase">
                {config.companyName.split(' ')[0]}<span className="text-violet-500 ml-1">{config.companyName.split(' ').slice(1).join(' ') || '+'}</span>
              </div>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">MANAGEMENT INTELLIGENCE PLATFORM</p>
          </div>

          <div className="flex flex-wrap justify-center gap-12 md:gap-24 text-sm font-black text-slate-500 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors">Infraestrutura</a>
            <a href="#" className="hover:text-white transition-colors">Segurança</a>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
          </div>

          <div className="text-center space-y-4">
            <div className="h-px w-64 bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto" />
            <p className="text-slate-700 text-[9px] font-bold tracking-[0.6em] uppercase">© 2025 {config.companyName} Enterprises. Designed for High Performance.</p>
          </div>
        </div>
      </footer>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f1115; }
        ::-webkit-scrollbar-thumb { background: #1a1d23; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        body { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default Catalog;
