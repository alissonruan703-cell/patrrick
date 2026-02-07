
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Utensils, FileText, LayoutGrid, Heart, ClipboardCheck, ArrowRight, Lock, Clock } from 'lucide-react';

const Dashboard: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();

  const moduleInfo = [
    { id: 'oficina', title: 'Oficina', icon: <Wrench size={20} />, desc: 'O.S. e Mecânica' },
    { id: 'restaurante', title: 'Restaurante', icon: <Utensils size={20} />, desc: 'Pedidos e Mesas' },
    { id: 'orcamento', title: 'Orçamento', icon: <FileText size={20} />, desc: 'Vendas e PDF' },
    { id: 'funil', title: 'Funil', icon: <LayoutGrid size={20} />, desc: 'Vendas Kanban' },
    { id: 'nps', title: 'NPS', icon: <Heart size={20} />, desc: 'Satisfação' },
    { id: 'inspeção', title: 'Inspeção', icon: <ClipboardCheck size={20} />, desc: 'Checklists' },
  ];

  const activeSubs = user.subscriptions.filter((s:any) => s.status.includes('ativa') || s.status === 'teste_ativo');
  const availableSubs = moduleInfo.filter(m => !activeSubs.find((s:any) => s.id === m.id));

  return (
    <div className="p-4 md:p-8 pb-32 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
        <div>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Sua <span className="text-red-600">Gestão</span></h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Conta Ativa: {user.companyName}</p>
        </div>
        <button onClick={() => navigate('/billing')} className="w-full md:w-auto bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
          Ver Assinaturas <ArrowRight size={14} />
        </button>
      </div>

      <section className="mb-12 md:mb-16">
        <h2 className="text-[9px] font-black uppercase text-zinc-700 tracking-[0.3em] mb-6 flex items-center gap-3">
          Sistemas Ativos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {activeSubs.map((sub:any) => {
            const info = moduleInfo.find(m => m.id === sub.id);
            return (
              <div key={sub.id} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 md:p-8 group hover:border-red-600/30 transition-all relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-4 md:p-6 opacity-40">
                  {sub.status === 'teste_ativo' && <Clock size={16} className="text-red-600" />}
                </div>
                
                <div className="text-red-600 mb-6 group-hover:scale-110 transition-transform">{info?.icon}</div>
                <h3 className="text-xl md:text-2xl font-black uppercase mb-1 tracking-tight">{info?.title}</h3>
                <p className="text-zinc-500 font-bold text-[9px] uppercase mb-8 tracking-widest">{info?.desc}</p>
                
                <div className="flex gap-3">
                  <button onClick={() => navigate(`/module/${sub.id}`)} className="flex-1 bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all">Acessar</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-[9px] font-black uppercase text-zinc-700 tracking-[0.3em] mb-6 flex items-center gap-3">
          Disponíveis
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {availableSubs.map((mod:any) => (
            <div key={mod.id} className="bg-black border border-zinc-900 rounded-2xl p-5 md:p-6 opacity-60 hover:opacity-100 transition-all">
              <div className="text-zinc-600 mb-4 flex justify-between items-center">
                {mod.icon}
                <Lock size={14} />
              </div>
              <h3 className="text-sm md:text-lg font-black uppercase mb-1">{mod.title}</h3>
              <button 
                onClick={() => navigate('/billing')}
                className="w-full mt-4 border border-zinc-800 py-2.5 rounded-lg font-black uppercase text-[8px] md:text-[9px] tracking-widest hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
              >
                R$ 50/mês
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
