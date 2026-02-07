
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, ShieldCheck, Zap, Calendar, 
  Check, Plus, X, Star, ZapOff, RefreshCw
} from 'lucide-react';
import { AccountLicense, ModuleId } from '../types';

const SubscriptionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountLicense | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accountId = sessionStorage.getItem('crmplus_account_id') || localStorage.getItem('crmplus_last_account_id');
    if (!accountId) {
      navigate('/login');
      return;
    }
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    const activeAcc = accounts.find((a: any) => a.id === accountId);
    if (activeAcc) {
      setAccount(activeAcc);
      localStorage.setItem('crmplus_last_account_id', accountId); // Backup de sessão
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleUpgrade = (moduleId: ModuleId, days: number) => {
    if (!account) return;
    setLoading(true);
    
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    const currentModules: ModuleId[] = account.allowedModules || [];
    const newModules: ModuleId[] = currentModules.includes(moduleId) ? currentModules : [...currentModules, moduleId];
    
    // Atualiza data de expiração
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);

    const updatedAccounts = accounts.map((a: AccountLicense) => 
      a.id === account.id ? { ...a, allowedModules: newModules, expirationDate: newDate.toISOString(), status: 'Ativo' } : a
    );
    
    localStorage.setItem('crmplus_accounts', JSON.stringify(updatedAccounts));
    setAccount({ ...account, allowedModules: newModules, expirationDate: newDate.toISOString(), status: 'Ativo' });
    
    setTimeout(() => {
      setLoading(false);
      setShowUpgradeModal(false);
    }, 800);
  };

  const pricingData = [
    {
      id: 'oficina',
      name: 'Oficina Pro+',
      icon: <Zap className="text-red-600" size={24} />,
      plans: [
        { label: 'Mensal', price: 'R$ 50,00', days: 30, link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=5e38c3f43d344df69bd3ac1fe26629f9' },
        { label: 'Semestral', price: 'R$ 250,00', days: 180, link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=ff8522992a124913a0272e9547117f15' },
        { label: 'Anual', price: 'R$ 500,00', days: 365, link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=ab539503db124dc49087fff0da3945b3' }
      ]
    },
    {
      id: 'orcamento',
      name: 'Vendas Plus',
      icon: <Star className="text-amber-500" size={24} />,
      plans: [
        { label: 'Mensal', price: 'R$ 20,00', days: 30, link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=d7b64524799a446298cb248671579908' },
        { label: 'Semestral', price: 'R$ 100,00', days: 180, link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=255960d9f0984649b0685cd4c32bbea8' },
        { label: 'Anual', price: 'R$ 200,00', days: 365, link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=56935cf6b2b046aeb843de139260cfbf' }
      ]
    }
  ];

  if (!account) return null;

  const isExpired = new Date() > new Date(account.expirationDate);

  return (
    <div className="pt-32 px-6 lg:px-12 max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1" /> Voltar ao Painel
          </button>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Minha <span className="text-red-600">Licença</span></h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] flex items-center gap-8 shadow-2xl">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</p>
            <p className={`text-xl font-black ${isExpired ? 'text-red-500' : 'text-emerald-500'}`}>{isExpired ? 'EXPIRADO' : 'ATIVO'}</p>
          </div>
          <div className="w-px h-10 bg-zinc-800"></div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Vencimento</p>
            <p className="text-xl font-black text-white">{new Date(account.expirationDate).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {pricingData.map((module) => {
          const isActive = account.allowedModules.includes(module.id as ModuleId);
          return (
            <div key={module.id} className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 lg:p-14 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">{module.icon}</div>
              
              <div className="flex flex-col lg:flex-row justify-between gap-12">
                <div className="space-y-6 max-w-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-black rounded-2xl border border-zinc-800">{module.icon}</div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{module.name}</h2>
                  </div>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed">Assine este módulo para liberar as funcionalidades específicas do seu segmento empresarial.</p>
                  {isActive ? (
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                      <Check size={14} /> Módulo Ativado
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                      <ZapOff size={14} /> Aguardando Ativação
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                  {module.plans.map((plan) => (
                    <div key={plan.label} className="bg-black border border-zinc-800 p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-red-600 transition-colors">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{plan.label}</p>
                        <p className="text-3xl font-black text-white tracking-tighter">{plan.price}</p>
                      </div>
                      <div className="space-y-3">
                        <a 
                          href={plan.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/10"
                        >
                          Assinar <CreditCard size={14} />
                        </a>
                        <button 
                          onClick={() => handleUpgrade(module.id as ModuleId, plan.days)}
                          disabled={loading}
                          className="w-full py-4 bg-zinc-900 text-zinc-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white flex items-center justify-center gap-2 border border-zinc-800"
                        >
                          {loading ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />} 
                          Sincronizar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] text-center space-y-6">
        <ShieldCheck size={48} className="text-zinc-700 mx-auto" />
        <p className="text-xs text-zinc-500 font-black uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
          O faturamento é processado pelo Mercado Pago. Se você já pagou e o sistema não atualizou, utilize o botão de sincronização para liberar o acesso imediatamente.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
