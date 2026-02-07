
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ExternalLink, RefreshCw, CheckCircle2, ShieldCheck, Zap, ArrowLeft, Star } from 'lucide-react';
import { AccountLicense, PlanOption } from '../types';

const Billing: React.FC = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountLicense | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accountId = sessionStorage.getItem('crmplus_account_id') || localStorage.getItem('crmplus_last_account_id');
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    const acc = accounts.find((a: any) => a.id === accountId);
    if (acc) {
      setAccount(acc);
      setIsExpired(new Date() > new Date(acc.expirationDate));
    }
  }, []);

  const plans: PlanOption[] = [
    { label: 'Mensal', price: 'R$ 50,00', days: 30, link: '#' },
    { label: 'Semestral', price: 'R$ 250,00', days: 180, link: '#' },
    { label: 'Anual', price: 'R$ 480,00', days: 365, link: '#' }
  ];

  const handleSync = (plan: PlanOption) => {
    if (!account) return;
    setLoading(true);
    
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + plan.days);
    
    const updated = accounts.map((a: AccountLicense) => 
      a.id === account.id ? { ...a, expirationDate: newDate.toISOString(), status: 'Ativo' } : a
    );
    
    localStorage.setItem('crmplus_accounts', JSON.stringify(updated));
    setAccount({ ...account, expirationDate: newDate.toISOString(), status: 'Ativo' });
    setIsExpired(false);
    
    setTimeout(() => {
      setLoading(false);
      alert('Assinatura ' + plan.label + ' ativada com sucesso!');
    }, 800);
  };

  if (!account) return null;

  return (
    <div className="p-12 max-w-5xl mx-auto space-y-12 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Minha <span className="text-red-600">Assinatura</span></h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">Gerencie seu plano e acesso ao ecossistema</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-center min-w-[200px]">
          <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Status da Licença</p>
          <p className={`text-xl font-black ${isExpired ? 'text-red-500' : 'text-emerald-500'}`}>
            {isExpired ? 'EXPIRADA' : 'ATIVA'}
          </p>
          <p className="text-[10px] font-bold text-zinc-600 mt-2">Vence em: {new Date(account.expirationDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.label} className={`bg-zinc-900 border ${plan.label === 'Anual' ? 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.1)]' : 'border-zinc-800'} p-10 rounded-[3rem] space-y-8 flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all`}>
            {plan.label === 'Anual' && <div className="absolute top-4 right-4 bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Melhor Valor</div>}
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{plan.label}</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">{plan.price}</h3>
            </div>
            <ul className="space-y-3 flex-1">
              <li className="flex items-center gap-3 text-xs font-bold text-zinc-400"><CheckCircle2 size={16} className="text-red-600"/> Acesso total à Oficina</li>
              <li className="flex items-center gap-3 text-xs font-bold text-zinc-400"><CheckCircle2 size={16} className="text-red-600"/> Orçamentos via link</li>
              <li className="flex items-center gap-3 text-xs font-bold text-zinc-400"><CheckCircle2 size={16} className="text-red-600"/> Suporte Prioritário</li>
            </ul>
            <button 
              onClick={() => handleSync(plan)}
              disabled={loading}
              className="w-full py-5 bg-red-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <CreditCard size={16} />}
              Assinar {plan.label}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] flex items-center gap-6">
        <ShieldCheck size={40} className="text-zinc-700" />
        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-relaxed">
          Pagamento processado via Mercado Pago. O acesso é liberado instantaneamente após a confirmação. 
          Se você já pagou e o sistema não liberou, clique no botão de sincronizar no plano correspondente.
        </p>
      </div>
    </div>
  );
};

export default Billing;
