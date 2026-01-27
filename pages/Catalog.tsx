
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, FileText, Utensils, Play, Rocket, Lock, Clock } from 'lucide-react';
import { SystemConfig, AccountLicense } from '../types';

const ModuleCard: React.FC<{ mod: any, onNavigate: (id: string) => void, isAvailable: boolean }> = ({ mod, onNavigate, isAvailable }) => {
  return (
    <div 
      onClick={() => isAvailable && onNavigate(mod.id)}
      className={`relative group overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border transition-all duration-700 ${isAvailable ? 'border-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_60px_rgba(0,240,255,0.2)] cursor-pointer' : 'border-white/5 opacity-60 cursor-not-allowed'}`}
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img 
          src={mod.image} 
          className={`w-full h-full object-cover transition-all duration-1000 ease-out ${isAvailable ? 'opacity-30 group-hover:opacity-60 group-hover:scale-110' : 'opacity-10 grayscale'}`} 
          alt={mod.name}
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90 transition-opacity"></div>
      
      <div className="absolute bottom-0 left-0 w-full p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl shadow-lg text-white ${isAvailable ? 'bg-gradient-to-br from-cyan-400 to-violet-600' : 'bg-slate-800'}`}>
            {mod.iconSmall}
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">{mod.name}</h3>
        </div>
        <p className="text-sm text-slate-400 font-medium leading-relaxed">
          {isAvailable ? mod.description : "Módulo em desenvolvimento. Estamos preparando a melhor experiência para você."}
        </p>
        
        {!isAvailable && (
          <div className="flex items-center gap-2 text-amber-500 font-black uppercase text-[9px] tracking-[0.2em] pt-2">
            <Clock size={12} /> Engenharia Ativa
          </div>
        )}
      </div>

      {!isAvailable && (
        <div className="absolute top-6 right-6 bg-amber-500/10 backdrop-blur-2xl px-4 py-2 rounded-full border border-amber-500/30 flex items-center gap-2">
          <Lock size={12} className="text-amber-500" />
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Expansão</span>
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

  const handleStartSelection = (moduleId: string) => {
    sessionStorage.setItem('crmplus_selected_module_onboarding', moduleId);
    navigate('/signup');
  };

  const systems = [
    {
      id: 'oficina',
      name: 'Oficina Pro+',
      description: 'Gestão completa de O.S., faturamento e fluxo operacional para mecânicas.',
      iconSmall: <Wrench size={20} />,
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1486006396113-ad750276bc92?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'orcamento',
      name: 'Vendas Plus',
      description: 'Orçamentos rápidos com CRM integrado e alta taxa de conversão comercial.',
      iconSmall: <FileText size={20} />,
      isAvailable: false,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'restaurante',
      name: 'Gastro Hub',
      description: 'Gestão de mesas, delivery e pedidos para alta gastronomia e bares.',
      iconSmall: <Utensils size={20} />,
      isAvailable: false,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] overflow-x-hidden">
      <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-20 py-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.12),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.05),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 text-center space-y-12 max-w-6xl animate-in fade-in zoom-in duration-1000">
          <div className="inline-flex items-center gap-3 bg-white/[0.03] backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/10 mb-4 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
            <Rocket size={14} className="text-cyan-400" fill="currentColor" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-cyan-400 neon-text-cyan">Sistema por Assinatura</span>
          </div>

          <div className="flex flex-col items-center">
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter uppercase break-words">
              CRM<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Plus+</span>
            </h1>
            <p className="mt-8 text-cyan-400 font-black tracking-[0.8em] text-sm uppercase neon-text-cyan opacity-80">Conexão e Resultados</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-12">
            <p className="text-slate-300 text-xl lg:text-2xl font-medium leading-relaxed italic px-4 drop-shadow-lg">
              "Escolha o seu sistema ideal e comece a escalar sua empresa hoje mesmo."
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-black rounded-2xl hover:brightness-125 hover:scale-105 transition-all text-lg shadow-[0_15px_50px_rgba(0,240,255,0.3)] active:scale-95"
              >
                Ativar Minha Licença
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-12 py-5 bg-white/[0.03] text-white font-black rounded-2xl hover:bg-white/[0.08] transition-all text-lg border border-white/10 backdrop-blur-xl"
              >
                Acessar Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-20 py-32 space-y-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
             <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Segmentos <span className="text-cyan-400">Ativos</span></h2>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Selecione para iniciar sua configuração</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {systems.map((mod) => (
              <ModuleCard key={mod.id} mod={mod} onNavigate={handleStartSelection} isAvailable={mod.isAvailable} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Catalog;
