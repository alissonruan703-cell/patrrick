
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Added X to the import list
import { ArrowLeft, CreditCard, ShieldCheck, Zap, Calendar, Rocket, FileText, Utensils, Check, Plus, AlertCircle, TrendingUp, X } from 'lucide-react';
import { AccountLicense, ModuleId } from '../types';

const SubscriptionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountLicense | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const accountId = sessionStorage.getItem('crmplus_account_id');
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    const activeAcc = accounts.find((a: any) => a.id === accountId);
    setAccount(activeAcc);
  }, []);

  const handleUpgrade = (moduleId: ModuleId) => {
    if (!account) return;
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    // Fix: cast the result of spread to ModuleId[]
    const updatedModules: ModuleId[] = [...account.allowedModules, moduleId];
    
    const updatedAccounts = accounts.map((a: AccountLicense) => 
      a.id === account.id ? { ...a, allowedModules: updatedModules } : a
    );
    
    localStorage.setItem('crmplus_accounts', JSON.stringify(updatedAccounts));
    setAccount({ ...account, allowedModules: updatedModules });
    setShowUpgradeModal(false);
  };

  const modulesData: { id: ModuleId; name: string; icon: React.ReactNode; price: string }[] = [
    { id: 'oficina', name: 'Oficina Pro+', icon: <Rocket size={20}/>, price: 'R$ 89,90/mês' },
    { id: 'orcamento', name: 'Vendas Plus', icon: <FileText size={20}/>, price: 'R$ 59,90/mês' },
    { id: 'restaurante', name: 'Gastro Hub', icon: <Utensils size={20}/>, price: 'R$ 79,90/mês' },
  ];

  if (!account) return null;

  return (
    <div className="pt-32 px-6 lg:px-12 max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
           <button onClick={() => navigate('/config')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group">
             <ArrowLeft size={16} className="group-hover:-translate-x-1" /> Configurações
           </button>
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
             Gestão de <span className="text-cyan-400">Assinatura</span> <CreditCard className="text-cyan-400" size={32} />
           </h1>
           <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[9px] bg-white/5 px-3 py-1 rounded w-fit">Controle e Expansão do seu Ecossistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card de Status */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3rem] backdrop-blur-3xl space-y-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full group-hover:bg-cyan-500/10 transition-all"></div>
            <div className="space-y-2 relative z-10">
               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${account.status === 'Ativo' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>Plano {account.status}</span>
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Sua Conta</h3>
            </div>
            <div className="space-y-6 relative z-10">
               <div className="flex items-start gap-4">
                  <Calendar size={20} className="text-cyan-400 mt-1"/>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Renovação</p>
                     <p className="text-lg font-black text-white">{new Date(account.expirationDate).toLocaleDateString('pt-BR')}</p>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <ShieldCheck size={20} className="text-cyan-400 mt-1"/>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Segurança</p>
                     <p className="text-lg font-black text-white">Ecossistema Criptografado</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Módulos Ativos */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/[0.02] border border-white/10 p-10 lg:p-14 rounded-[3.5rem] backdrop-blur-3xl space-y-10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4"><Zap size={24} className="text-cyan-400"/> Sistemas <span className="text-cyan-400">Ativados</span></h3>
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="px-6 py-3 bg-cyan-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Plus size={16} strokeWidth={3} /> Expandir Módulos
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {modulesData.map(mod => {
                const isActive = account.allowedModules.includes(mod.id);
                return (
                  <div key={mod.id} className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between ${isActive ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-black/40 border-white/5 opacity-40'}`}>
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-xl ${isActive ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-slate-600'}`}>{mod.icon}</div>
                       <div>
                          <p className="text-[11px] font-black text-white uppercase tracking-tight">{mod.name}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{isActive ? 'Serviço Ativo' : 'Não Contratado'}</p>
                       </div>
                    </div>
                    {isActive && <Check size={18} className="text-cyan-500" />}
                  </div>
                );
              })}
            </div>

            <div className="p-8 bg-blue-600/5 border border-blue-500/10 rounded-3xl flex items-center gap-6 relative z-10">
               <TrendingUp size={32} className="text-blue-400 shrink-0" />
               <p className="text-[11px] text-slate-400 leading-relaxed uppercase font-bold tracking-tight">
                 Ao ativar novos módulos, seu Ecossistema CRMPlus+ se torna ainda mais robusto, centralizando dados de diferentes setores para decisões estratégicas.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Upgrade */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-3xl bg-[#0a0a0a] border border-white/10 p-10 lg:p-14 rounded-[4rem] space-y-12 shadow-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full"></div>
              <button onClick={() => setShowUpgradeModal(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
              
              <div className="text-center space-y-4">
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Expandir meu <span className="text-cyan-400">Ecossistema</span></h2>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Selecione um novo módulo para ativar agora</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {modulesData.filter(m => !account.allowedModules.includes(m.id)).map(mod => (
                   <div key={mod.id} className="p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 group hover:border-cyan-500/40 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform">{mod.icon}</div>
                         <div>
                            <p className="text-lg font-black text-white uppercase tracking-tight">{mod.name}</p>
                            <p className="text-[10px] font-bold text-cyan-400/60 uppercase">{mod.price}</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleUpgrade(mod.id)}
                        className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl hover:bg-cyan-500 transition-all"
                      >
                        Ativar Agora
                      </button>
                   </div>
                 ))}
                 {modulesData.filter(m => !account.allowedModules.includes(m.id)).length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-30 space-y-4">
                       <Check size={48} className="mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Você já possui todos os módulos disponíveis!</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
