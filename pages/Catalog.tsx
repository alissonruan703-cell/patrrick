
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, FileText, Utensils, Play, Info, Plus, ChevronRight } from 'lucide-react';

const ModuleCard: React.FC<{ mod: any, onNavigate: (path: string) => void }> = ({ mod, onNavigate }) => {
  return (
    <div 
      onClick={() => mod.status === 'ACTIVE' && onNavigate(mod.path)}
      className={`relative flex-none w-[200px] sm:w-[280px] md:w-[340px] aspect-video rounded-lg overflow-hidden bg-[#1a1d23] border border-white/5 transition-all duration-500 ease-out transform hover:scale-110 hover:z-50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-pointer group`}
    >
      <img 
        src={mod.image} 
        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" 
        alt={mod.name}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-transparent to-transparent opacity-90"></div>
      
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-violet-600 rounded shadow-lg text-white">{mod.iconSmall}</div>
          <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">{mod.name}</h3>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
           <p className="text-[10px] md:text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">
            {mod.description}
           </p>
        </div>
      </div>
      
      {mod.status === 'LOCKED' && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded text-[9px] font-black text-violet-400 border border-violet-500/20 uppercase tracking-[0.2em]">
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
      iconSmall: <Wrench size={14} />,
      status: 'ACTIVE',
      path: '/oficina',
      image: 'https://images.unsplash.com/photo-1486006396113-ad750276bc92?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'orcamento',
      name: 'Orçamentos Plus',
      description: 'Criação de propostas comerciais de alto impacto visual para vendas.',
      iconSmall: <FileText size={14} />,
      status: 'LOCKED',
      path: '/orcamento',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'restaurante',
      name: 'Gastro Manager',
      description: 'Controle de mesas, PDV e delivery com inteligência de dados.',
      iconSmall: <Utensils size={14} />,
      status: 'LOCKED',
      path: '/restaurante',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="pb-32 bg-[#0f1115]">
      {/* Netflix Billboard - Ampliada */}
      <section className="relative h-[75vh] md:h-[90vh] w-full overflow-hidden mb-[-5vh]">
        <img 
          src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&q=80&w=1600" 
          className="absolute inset-0 w-full h-full object-cover scale-110"
          alt="Featured System"
        />
        {/* Gradientes mais densos para isolar o conteúdo */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1115] via-transparent to-transparent"></div>
        
        <div className="absolute bottom-24 lg:bottom-32 left-8 lg:left-16 max-w-3xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="flex items-center gap-3">
            <div className="bg-violet-600 p-1.5 rounded shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                <Plus size={18} className="text-white" strokeWidth={4} />
            </div>
            <span className="text-xs font-black tracking-[0.5em] text-violet-400 uppercase">Premium Experience</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter uppercase">
            SISTEMA<br/><span className="text-violet-600">MODERNO</span>
          </h1>
          
          <p className="text-slate-300 text-base md:text-xl font-medium leading-relaxed max-w-xl drop-shadow-lg opacity-90">
            A revolução na gestão do seu negócio. Simplicidade, poder e design em uma única plataforma integrada.
          </p>
          
          <div className="flex flex-wrap gap-4 md:gap-6 pt-4">
            <button 
              onClick={() => navigate('/oficina')}
              className="px-8 md:px-12 py-3 md:py-5 bg-white text-black font-black rounded-lg hover:bg-slate-200 transition-all flex items-center gap-3 text-sm md:text-lg shadow-2xl"
            >
              <Play size={24} fill="black" /> Começar Agora
            </button>
            <button className="px-8 md:px-12 py-3 md:py-5 bg-[#6d6d6eb3] text-white font-black rounded-lg hover:bg-[#6d6d6e66] transition-all flex items-center gap-3 text-sm md:text-lg backdrop-blur-md border border-white/10">
              <Info size={24} /> Ver Detalhes
            </button>
          </div>
        </div>
      </section>

      {/* Rows com espaçamento generoso */}
      <div className="px-8 lg:px-16 relative z-20 space-y-24 md:space-y-32">
        
        {/* Row 1: Active Systems */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 group cursor-pointer w-fit">
            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight">Sistemas em Alta</h2>
            <ChevronRight className="text-violet-500 transition-transform group-hover:translate-x-2" size={28} />
          </div>
          <div className="flex gap-6 overflow-x-visible pb-12 no-scrollbar scroll-smooth">
            {systems.map((mod) => (
              <ModuleCard key={mod.id} mod={mod} onNavigate={navigate} />
            ))}
          </div>
        </section>

        {/* Row 2: Management Tools */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 group cursor-pointer w-fit">
            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight">Novidades CRMPlus+</h2>
            <ChevronRight className="text-violet-500 transition-transform group-hover:translate-x-2" size={28} />
          </div>
          <div className="flex gap-6 overflow-x-visible pb-12 no-scrollbar scroll-smooth">
            {[...systems].reverse().map((mod, i) => (
              <ModuleCard key={`row2-${i}`} mod={mod} onNavigate={navigate} />
            ))}
          </div>
        </section>

        {/* Row 3: Industry Specific */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 group cursor-pointer w-fit">
            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight">Gestão por Segmento</h2>
            <ChevronRight className="text-violet-500 transition-transform group-hover:translate-x-2" size={28} />
          </div>
          <div className="flex gap-6 overflow-x-visible pb-12 no-scrollbar scroll-smooth">
            {systems.map((mod, i) => (
              <ModuleCard key={`row3-${i}`} mod={mod} onNavigate={navigate} />
            ))}
          </div>
        </section>

      </div>

      <footer className="mt-40 px-12 py-20 border-t border-white/5 flex flex-col items-center gap-8 bg-black/40">
        <div className="flex items-center gap-3 text-3xl font-black text-white">
          <div className="bg-violet-600 p-2 rounded-lg"><Plus className="text-white" size={24} /></div>
          CRM<span className="text-violet-500">Plus+</span>
        </div>
        <div className="flex flex-wrap justify-center gap-10 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <span className="hover:text-white transition-colors cursor-pointer">Termos de Uso</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacidade</span>
            <span className="hover:text-white transition-colors cursor-pointer">Segurança</span>
            <span className="hover:text-white transition-colors cursor-pointer">Contato</span>
        </div>
        <p className="text-slate-600 text-[11px] font-medium tracking-[0.2em] uppercase">© 2025 CRMPlus+ Entertainment Management System. All Rights Reserved.</p>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { overflow-x: hidden; }
      `}</style>
    </div>
  );
};

export default Catalog;
