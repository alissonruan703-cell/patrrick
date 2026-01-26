
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
      
      <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-600 rounded-xl shadow-lg text-white">
            {mod.iconSmall}
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">{mod.name}</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0">
          {mod.description}
        </p>
      </div>

      {mod.status === 'LOCKED' && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-black/60 backdrop-blur-xl px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
          <span className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-[0.2em]">Expansão</span>
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
    <div className="min-h-screen bg-[#0f1115] overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-20 py-24">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600" 
            className="w-full h-full object-cover opacity-20 scale-105"
            alt="Fundo Tecnológico"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1115]/80 via-[#0f1115] to-[#0f1115]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 text-center space-y-6 sm:space-y-10 max-w-6xl animate-in fade-in zoom-in duration-1000">
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-white/10 mb-4">
            <Zap size={14} className="text-violet-500" fill="currentColor" />
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-violet-400">Plataforma SaaS Corporativa</span>
          </div>

          <div className="flex flex-col items-center">
             {config.companyLogo && (
               <div className="h-16 sm:h-24 w-auto flex items-center justify-center mb-6 sm:mb-10 bg-transparent transition-transform hover:scale-105">
                 <img src={config.companyLogo} alt="Logo Empresa" className="h-full w-auto object-contain max-w-[240px] sm:max-w-[320px]" />
               </div>
             )}
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[8rem] font-black text-white leading-[0.9] tracking-tighter uppercase break-words px-4">
              {config.companyName.split(' ')[0]}<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-400">
                {config.companyName.split(' ').slice(1).join(' ') || 'MODERNO'}
              </span>
            </h1>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8 sm:space-y-12">
            <p className="text-slate-400 text-base sm:text-xl lg:text-2xl font-medium leading-relaxed italic px-4 sm:px-0">
              "Bem-vindo ao centro de comando inteligente da sua empresa."
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-6 sm:px-0">
              <button 
                onClick={() => navigate('/oficina')}
                className="w-full sm:w-auto group px-8 sm:px-10 py-4 sm:py-5 bg-white text-black font-black rounded-2xl hover:bg-violet-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-4 text-base sm:text-lg shadow-xl active:scale-95"
              >
                <Play size={20} fill="currentColor" className="group-hover:text-white" /> 
                Acessar Oficina
              </button>
              <button onClick={() => navigate('/config')} className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-4 text-base sm:text-lg border border-white/10 backdrop-blur-xl">
                Personalizar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Values Section */}
      <section className="px-6 lg:px-20 py-16 sm:py-20 bg-black/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {[
            { icon: <Shield size={32} />, title: 'Segurança', text: 'Dados criptografados e backup automático em nuvem industrial.', color: 'violet' },
            { icon: <Zap size={32} />, title: 'Performance', text: 'Infraestrutura otimizada para tempo de resposta sub-milissegundo.', color: 'emerald' },
            { icon: <BarChart3 size={32} />, title: 'Insights', text: 'Relatórios visuais inteligentes para tomada de decisão estratégica.', color: 'blue' }
          ].map((item, i) => (
            <div key={i} className="flex gap-5 sm:gap-6 items-start">
              <div className={`bg-${item.color}-600/10 p-3 sm:p-4 rounded-2xl border border-${item.color}-500/20 text-${item.color}-500 shrink-0`}>
                {item.icon}
              </div>
              <div>
                <h4 className="text-white font-black uppercase tracking-widest text-xs sm:text-sm mb-1.5">{item.title}</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Modules Grid Section */}
      <section className="px-6 lg:px-20 py-20 sm:py-32 space-y-12 sm:space-y-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                Módulos <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-400">Ativos</span>
              </h2>
              <div className="w-16 sm:w-24 h-2 bg-violet-600 rounded-full" />
            </div>
            <p className="text-slate-500 max-w-md font-medium text-base sm:text-lg leading-relaxed">
              Explore nossos módulos especializados projetados para elevar a eficiência operacional da sua empresa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {systems.map((mod) => (
              <ModuleCard key={mod.id} mod={mod} onNavigate={navigate} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="px-6 sm:px-12 py-20 sm:py-32 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col items-center space-y-12 sm:space-y-16">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 text-center sm:text-left">
              {config.companyLogo ? (
                <div className="h-12 sm:h-16 w-auto flex items-center justify-center bg-transparent">
                  <img src={config.companyLogo} className="h-full w-auto object-contain max-w-[180px] sm:max-w-[220px]" alt="Logo" />
                </div>
              ) : (
                <div className="bg-violet-600 p-2 sm:p-2.5 rounded-xl shadow-2xl shadow-violet-600/40">
                  <Plus className="text-white" size={24} sm:size={32} strokeWidth={4} />
                </div>
              )}
              <div className="text-3xl sm:text-5xl font-black text-white tracking-tighter uppercase">
                {config.companyName.split(' ')[0]}<span className="text-violet-500 ml-1">{config.companyName.split(' ').slice(1).join(' ') || '+'}</span>
              </div>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[8px] sm:text-[10px]">MANAGEMENT INTELLIGENCE PLATFORM</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 md:gap-24 text-[10px] sm:text-sm font-black text-slate-500 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors">Infraestrutura</a>
            <a href="#" className="hover:text-white transition-colors">Segurança</a>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
          </div>

          <div className="text-center space-y-4 w-full">
            <div className="h-px w-32 sm:w-64 bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto" />
            <p className="text-slate-700 text-[7px] sm:text-[9px] font-bold tracking-[0.4em] sm:tracking-[0.6em] uppercase">© 2025 {config.companyName} Enterprises. Designed for High Performance.</p>
          </div>
        </div>
      </footer>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f1115; }
        ::-webkit-scrollbar-thumb { background: #1a1d23; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        body { scroll-behavior: smooth; overflow-x: hidden; width: 100vw; }
      `}</style>
    </div>
  );
};

export default Catalog;
