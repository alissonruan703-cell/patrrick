
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Star, ArrowLeft } from 'lucide-react';
import { AccountLicense } from '../types';

const Billing: React.FC = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountLicense | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const accountId = sessionStorage.getItem('crmplus_account_id');
    if (!accountId) {
      navigate('/login');
      return;
    }
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    const acc = accounts.find((a: any) => a.id === accountId);
    if (acc) {
      setAccount(acc);
      const today = new Date();
      const expDate = new Date(acc.expirationDate);
      setIsExpired(today > expDate);
    }
  }, [navigate]);

  const handleManualSync = (days: number) => {
    if (!account) return;
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    
    const updatedAccounts = accounts.map((a: AccountLicense) => 
      a.id === account.id ? { ...a, expirationDate: newDate.toISOString(), status: 'Ativo' } : a
    );
    
    localStorage.setItem('crmplus_accounts', JSON.stringify(updatedAccounts));
    setAccount({ ...account, expirationDate: newDate.toISOString(), status: 'Ativo' });
    setIsExpired(false);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  if (!account) return null;

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto pb-32 animate-in fade-in">
      {showConfirmation && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} /> Licença Sincronizada! Acesso Liberado.
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <h1 className="text-4xl font-black uppercase italic">Minha <span className="text-red-600">Assinatura</span></h1>
        <div className="bg-zinc-900 border border-zinc-800 px-8 py-4 rounded-3xl text-center">
          <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Status Atual</p>
          <p className={`text-xl font-black ${isExpired ? 'text-red-500' : 'text-emerald-500'}`}>{isExpired ? 'EXPIRADO' : 'ATIVO'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[4rem] space-y-8 relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">🚗 OPERACIONAL</h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase">Oficina + Restaurante + Funil</p>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Mensal', price: 'R$ 50,00', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=5e38c3f43d344df69bd3ac1fe26629f9', d: 30 },
              { label: 'Semestral', price: 'R$ 250,00', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=ff8522992a124913a0272e9547117f15', d: 180 },
              { label: 'Anual', price: 'R$ 500,00', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=ab539503db124dc49087fff0da3945b3', d: 365 }
            ].map(plan => (
              <div key={plan.label} className="p-6 bg-black border border-zinc-800 rounded-[2.5rem] flex items-center justify-between">
                <div><p className="text-[9px] font-black text-zinc-500 uppercase">{plan.label}</p><p className="text-2xl font-black text-white">{plan.price}</p></div>
                <div className="flex gap-2">
                  <button onClick={() => handleManualSync(plan.d)} className="p-4 bg-zinc-900 text-zinc-500 rounded-2xl hover:text-white"><RefreshCw size={20}/></button>
                  <a href={plan.link} target="_blank" rel="noreferrer" className="bg-red-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2">Pagar <ExternalLink size={14}/></a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[4rem] space-y-8 relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">⭐ AUXILIAR</h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase">Orçamentos + NPS + Inspeção</p>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Mensal', price: 'R$ 20,00', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=d7b64524799a446298cb248671579908', d: 30 },
              { label: 'Semestral', price: 'R$ 100,00', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=255960d9f0984649b0685cd4c32bbea8', d: 180 },
              { label: 'Anual', price: 'R$ 200,00', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=56935cf6b2b046aeb843de139260cfbf', d: 365 }
            ].map(plan => (
              <div key={plan.label} className="p-6 bg-black border border-zinc-800 rounded-[2.5rem] flex items-center justify-between">
                <div><p className="text-[9px] font-black text-zinc-500 uppercase">{plan.label}</p><p className="text-2xl font-black text-white">{plan.price}</p></div>
                <div className="flex gap-2">
                  <button onClick={() => handleManualSync(plan.d)} className="p-4 bg-zinc-900 text-zinc-500 rounded-2xl hover:text-white"><RefreshCw size={20}/></button>
                  <a href={plan.link} target="_blank" rel="noreferrer" className="bg-zinc-800 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2">Pagar <ExternalLink size={14}/></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={() => navigate('/dashboard')} className="mt-12 text-[10px] font-black uppercase text-zinc-600 hover:text-white flex items-center gap-2 mx-auto transition-all">
        <ArrowLeft size={16} /> Voltar ao Painel Geral
      </button>
    </div>
  );
};

export default Billing;
