
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Star, ArrowLeft
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

  const handleManualSync = (days: number) => {
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
    }, 2500);
  };

  if (!account) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-zinc-600 font-black uppercase tracking-widest text-center gap-6">
      <AlertTriangle size={64} className="opacity-20 text-red-600" />
      <p>Sessão de faturamento expirada.</p>
      <button onClick={() => navigate('/login')} className="bg-red-600 text-white px-8 py-4 rounded-xl">Ir para Login</button>
    </div>
  );

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto pb-32 animate-in fade-in">
      {showConfirmation && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} /> Licença Sincronizada com Sucesso!
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none italic text-white">Minha <span className="text-red-600">Assinatura</span></h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Central de pagamentos do ecossistema CRMPLUS+</p>
        </div>
        {!isExpired && (
          <div className="bg-zinc-900 border border-zinc-800 px-8 py-5 rounded-3xl text-center shadow-lg">
            <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Validade Ativa</p>
            <p className="text-2xl font-black text-white font-mono">{new Date(account.expirationDate).toLocaleDateString('pt-BR')}</p>
          </div>
        )}
      </div>

      {isExpired && (
        <div className="mb-12 p-10 bg-red-600/10 border border-red-600/20 rounded-[3rem] flex flex-col md:flex-row items-center gap-10 shadow-2xl">
          <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-xl shrink-0 animate-pulse">
            <AlertTriangle size={56} />
          </div>
          <div className="space-y-3 text-center md:text-left">
            <h3 className="text-3xl font-black uppercase text-red-600 tracking-tight">Licença Vencida</h3>
            <p className="text-zinc-400 text-sm font-black uppercase tracking-tighter leading-relaxed max-w-2xl">
              Sua licença expirou ou você acaba de criar sua conta. Para liberar o acesso aos módulos de Oficina, Restaurante e Funil, selecione um plano abaixo.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* GRUPO 1: Premium (Oficina, Restaurante, Funil) */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[4rem] space-y-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={100} className="text-red-600" /></div>
          <div className="space-y-2">
            <div className="flex gap-3 text-4xl mb-4">🚗🍽️📊</div>
            <h2 className="text-3xl font-black uppercase text-white tracking-tighter">Sistemas Operacionais</h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic leading-relaxed">Inclui: Oficina, Restaurante e Funil de Vendas</p>
          </div>
          
          <div className="space-y-5">
            {[
              { label: 'Plano Mensal', price: 'R$ 50,00', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=5e38c3f43d344df69bd3ac1fe26629f9', days: 30 },
              { label: 'Plano Semestral', price: 'R$ 250,00', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=ff8522992a124913a0272e9547117f15', days: 180, popular: true },
              { label: 'Plano Anual', price: 'R$ 500,00', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=ab539503db124dc49087fff0da3945b3', days: 365, best: true }
            ].map(plan => (
              <div key={plan.label} className={`p-8 rounded-[2.5rem] border flex items-center justify-between transition-all hover:scale-[1.02] ${plan.best ? 'bg-red-600 border-red-500 shadow-xl shadow-red-600/20' : plan.popular ? 'bg-zinc-800 border-zinc-700' : 'bg-black border-zinc-800'}`}>
                <div className="space-y-1">
                  <p className={`text-[10px] font-black uppercase ${plan.best ? 'text-white/80' : 'text-zinc-500'}`}>{plan.label}</p>
                  <p className="text-3xl font-black text-white">{plan.price}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleManualSync(plan.days)} className={`p-4 rounded-2xl transition-all ${plan.best ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`} title="Sincronizar Manualmente">
                    <RefreshCw size={20} />
                  </button>
                  <a href={plan.link} target="_blank" rel="noreferrer" className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 ${plan.best ? 'bg-white text-red-600' : 'bg-red-600 text-white shadow-lg'}`}>
                    Assinar <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRUPO 2: Auxiliar (Orçamentos, NPS, Inspeção) */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[4rem] space-y-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Star size={100} className="text-zinc-600" /></div>
          <div className="space-y-2">
            <div className="flex gap-3 text-4xl mb-4">🧾⭐🔍</div>
            <h2 className="text-3xl font-black uppercase text-white tracking-tighter">Sistemas Auxiliares</h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic leading-relaxed">Inclui: Orçamentos, NPS e Inspeção</p>
          </div>
          
          <div className="space-y-5">
            {[
              { label: 'Plano Mensal', price: 'R$ 20,00', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=d7b64524799a446298cb248671579908', days: 30 },
              { label: 'Plano Semestral', price: 'R$ 100,00', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=255960d9f0984649b0685cd4c32bbea8', days: 180 },
              { label: 'Plano Anual', price: 'R$ 200,00', link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=56935cf6b2b046aeb843de139260cfbf', days: 365, best: true }
            ].map(plan => (
              <div key={plan.label} className={`p-8 rounded-[2.5rem] border bg-black flex items-center justify-between transition-all hover:scale-[1.02] ${plan.best ? 'border-zinc-500 shadow-xl shadow-white/5' : 'border-zinc-800'}`}>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-zinc-500">{plan.label}</p>
                  <p className="text-3xl font-black text-white">{plan.price}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleManualSync(plan.days)} className="p-4 bg-zinc-900 text-zinc-500 rounded-2xl hover:text-white transition-all">
                    <RefreshCw size={20} />
                  </button>
                  <a href={plan.link} target="_blank" rel="noreferrer" className="px-8 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-zinc-700">
                    Assinar <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20 p-16 bg-white/[0.02] border border-white/5 rounded-[4rem] text-center space-y-10 shadow-inner">
        <ShieldCheck size={64} className="text-zinc-700 mx-auto" />
        <div className="max-w-2xl mx-auto space-y-5">
          <h3 className="text-2xl font-black uppercase tracking-widest text-white">Transação Segura</h3>
          <p className="text-sm text-zinc-500 font-black uppercase tracking-tighter leading-relaxed">
            Sua licença é ativada em tempo real após a confirmação do Mercado Pago. Para ativações imediatas em assinaturas recorrentes via Cartão de Crédito, utilize o botão de sincronização se o sistema não atualizar sozinho.
          </p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-[11px] font-black uppercase text-zinc-600 hover:text-white transition-all flex items-center justify-center gap-2 mx-auto tracking-widest border-b border-transparent hover:border-white">
          <ArrowLeft size={16} /> Retornar ao Painel
        </button>
      </div>
    </div>
  );
};

export default Billing;
