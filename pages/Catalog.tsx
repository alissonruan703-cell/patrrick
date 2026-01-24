
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, FileText, Utensils, ArrowRight, Lock } from 'lucide-react';

const Catalog: React.FC = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'oficina',
      name: 'Oficina Mecânica',
      description: 'Gestão completa de ordens de serviço, veículos e estoque de peças.',
      icon: <Wrench size={32} />,
      status: 'ACTIVE',
      path: '/oficina',
      color: 'bg-indigo-600'
    },
    {
      id: 'orcamento',
      name: 'Orçamentos Pro',
      description: 'Envie orçamentos profissionais para seus clientes com um clique.',
      icon: <FileText size={32} />,
      status: 'LOCKED',
      path: '/orcamento',
      color: 'bg-slate-400'
    },
    {
      id: 'restaurante',
      name: 'Restaurante Express',
      description: 'Controle de mesas, pedidos e cozinha para estabelecimentos gastronômicos.',
      icon: <Utensils size={32} />,
      status: 'LOCKED',
      path: '/restaurante',
      color: 'bg-slate-400'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Bem-vindo ao SaaS Pro</h1>
        <p className="text-slate-500 mt-2">Selecione o módulo que deseja acessar hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <div 
            key={mod.id}
            onClick={() => mod.status === 'ACTIVE' && navigate(mod.path)}
            className={`
              relative group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all duration-300
              ${mod.status === 'ACTIVE' ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : 'opacity-75'}
            `}
          >
            {mod.status === 'LOCKED' && (
              <div className="absolute top-4 right-4 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <Lock size={12} />
                Em Breve
              </div>
            )}
            
            <div className={`w-16 h-16 ${mod.color} text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {mod.icon}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">{mod.name}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              {mod.description}
            </p>

            <div className={`
              flex items-center gap-2 text-sm font-bold
              ${mod.status === 'ACTIVE' ? 'text-indigo-600' : 'text-slate-400'}
            `}>
              {mod.status === 'ACTIVE' ? 'Acessar Módulo' : 'Aguarde Lançamento'}
              {mod.status === 'ACTIVE' && <ArrowRight size={16} />}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-indigo-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">Precisa de um módulo personalizado?</h2>
          <p className="text-indigo-200">Entre em contato com nosso time de especialistas para desenvolvermos juntos.</p>
        </div>
        <button className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors shrink-0">
          Falar com Suporte
        </button>
      </div>
    </div>
  );
};

export default Catalog;
