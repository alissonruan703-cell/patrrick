
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Star, Search, ArrowRight 
} from 'lucide-react';
import { AccountLicense } from '../types';

const Billing: React.FC = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountLicense | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const loadAccount = () => {
    const accountId = sessionStorage.getItem('crmplus_account_id');
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    const acc = accounts.find((a: any) => a.id === accountId);
    if (acc) {
      setAccount(acc);
      const today = new Date();
      const expDate = new Date(acc.expirationDate);
      setIsExpired(today > expDate);
    }
  };

  useEffect(() => {
    loadAccount();
    window.addEventListener('storage', loadAccount);
    return () => window.removeEventListener('storage', loadAccount);
  }, []);

  const handleSimulatePayment = (days: number) => {
    if (!account) return;
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    
    const updatedAccounts = accounts.map((a: AccountLicense) => 
      a.id === account.id ? { ...a, expirationDate: newDate.toISOString(), status: 'Ativo' } : a
    );
    
    localStorage.setItem('crmplus_accounts', JSON.stringify(updatedAccounts));
    window.dispatchEvent(new Event('storage'));
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      navigate('/dashboard');
    }, 3000);
  };

  const systemsGroup1 = [
    { name: 'Oficina', icon: '🚗' },
    { name: 'Restaurante', icon: '🍽️' },
    { name: 'Funil de Vendas', icon: '📊' }
  ];

  const systemsGroup2 = [
    { name: 'Orçamentos', icon: '🧾' },
    { name: 'NPS', icon: '⭐' },
    { name: 'Inspeção', icon: '🔍' }
  ];

  if (!account) return (
    <div className="min-h-screen flex items-center justify-center p-10 text-zinc-600 font-black uppercase tracking-widest">
      Sessão Inválida. Faça login novamente.
    </div>
  );

  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto pb-32 animate-in fade-in">
      {showConfirmation && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} /> Pagamento Identificado! Acesso Liberado.
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
           <div className={`p-4 rounded-[1.5rem] border-2 shadow-xl ${isExpired ? 'bg-red-600/10 border-red-600 text-red-600 animate-pulse' : 'bg-emerald-600/10 border-emerald-600 text-emerald-600'}`}>
              <CreditCard size={32} />
           </div>
           <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Sua <span className="text-red-600">Assinatura</span></h1>
              <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Status: {isExpired ? 'EXPIRADA / BLOQUEADA' : 'CONTA ATIVA'}</p>
           </div>
        </div>
        {!isExpired && (
          <div className="bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl text-center min-w-[200px]">
             <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Próxima Renovação</p>
             <p className="text-xl font-black text-white">{new Date(account.expirationDate).toLocaleDateString('pt-BR')}</p>
          </div>
        )}
      </div>

      {isExpired && (
        <div className="mb-12 p-8 bg-red-600/10 border border-red-600/20 rounded-[2.5rem] flex items-center gap-6 shadow-2xl">
           <AlertTriangle size={48} className="text-red-600 shrink-0" />
           <div className="space-y-1">
              <h3 className="text-xl font-black uppercase text-red-600">Acesso Bloqueado</h3>
              <p className="text-zinc-400 text-sm font-medium">Sua licença expirou ou o teste gratuito terminou. Selecione um dos planos abaixo para liberar os sistemas imediatamente.</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* GRUPO 1: Premium */}
        <div className="space-y-8">
           <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[3rem] space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={40} className="text-red-600" /></div>
              <div className="flex items-center gap-3">
                 <div className="flex gap-2">
                    {systemsGroup1.map(s => <span key={s.name} title={s.name} className="text-2xl">{s.icon}</span>)}
                 </div>
                 <h2 className="text-xl font-black uppercase text-white tracking-tighter">Sistemas Operacionais</h2>
              </div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Oficina, Restaurante e Funil</p>
              
              <div className="space-y-3 pt-4">
                 {[
                   { label: 'Plano Mensal', price: 'R$ 50,00', color: 'bg-zinc-800', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=5e38c3f43d344df69bd3ac1fe26629f9', days: 30 },
                   { label: 'Plano Semestral', price: 'R$ 250,00', color: 'bg-red-600/10 border-red-600/20 text-red-600', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=ff8522992a124913a0272e9547117f15', days: 180 },
                   { label: 'Plano Anual', price: 'R$ 500,00', color: 'bg-red-600 text-white', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=ab539503db124dc49087fff0da3945b3', days: 365, best: true }
                 ].map(plan => (
                   <div key={plan.label} className={`p-6 rounded-2xl border flex items-center justify-between group transition-all hover:scale-[1.02] ${plan.best ? 'border-red-600 shadow-xl shadow-red-600/10' : 'border-zinc-800'}`}>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <p className="text-xs font-black uppercase text-white">{plan.label}</p>
                            {plan.best && <span className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[7px] font-black">MELHOR VALOR</span>}
                         </div>
                         <p className="text-2xl font-black">{plan.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSimulatePayment(plan.days)} className="p-3 bg-white/5 text-zinc-700 rounded-xl hover:text-white transition-colors" title="Validar Manual">
                           <RefreshCw size={18} />
                        </button>
                        <a href={plan.link} target="_blank" rel="noreferrer" className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 ${plan.color}`}>
                           Pagar <ExternalLink size={14} />
                        </a>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* GRUPO 2: Basic */}
        <div className="space-y-8">
           <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[3rem] space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Star size={40} className="text-zinc-600" /></div>
              <div className="flex items-center gap-3">
                 <div className="flex gap-2">
                    {systemsGroup2.map(s => <span key={s.name} title={s.name} className="text-2xl">{s.icon}</span>)}
                 </div>
                 <h2 className="text-xl font-black uppercase text-white tracking-tighter">Sistemas Auxiliares</h2>
              </div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Orçamentos, NPS e Inspeção</p>
              
              <div className="space-y-3 pt-4">
                 {[
                   { label: 'Plano Mensal', price: 'R$ 20,00', color: 'bg-zinc-800', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=d7b64524799a446298cb248671579908', days: 30 },
                   { label: 'Plano Semestral', price: 'R$ 100,00', color: 'bg-zinc-800', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=255960d9f0984649b0685cd4c32bbea8', days: 180 },
                   { label: 'Plano Anual', price: 'R$ 200,00', color: 'bg-zinc-800', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=56935cf6b2b046aeb843de139260cfbf', days: 365 }
                 ].map(plan => (
                   <div key={plan.label} className="p-6 rounded-2xl border border-zinc-800 flex items-center justify-between group transition-all hover:scale-[1.02]">
                      <div className="space-y-1">
                         <p className="text-xs font-black uppercase text-white">{plan.label}</p>
                         <p className="text-2xl font-black">{plan.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSimulatePayment(plan.days)} className="p-3 bg-white/5 text-zinc-700 rounded-xl hover:text-white transition-colors" title="Validar Manual">
                           <RefreshCw size={18} />
                        </button>
                        <a href={plan.link} target="_blank" rel="noreferrer" className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 ${plan.color}`}>
                           Pagar <ExternalLink size={14} />
                        </a>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="mt-12 p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] text-center space-y-6">
         <ShieldCheck size={48} className="text-zinc-700 mx-auto" />
         <div className="max-w-xl mx-auto space-y-4">
            <h3 className="text-xl font-black uppercase">Pagamento Seguro Mercado Pago</h3>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">Utilizamos a infraestrutura oficial do Mercado Pago. O acesso é liberado em tempo real após a compensação. Caso seu acesso não seja liberado em 5 minutos, utilize o botão de sincronização manual ao lado de cada plano.</p>
         </div>
      </div>
    </div>
  );
};

export default Billing;
