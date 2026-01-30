
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck, Zap, Calendar, Rocket, FileText, Utensils, Check, Plus, AlertCircle, TrendingUp, X } from 'lucide-react';
import { AccountLicense } from '../types';

const SubscriptionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountLicense | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const accountId = sessionStorage.getItem('crmplus_account_id');
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    setAccount(accounts.find((a: any) => a.id === accountId));
  }, []);

  const handleUpgrade = (moduleId: string) => {
    if (!account) return;
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    const updatedModules = [...account.allowedModules, moduleId];
    const updatedAccounts = accounts.map((a: AccountLicense) => a.id === account.id ? { ...a, allowedModules: updatedModules } : a);
    localStorage.setItem('crmplus_accounts', JSON.stringify(updatedAccounts));
    setAccount({ ...account, allowedModules: updatedModules });
    setShowUpgradeModal(false);
  };

  const modulesData = [{ id: 'oficina', name: 'Oficina Pro+', icon: <Rocket size={20}/>, price: 'R$ 89,90/mês' }, { id: 'orcamento', name: 'Vendas Plus', icon: <FileText size={20}/>, price: 'R$ 59,90/mês' }, { id: 'restaurante', name: 'Gastro Hub', icon: <Utensils size={20}/>, price: 'R$ 79,90/mês' }];
  if (!account) return null;

  return (
    <div className="pt-32 px-6 lg:px-12 max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
           <button onClick={() => navigate('/config')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group"><ArrowLeft size={16} /> Configurações</button>
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">Gestão de <span className="text-cyan-400">Assinatura</span> <CreditCard size={32} /></h1>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1"><div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3rem] space-y-10 shadow-2xl"><h3 className="text-2xl font-black text-white uppercase">Sua Conta</h3><div className="space-y-6"><div className="flex gap-4"><Calendar size={20} className="text-cyan-400"/><p className="text-lg font-black text-white">{new Date(account.expirationDate).toLocaleDateString('pt-BR')}</p></div></div></div></div>
        <div className="lg:col-span-2"><div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3.5rem] space-y-10 shadow-2xl"><div className="flex justify-between items-center"><h3 className="text-2xl font-black text-white uppercase flex items-center gap-4"><Zap size={24} className="text-cyan-400"/> Sistemas <span className="text-cyan-400">Ativados</span></h3><button onClick={() => setShowUpgradeModal(true)} className="px-6 py-3 bg-cyan-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2"><Plus size={16}/> Expandir</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{modulesData.map(mod => { const isActive = account.allowedModules.includes(mod.id); return (<div key={mod.id} className={`p-6 rounded-[2rem] border flex items-center justify-between ${isActive ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-black/40 border-white/5 opacity-40'}`}><div className="flex gap-4"><div className={`p-3 rounded-xl ${isActive ? 'bg-cyan-500 text-black' : 'bg-white/5'}`}>{mod.icon}</div><div><p className="text-[11px] font-black text-white uppercase">{mod.name}</p></div></div>{isActive && <Check size={18} className="text-cyan-500" />}</div>); })}</div></div></div>
      </div>
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-3xl bg-[#0a0a0a] border border-white/10 p-10 lg:p-14 rounded-[4rem] space-y-12 shadow-3xl relative overflow-hidden">
              <button onClick={() => setShowUpgradeModal(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white"><X size={24}/></button>
              <div className="text-center"><h2 className="text-3xl font-black text-white uppercase tracking-tighter">Expandir meu <span className="text-cyan-400">Ecossistema</span></h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{modulesData.filter(m => !account.allowedModules.includes(m.id)).map(mod => (<div key={mod.id} className="p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 group hover:border-cyan-500/40 transition-all"><div className="flex gap-4"><div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400">{mod.icon}</div><div><p className="text-lg font-black text-white uppercase">{mod.name}</p><p className="text-[10px] font-bold text-cyan-400/60 uppercase">{mod.price}</p></div></div><button onClick={() => handleUpgrade(mod.id)} className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl hover:bg-cyan-500 transition-all">Ativar Agora</button></div>))}</div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
