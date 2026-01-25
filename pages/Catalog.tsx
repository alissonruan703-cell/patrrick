
import React from 'react';
import { useNavigate } from 'react-router-dom';
// Added Plus to the import list from lucide-react to fix the "Cannot find name 'Plus'" error on line 115
import { Wrench, FileText, Utensils, ArrowRight, Lock, Play, Plus } from 'lucide-react';

const Catalog: React.FC = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'oficina',
      name: 'Oficina Pro+',
      description: 'Otimize seu fluxo de trabalho, controle veículos e estoque.',
      icon: <Wrench size={32} />,
      status: 'ACTIVE',
      path: '/oficina',
      image: 'https://images.unsplash.com/photo-1486006396113-ad750276bc92?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'orcamento',
      name: 'Orçamentos Plus',
      description: 'Design premium para impressionar seus clientes finais.',
      icon: <FileText size={32} />,
      status: 'LOCKED',
      path: '/orcamento',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'restaurante',
      name: 'Fast Food Manager',
      description: 'O sistema definitivo para bares e restaurantes modernos.',
      icon: <Utensils size={32} />,
      status: 'LOCKED',
      path: '/restaurante',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-[2rem] overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1517649763962-0c6234978a0b?auto=format&fit=crop&q=80&w=1600" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
          alt="Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1115] via-[#0f1115]/40 to-transparent"></div>
        
        <div className="absolute bottom-12 left-12 max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30 text-[10px] font-black uppercase tracking-widest">
            Disponível Agora
          </div>
          <h1 className="text-6xl font-black text-white leading-none tracking-tighter">Módulo <br/><span className="text-violet-500">Oficina Pro</span></h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Gestão inteligente de ordens de serviço com compartilhamento via WhatsApp e visualização premium para seus clientes.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/oficina')}
              className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-3 shadow-xl shadow-white/5"
            >
              <Play size={20} fill="black" /> Começar Agora
            </button>
            <button className="px-10 py-4 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md border border-white/5">
              Saiba Mais
            </button>
          </div>
        </div>
      </section>

      {/* Rows Style Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          Próximos Lançamentos <span className="h-0.5 w-12 bg-violet-600"></span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod) => (
            <div 
              key={mod.id}
              onClick={() => mod.status === 'ACTIVE' && navigate(mod.path)}
              className={`relative group rounded-3xl overflow-hidden bg-[#1a1d23] border border-white/5 transition-all duration-500 ${mod.status === 'ACTIVE' ? 'cursor-pointer hover:border-violet-500/50 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] hover:-translate-y-2' : 'opacity-60 cursor-not-allowed'}`}
            >
              <div className="h-48 relative overflow-hidden">
                <img src={mod.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d23] to-transparent"></div>
                <div className="absolute bottom-4 left-6 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  {mod.icon}
                </div>
              </div>

              <div className="p-8 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white">{mod.name}</h3>
                  {mod.status === 'LOCKED' && <Lock size={18} className="text-slate-500" />}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                  {mod.description}
                </p>
                
                <div className={`pt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest ${mod.status === 'ACTIVE' ? 'text-violet-500' : 'text-slate-600'}`}>
                  {mod.status === 'ACTIVE' ? 'Explorar Módulo' : 'Em breve no CRMPlus+'}
                  {mod.status === 'ACTIVE' && <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="pt-20 pb-10 border-t border-white/5 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-2xl font-black">
          <Plus className="text-violet-500" size={24} /> CRMPlus+
        </div>
        <p className="text-slate-500 text-sm">© 2024 CRMPlus+ Intelligent Management System. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Catalog;
