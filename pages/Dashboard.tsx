
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Utensils, FileText, LayoutGrid, Heart, ClipboardCheck, ArrowRight, Lock, Clock } from 'lucide-react';

const Dashboard: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();

  const moduleInfo = [
    { id: 'oficina', title: 'Oficina', icon: <Wrench size={24} />, desc: 'O.S. e Mecânica' },
    { id: 'restaurante', title: 'Restaurante', icon: <Utensils size={24} />, desc: 'Pedidos e Mesas' },
    { id: 'orcamento', title: 'Orçamento', icon: <FileText size={24} />, desc: 'Vendas e PDF' },
    { id: 'funil', title: 'Funil', icon: <LayoutGrid size={24} />, desc: 'Vendas Kanban' },
    { id: 'nps', title: 'NPS', icon: <Heart size={24} />, desc: 'Satisfação' },
    { id: 'inspeção', title: 'Inspeção', icon: <ClipboardCheck size={24} />, desc: 'Checklists' },
  ];

  const activeSubs = user.subscriptions.filter((s:any) => s.status.includes('ativa') || s.status === 'teste_ativo');
  const availableSubs = moduleInfo.filter(m => !activeSubs.find((s:any) => s.id === m.id));

  return (
    <div className="p-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Seu <span className="text-red-600">Ecossistema</span></h1>
          <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest mt-2">Gestão integrada: {user.companyName}</p>
        </div>
        <button onClick={() => navigate('/billing')} className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2">
          Ativar Novos Sistemas <ArrowRight size={14} />
        </button>
      </div>

      {/* Active Modules */}
      <section className="mb-16">
        <h2 className="text-xs font-black uppercase text-zinc-600 tracking-[0.3em] mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Sistemas Ativos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSubs.map((sub:any) => {
            const info = moduleInfo.find(m => m.id === sub.id);
            return (
              <div key={sub.id} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 group hover:border-red-600/30 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                  {sub.status === 'teste_ativo' && (
                    <div className="bg-red-600 text-[8px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-red-600/20">
                      <Clock size={10} /> Teste
                    </div>
                  )}
                </div>
                
                <div className="text-red-600 mb-6 group-hover:scale-110 transition-transform">{info?.icon}</div>
                <h3 className="text-2xl font-black uppercase mb-2 tracking-tight">{info?.title}</h3>
                <p className="text-zinc-500 font-bold text-[10px] uppercase mb-8 tracking-widest">{info?.desc}</p>
                
                <div className="flex gap-3">
                  <button onClick={() => navigate(`/module/${sub.id}`)} className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-200 transition-all">Acessar</button>
                  <button className="px-5 bg-zinc-800 text-zinc-400 py-4 rounded-2xl font-black uppercase text-xs hover:text-white transition-all">Resumo</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Available Modules */}
      <section>
        <h2 className="text-xs font-black uppercase text-zinc-600 tracking-[0.3em] mb-6 flex items-center gap-3">
          Disponíveis para Assinatura
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {availableSubs.map((mod:any) => (
            <div key={mod.id} className="bg-black border border-zinc-900 rounded-[2rem] p-6 opacity-60 hover:opacity-100 transition-all">
              <div className="text-zinc-600 mb-6 flex justify-between items-center">
                {mod.icon}
                <Lock size={16} />
              </div>
              <h3 className="text-lg font-black uppercase mb-1">{mod.title}</h3>
              <p className="text-zinc-600 text-[10px] font-black uppercase mb-6">{mod.desc}</p>
              <button 
                onClick={() => navigate('/billing')}
                className="w-full border border-zinc-800 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
              >
                Assinar R$ 50/mês
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
