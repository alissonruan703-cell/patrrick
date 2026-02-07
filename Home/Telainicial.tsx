
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, FileText, Utensils, ArrowRight } from 'lucide-react';

const ModuleCard: React.FC<{ id: string; name: string; icon: React.ReactNode; image: string; desc: string }> = ({ id, name, icon, image, desc }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/module/${id}`)}
      className="group relative overflow-hidden rounded-[3rem] bg-zinc-900/40 border border-zinc-800 hover:border-red-600 transition-all duration-500 cursor-pointer shadow-2xl"
    >
      <div className="aspect-[16/9] overflow-hidden">
        <img src={image} className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-700" alt={name} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full p-10 space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{name}</h3>
        </div>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">{desc}</p>
        <div className="flex items-center gap-2 text-red-600 font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          Acessar Sistema <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
};

const Catalog: React.FC = () => {
  const systems = [
    {
      id: 'oficina',
      name: 'Oficina:',
      desc: 'Gestão de O.S. e Mecânica',
      icon: <Wrench size={24} />,
      image: 'https://images.unsplash.com/photo-1486006396113-ad750276bc92?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'orcamento',
      name: 'Orçamento:',
      desc: 'Vendas e Propostas em PDF/Link',
      icon: <FileText size={24} />,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'restaurante',
      name: 'Restaurante:',
      desc: 'Comandas e Controle de Mesas',
      icon: <Utensils size={24} />,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="min-h-screen bg-black py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="text-center space-y-6">
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">
            CATÁLOGO <span className="text-red-600">SISTEMAS</span>
          </h1>
          <p className="text-zinc-600 font-black uppercase tracking-[0.6em] text-xs">Selecione o acesso desejado</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {systems.map((sys) => (
            <ModuleCard key={sys.id} {...sys} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
