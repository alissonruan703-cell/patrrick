
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ArrowLeft, ArrowRight, ShieldCheck, Wrench, Utensils, FileText, LayoutGrid, Heart, ClipboardCheck } from 'lucide-react';

const Auth: React.FC<{ type: 'login' | 'signup', onAuth?: (user: any) => void }> = ({ type, onAuth }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company: '', admin: '', email: '', pass: '', confirmPass: '', pin: ''
  });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [error, setError] = useState('');

  const modules = [
    { id: 'oficina', title: 'Oficina', desc: 'Gestão de O.S.', icon: <Wrench size={20} /> },
    { id: 'restaurante', title: 'Restaurante', desc: 'Controle de Pedidos', icon: <Utensils size={20} /> },
    { id: 'orcamento', title: 'Orçamento', desc: 'PDF e Links', icon: <FileText size={20} /> },
    { id: 'funil', title: 'Vendas', desc: 'Kanban Leads', icon: <LayoutGrid size={20} /> },
    { id: 'nps', title: 'NPS', desc: 'Pesquisas NPS', icon: <Heart size={20} /> },
    { id: 'inspeção', title: 'Inspeção', desc: 'Vistorias Técnicas', icon: <ClipboardCheck size={20} /> },
  ];

  const handleNext = () => {
    if (!formData.company || !formData.admin || !formData.email || !formData.pass || !formData.pin) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (formData.pass !== formData.confirmPass) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSignup = () => {
    if (selectedModules.length === 0) {
      setError('Selecione pelo menos um sistema.');
      return;
    }
    
    const newUser = {
      ...formData,
      id: Date.now().toString(),
      subscriptions: selectedModules.map(m => ({
        id: m,
        status: 'teste_ativo',
        testeFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        testeUsado: true
      })),
      settings: {
        customClientFields: [],
        tags: [],
        funnelStages: ['Aguardando', 'Em Negociação', 'Fechado'],
        restaurantCategories: ['Entradas', 'Pratos Principais', 'Bebidas'],
        inspectionTemplates: []
      },
      profiles: [
        { id: 'admin', name: formData.admin, role: 'Administrador Master', lastAccess: new Date().toISOString(), permissions: ['all'] }
      ]
    };

    localStorage.setItem(`crmplus_user_${formData.email}`, JSON.stringify(newUser));
    alert('Conta criada! Faça login agora.');
    navigate('/login');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem(`crmplus_user_${formData.email}`);
    if (stored) {
      const user = JSON.parse(stored);
      if (user.pass === formData.pass) {
        sessionStorage.setItem('crmplus_user', stored);
        if (onAuth) onAuth(user);
        navigate('/profiles');
        return;
      }
    }
    setError('Credenciais inválidas.');
  };

  if (type === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full"></div>
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 relative z-10 shadow-2xl">
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-bold uppercase text-[10px] tracking-widest">
            <ArrowLeft size={16} /> Voltar
          </Link>
          <h1 className="text-3xl font-black uppercase mb-2 tracking-tighter">Entrar na <span className="text-red-600">Conta</span></h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] mb-8">Acesse seu ecossistema CRMPLUS+</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1 ml-1">E-mail</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600 outline-none transition-all"
                placeholder="nome@empresa.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1 ml-1">Senha</label>
              <input 
                type="password"
                value={formData.pass}
                onChange={e => setFormData({...formData, pass: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold uppercase text-center">{error}</p>}
            <button type="submit" className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-xl shadow-red-600/20">
              Entrar agora
            </button>
          </form>
          <div className="mt-8 text-center">
            <Link to="/signup" className="text-xs font-black uppercase text-zinc-500 hover:text-red-500 transition-colors">Ainda não tem conta? Criar grátis</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 relative z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => step === 1 ? navigate('/') : setStep(1)} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-widest">
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex gap-2">
            <div className={`w-12 h-1.5 rounded-full ${step >= 1 ? 'bg-red-600' : 'bg-zinc-800'}`}></div>
            <div className={`w-12 h-1.5 rounded-full ${step >= 2 ? 'bg-red-600' : 'bg-zinc-800'}`}></div>
          </div>
        </div>

        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-black uppercase mb-2 tracking-tighter">Dados da <span className="text-red-600">Conta</span></h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] mb-8">Informações básicas do administrador</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1 ml-1">Nome da Empresa</label>
                <input 
                  type="text" 
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600 outline-none transition-all"
                  placeholder="Ex: Oficina do João"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1 ml-1">Seu Nome</label>
                <input 
                  type="text" 
                  value={formData.admin}
                  onChange={e => setFormData({...formData, admin: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1 ml-1">E-mail de acesso</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1 ml-1">Senha</label>
                <input 
                  type="password"
                  value={formData.pass}
                  onChange={e => setFormData({...formData, pass: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1 ml-1">Confirmar Senha</label>
                <input 
                  type="password"
                  value={formData.confirmPass}
                  onChange={e => setFormData({...formData, confirmPass: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600 outline-none transition-all"
                />
              </div>
              <div className="col-span-full">
                <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1 ml-1">PIN de Segurança (4 dígitos)</label>
                <input 
                  type="text"
                  maxLength={4}
                  value={formData.pin}
                  onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-xl font-black tracking-[1em] text-center focus:border-red-600 outline-none transition-all"
                  placeholder="0000"
                />
                <p className="text-[9px] text-zinc-600 font-bold mt-2 uppercase">Usado para gerenciar perfis e ações críticas.</p>
              </div>
            </div>
            
            {error && <p className="text-red-500 text-xs font-bold uppercase text-center mt-4">{error}</p>}
            
            <button onClick={handleNext} className="w-full mt-8 bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
              Próximo passo <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-black uppercase mb-2 tracking-tighter">Escolha seus <span className="text-red-600">Sistemas</span></h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] mb-8">Cada sistema custa R$ 50/mês. Ative o Teste agora.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modules.map(mod => (
                <div 
                  key={mod.id} 
                  onClick={() => setSelectedModules(prev => prev.includes(mod.id) ? prev.filter(x => x !== mod.id) : [...prev, mod.id])}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${selectedModules.includes(mod.id) ? 'bg-red-600/10 border-red-600' : 'bg-black border-zinc-800'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={selectedModules.includes(mod.id) ? 'text-red-600' : 'text-zinc-600'}>{mod.icon}</div>
                    <div>
                      <p className="text-xs font-black uppercase leading-tight">{mod.title}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">7 dias grátis</p>
                    </div>
                  </div>
                  {selectedModules.includes(mod.id) && <Check size={18} className="text-red-600" />}
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-black border border-zinc-800 rounded-3xl space-y-3">
              <div className="flex justify-between text-xs font-black uppercase">
                <span className="text-zinc-500">Acessos selecionados:</span>
                <span>{selectedModules.length}</span>
              </div>
              <div className="flex justify-between text-xs font-black uppercase">
                <span className="text-zinc-500">Total mensal:</span>
                <span className="text-red-600">R$ {selectedModules.length * 50},00</span>
              </div>
              <div className="flex justify-between text-xs font-black uppercase pt-3 border-t border-zinc-900">
                <span className="text-zinc-500">Hoje você paga:</span>
                <span className="text-emerald-500">R$ 0,00 (TESTE)</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold uppercase text-center mt-4">{error}</p>}

            <button onClick={handleSignup} className="w-full mt-8 bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all">
              Criar minha conta e começar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
