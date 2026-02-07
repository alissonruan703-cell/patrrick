
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Rocket, Lock, Mail, ArrowLeft, Zap, ShieldCheck, User, Building2, Key, Check, Eye, EyeOff
} from 'lucide-react';
import { UserProfile, AccountLicense } from '../types';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/9.x/personas/svg?seed=1',
  'https://api.dicebear.com/9.x/personas/svg?seed=2',
  'https://api.dicebear.com/9.x/personas/svg?seed=3',
];

export const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = localStorage.getItem('crmplus_accounts');
    const accounts: AccountLicense[] = saved ? JSON.parse(saved) : [];
    const account = accounts.find(a => a.username === user && a.password === pass);
    
    if (account) {
      if (account.status === 'Bloqueado') {
        setError('Acesso suspenso administrativamente.');
        return;
      }
      sessionStorage.setItem('crmplus_account_auth', 'true');
      sessionStorage.setItem('crmplus_account_id', account.id);
      sessionStorage.setItem('crmplus_user', JSON.stringify({ company: account.companyName, id: account.id }));
      navigate('/profiles');
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">CRM<span className="text-red-600 text-6xl">Plus+</span></h1>
          <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">Acesso ao Ecossistema</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-black uppercase text-[10px] tracking-widest">
            <ArrowLeft size={16} /> Voltar ao Início
          </button>

          {error && <div className="p-4 bg-red-600/15 border border-red-500/30 text-red-500 text-[10px] font-black uppercase text-center rounded-2xl mb-6 animate-pulse">{error}</div>}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Usuário de Acesso</label>
              <input required value={user} onChange={e => setUser(e.target.value)} className="w-full bg-black border border-zinc-800 px-6 py-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold shadow-inner" placeholder="Digite seu usuário" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Senha Privada</label>
              <input required type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-black border border-zinc-800 px-6 py-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold shadow-inner" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full py-5 bg-red-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl hover:bg-red-700 transition-all shadow-red-600/20 active:scale-95">Entrar no Sistema</button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
            <Link to="/signup" className="text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors">Ativar Nova Licença</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    companyName: '', 
    username: '', 
    password: '', 
    confirmPassword: '', 
    pin: '' 
  });
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }
    if (formData.pin.length !== 4) {
      setError('O PIN de segurança deve ter 4 dígitos.');
      return;
    }

    const accountId = Date.now().toString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const newAccount: AccountLicense = {
      id: accountId, 
      fullName: formData.fullName, 
      email: formData.email, 
      companyName: formData.companyName, 
      username: formData.username, 
      password: formData.password, 
      status: 'Ativo', 
      createdAt: new Date().toISOString(), 
      expirationDate: yesterday.toISOString(), // NASCE EXPIRADO PARA FORÇAR PAGAMENTO
      allowedModules: ['oficina', 'orcamento', 'restaurante', 'config']
    };

    const masterProfile: UserProfile = {
      id: 'admin', 
      name: formData.fullName.split(' ')[0], 
      avatar: AVATAR_OPTIONS[0], 
      pin: formData.pin, 
      modules: ['oficina', 'orcamento', 'restaurante', 'config'], 
      actions: ['create_os', 'edit_os', 'delete_os', 'view_history', 'manage_profiles']
    };

    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    localStorage.setItem('crmplus_accounts', JSON.stringify([...accounts, newAccount]));
    localStorage.setItem(`crmplus_profiles_${accountId}`, JSON.stringify([masterProfile]));
    
    sessionStorage.setItem('crmplus_account_auth', 'true');
    sessionStorage.setItem('crmplus_account_id', accountId);
    sessionStorage.setItem('crmplus_user', JSON.stringify({ company: formData.companyName, id: accountId }));
    
    navigate('/billing');
  };

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center relative overflow-hidden">
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 p-10 md:p-14 rounded-[4rem] shadow-2xl relative z-10 animate-in fade-in">
        <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-10 font-black uppercase text-[10px] tracking-widest">
          <ArrowLeft size={16} /> Voltar ao Login
        </button>

        <div className="text-center mb-12">
           <Zap className="text-red-600 mx-auto mb-4" size={48} />
           <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Ativar <span className="text-red-600">Ecossistema</span></h2>
           <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-[0.3em] mt-2">Crie sua licença mestre e acesse os módulos</p>
        </div>
        
        {error && <div className="mb-8 p-4 bg-red-600/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase text-center rounded-2xl animate-bounce">{error}</div>}
        
        <form onSubmit={handleSignup} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nome Completo</label>
              <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" placeholder="Responsável Legal" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nome da Empresa</label>
              <input required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-black uppercase" placeholder="Oficina / Restaurante" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">E-mail para Faturamento e Avisos</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" placeholder="seu@email.com" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Usuário de Acesso</label>
              <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" placeholder="Ex: master.acesso" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2"><ShieldCheck size={12}/> PIN Mestre (4 Dígitos)</label>
              <input required maxLength={4} type="password" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-red-600 font-black text-center text-3xl tracking-widest" placeholder="0000" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Confirmar Senha</label>
              <input required type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" className="w-full py-6 bg-red-600 text-white font-black rounded-[2rem] uppercase text-sm tracking-[0.2em] mt-8 shadow-2xl shadow-red-600/30 hover:scale-[1.02] active:scale-95 transition-all">
            Criar Licença e Ver Planos
          </button>
        </form>
      </div>
    </div>
  );
};
