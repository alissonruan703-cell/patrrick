
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Check, ShieldCheck, AlertCircle, ArrowLeft, Zap, Lock, Trash2 } from 'lucide-react';

const Billing: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [dbUser, setDbUser] = useState(user);

  const modules = [
    { id: 'oficina', title: 'Oficina', desc: 'Gestão completa para mecânicas' },
    { id: 'restaurante', title: 'Restaurante', desc: 'Pedidos e faturamento de mesa' },
    { id: 'orcamento', title: 'Orçamento', desc: 'Vendas via link e PDF profissional' },
    { id: 'funil', title: 'Funil', desc: 'CRM de vendas em kanban' },
    { id: 'nps', title: 'NPS', desc: 'Satisfação de clientes real' },
    { id: 'inspeção', title: 'Inspeção', desc: 'Vistorias com evidências fotográficas' },
  ];

  const updateSub = (moduleId: string, type: 'activate' | 'teste' | 'deactivate') => {
    const updated = {...dbUser};
    if (type === 'teste') {
      updated.subscriptions.push({
        id: moduleId, 
        status: 'teste_ativo', 
        testeFim: new Date(Date.now() + 7*24*60*60*1000).toISOString(), 
        testeUsado: true
      });
    } else if (type === 'activate') {
      const idx = updated.subscriptions.findIndex((s:any) => s.id === moduleId);
      if (idx > -1) updated.subscriptions[idx].status = 'assinatura_ativa';
      else updated.subscriptions.push({ id: moduleId, status: 'assinatura_ativa', testeUsado: true });
    } else {
      updated.subscriptions = updated.subscriptions.filter((s:any) => s.id !== moduleId);
    }
    
    setDbUser(updated);
    sessionStorage.setItem('crmplus_user', JSON.stringify(updated));
    localStorage.setItem(`crmplus_user_${updated.email}`, JSON.stringify(updated));
  };

  const activeCount = dbUser.subscriptions.filter((s:any) => s.status === 'assinatura_ativa').length;
  const testeCount = dbUser.subscriptions.filter((s:any) => s.status === 'teste_ativo').length;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-32">
      <div className="flex items-center gap-4 mb-12">
        <button onClick={() => navigate('/dashboard')} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 hover:text-white transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Planos e <span className="text-red-600">Assinatura</span></h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Gerencie seus acessos ativos</p>
        </div>
      </div>

      <div className="bg-zinc-900 border-2 border-red-600/20 rounded-[3rem] p-10 mb-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-600/20">
            Resumo Mensal
          </div>
          <p className="text-6xl font-black tracking-tight">R$ {activeCount * 50},00</p>
          <p className="text-zinc-500 font-bold text-xs uppercase">{activeCount} acessos pagos + {testeCount} em teste</p>
        </div>
        <button className="bg-red-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-red-600/20 hover:scale-[1.02] transition-all flex items-center gap-3">
          <CreditCard size={20} /> Pagar Fatura
        </button>
      </div>

      <div className="space-y-4">
        {modules.map(mod => {
          const sub = dbUser.subscriptions.find((s:any) => s.id === mod.id);
          const status = sub ? sub.status : 'nao_assinado';
          
          return (
            <div key={mod.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-6 text-center sm:text-left">
                <div className={`p-4 rounded-2xl ${status !== 'nao_assinado' ? 'bg-red-600/10 text-red-600' : 'bg-black text-zinc-700'}`}>
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">{mod.title}</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{mod.desc}</p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                {status === 'nao_assinado' && (
                  <div className="flex gap-2 w-full">
                    <button onClick={() => updateSub(mod.id, 'teste')} className="flex-1 bg-zinc-800 text-white px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-700 transition-all">Ativar Teste</button>
                    <button onClick={() => updateSub(mod.id, 'activate')} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all">Assinar</button>
                  </div>
                )}

                {status === 'teste_ativo' && (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-emerald-500">Teste Grátis Ativo</p>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase">Restam 7 dias</p>
                    </div>
                    <button onClick={() => updateSub(mod.id, 'activate')} className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-lg">Confirmar Assinatura</button>
                  </div>
                )}

                {status === 'assinatura_ativa' && (
                  <div className="flex items-center gap-4">
                    <p className="text-[10px] font-black uppercase text-red-600">Assinatura Ativa</p>
                    <button onClick={() => updateSub(mod.id, 'deactivate')} className="p-2.5 border border-zinc-800 rounded-xl text-zinc-600 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Billing;
