
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, FileText, Utensils, Play, Info, Plus, ChevronRight } from 'lucide-react';

const ModuleCard: React.FC<{ mod: any, onNavigate: (path: string) => void }> = ({ mod, onNavigate }) => {
  return (
    <div 
      onClick={() => mod.status === 'ACTIVE' && onNavigate(mod.path)}
      className={`relative flex-none w-[260px] sm:w-[320px] md:w-[400px] aspect-video rounded-xl overflow-hidden bg-[#1a1d23] border border-white/5 transition-all duration-500 ease-out transform hover:scale-105 hover:z-50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)] cursor-pointer group`}
    >
      <img 
        src={mod.image} 
        className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all duration-700" 
        alt={mod.name}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-transparent to-transparent opacity-90"></div>
      
      <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-violet-600 rounded shadow-lg text-white">{mod.iconSmall}</div>
          <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wider">{mod.name}</h3>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
           <p className="text-xs md:text-sm text-slate-300 line-clamp-2 leading-relaxed font-medium">
            {mod.description}
           </p>
        </div>
      </div>
      
      {mod.status === 'LOCKED' && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-violet-400 border border-violet-500/20 uppercase tracking-[0.2em]">
          Em Breve
        </div>
      )}
    </div>
  );
};

const Catalog: React.FC = () => {
  const navigate = useNavigate();

  const systems = [
    {
      id: 'oficina',
      name: 'Oficina Pro+',
      description: 'Gestão automotiva completa, O.S. inteligente e faturamento simplificado.',
      iconSmall: <Wrench size={18} />,
      status: 'ACTIVE',
      path: '/oficina',
      image: 'https://images.unsplash.com/photo-1486006396113-ad750276bc92?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'orcamento',
      name: 'Orçamentos Plus',
      description: 'Criação de propostas comerciais de alto impacto visual para vendas.',
      iconSmall: <FileText size={18} />,
      status: 'LOCKED',
      path: '/orcamento',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'restaurante',
      name: 'Gastro Manager',
      description: 'Controle de mesas, PDV e delivery com inteligência de dados.',
      iconSmall: <Utensils size={18} />,
      status: 'LOCKED',
      path: '/restaurante',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="pb-32 bg-[#0f1115]">
      {/* Billboard Principal - Escala Reduzida e Corrigida */}
      <section className="relative h-[85vh] md:h-screen w-full overflow-hidden flex items-center">
        <img 
          src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&q=80&w=1600" 
          className="absolute inset-0 w-full h-full object-cover scale-105"
          alt="Featured System"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1115] via-[#0f1115]/30 to-transparent"></div>
        
        <div className="relative z-10 w-full px-8 lg:px-20 max-w-5xl space-y-6 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="flex items-center gap-3">
            <div className="bg-violet-600 p-2 rounded shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                <Plus size={20} className="text-white" strokeWidth={4} />
            </div>
            <span className="text-xs font-black tracking-[0.5em] text-violet-400 uppercase">SaaS Premium</span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl md:text-[8.5rem] font-black text-white leading-[0.9] tracking-tighter uppercase drop-shadow-2xl">
            SISTEMA<br/><span className="text-violet-600">MODERNO</span>
          </h1>
          
          <p className="text-slate-200 text-base md:text-xl font-medium leading-relaxed max-w-2xl drop-shadow-lg">
            Gestão inteligente com design cinematográfico. Simplicidade e poder integrados para o seu negócio.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-6">
            <button 
              onClick={() => navigate('/oficina')}
              className="px-8 py-4 md:px-12 md:py-5 bg-white text-black font-black rounded-xl hover:bg-slate-200 transition-all flex items-center gap-3 text-sm md:text-lg shadow-2xl hover:scale-105 active:scale-95"
            >
              <Play size={24} fill="black" /> Entrar Agora
            </button>
            <button className="px-8 py-4 md:px-12 md:py-5 bg-white/10 text-white font-black rounded-xl hover:bg-white/20 transition-all flex items-center gap-3 text-sm md:text-lg backdrop-blur-xl border border-white/20 hover:scale-105 active:scale-95">
              <Info size={24} /> Detalhes
            </button>
          </div>
        </div>
      </section>

      <div className="px-8 lg:px-20 relative z-20 -mt-16 space-y-24">
        <section className="space-y-6">
          <div className="flex items-center gap-4 group cursor-pointer w-fit">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Módulos Ativos</h2>
            <ChevronRight className="text-violet-500 transition-transform group-hover:translate-x-2" size={32} />
          </div>
          <div className="flex gap-8 overflow-x-auto no-scrollbar pb-8">
            {systems.map((mod) => (
              <ModuleCard key={mod.id} mod={mod} onNavigate={navigate} />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 group cursor-pointer w-fit">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Recentes</h2>
            <ChevronRight className="text-violet-500 transition-transform group-hover:translate-x-2" size={32} />
          </div>
          <div className="flex gap-8 overflow-x-auto no-scrollbar pb-8">
            {[...systems].reverse().map((mod, i) => (
              <ModuleCard key={`recent-${i}`} mod={mod} onNavigate={navigate} />
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-32 px-12 py-20 border-t border-white/5 flex flex-col items-center gap-8 bg-black/60">
        <div className="flex items-center gap-3 text-3xl font-black text-white">
          <div className="bg-violet-600 p-2 rounded-lg"><Plus className="text-white" size={24} /></div>
          CRM<span className="text-violet-500">Plus+</span>
        </div>
        <p className="text-slate-600 text-[10px] font-bold tracking-[0.4em] uppercase">© 2025 CRMPlus+ Enterprises.</p>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Catalog;
