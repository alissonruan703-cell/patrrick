
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { 
  ShieldCheck, Rocket, Eye, EyeOff, CheckCircle2, Shield, Plus, Edit3, User, 
  LayoutGrid, Settings, Trash2, FileText, Activity, Key, Lock, AlertCircle, 
  Mail, ArrowLeft, X, Clock, Check, ListChecks, Utensils, Zap 
} from 'lucide-react';
import { UserProfile, AccountLicense, ModuleId } from '../types';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/9.x/personas/svg?seed=1',
  'https://api.dicebear.com/9.x/personas/svg?seed=2',
  'https://api.dicebear.com/9.x/personas/svg?seed=3',
  'https://api.dicebear.com/9.x/personas/svg?seed=4',
  'https://api.dicebear.com/9.x/personas/svg?seed=5',
];

const PERMISSION_OPTIONS = [
  { id: 'create_os', name: 'Criar O.S.', desc: 'Abertura de protocolos' },
  { id: 'edit_os', name: 'Editar/Lançar', desc: 'Mudar status e itens' },
  { id: 'delete_os', name: 'Apagar O.S.', desc: 'Excluir ordens' },
  { id: 'view_history', name: 'Ver Histórico', desc: 'Consultar ordens antigas' },
  { id: 'manage_profiles', name: 'Gerir Perfis', desc: 'Controlar operadores' },
];

const AVAILABLE_MODULES: { id: ModuleId; name: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'oficina', name: 'Sistema de oficina', icon: <Rocket size={18}/>, desc: 'Gestão de Mecânica e O.S.' },
  { id: 'orcamento', name: 'Orçamento', icon: <FileText size={18}/>, desc: 'Faturamento Rápido e Link' },
  { id: 'restaurante', name: 'Restaurante', icon: <Utensils size={18}/>, desc: 'Mesas e Pedidos' }
];

export const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'HzHj2g' && pass === 'Ma4tgz') {
      sessionStorage.setItem('crmplus_is_master', 'true');
      sessionStorage.setItem('crmplus_account_auth', 'true');
      navigate('/admin-panel');
      return;
    }
    const saved = localStorage.getItem('crmplus_accounts');
    const accounts: AccountLicense[] = saved ? JSON.parse(saved) : [];
    const account = accounts.find(a => a.username === user && a.password === pass);
    if (account) {
      if (account.status === 'Bloqueado') { setError('Licença bloqueada.'); return; }
      sessionStorage.setItem('crmplus_account_auth', 'true');
      sessionStorage.setItem('crmplus_account_id', account.id);
      sessionStorage.setItem('crmplus_user', JSON.stringify({ company: account.companyName, id: account.id }));
      navigate('/profiles');
    } else { setError('Credenciais inválidas.'); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 relative">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">CRM<span className="text-red-600">Plus+</span></h1>
          <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px]">Acesso ao Ecossistema</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl">
          {error && <div className="p-3 bg-red-600/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase text-center rounded-xl mb-6">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-6">
            <input value={user} onChange={e => setUser(e.target.value)} placeholder="Usuário" className="w-full bg-black border border-zinc-800 px-6 py-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" />
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Senha" className="w-full bg-black border border-zinc-800 px-6 py-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" />
            <button type="submit" className="w-full py-5 bg-red-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl hover:bg-red-700 transition-all">Entrar</button>
          </form>
          <div className="mt-8 text-center">
            <Link to="/signup" className="text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-red-600">Criar Nova Licença</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', companyName: '', username: '', password: '', pin: '', avatar: AVATAR_OPTIONS[0] });
  const [selectedModules, setSelectedModules] = useState<ModuleId[]>(['oficina']);
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.companyName || formData.pin.length !== 4) {
      setError('Preencha os campos obrigatórios. PIN deve ter 4 dígitos.'); return;
    }
    
    const accountId = Date.now().toString();
    const newAccount: AccountLicense = {
      id: accountId, 
      fullName: formData.fullName, 
      email: formData.email, 
      companyName: formData.companyName, 
      username: formData.username, 
      password: formData.password, 
      status: 'Ativo', 
      createdAt: new Date().toISOString(), 
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias de teste
      allowedModules: [...selectedModules, 'config'] as ModuleId[]
    };

    const masterProfile: UserProfile = {
      id: 'admin', 
      name: formData.fullName.split(' ')[0], 
      avatar: formData.avatar, 
      pin: formData.pin, 
      modules: [...selectedModules, 'config'], 
      actions: PERMISSION_OPTIONS.map(p => p.id)
    };

    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    localStorage.setItem('crmplus_accounts', JSON.stringify([...accounts, newAccount]));
    localStorage.setItem(`crmplus_profiles_${accountId}`, JSON.stringify([masterProfile]));
    
    sessionStorage.setItem('crmplus_account_auth', 'true');
    sessionStorage.setItem('crmplus_account_id', accountId);
    sessionStorage.setItem('crmplus_user', JSON.stringify({ company: formData.companyName, id: accountId }));
    navigate('/profiles');
  };

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl">
        <h2 className="text-2xl font-black text-white uppercase mb-8 text-center">Nova <span className="text-red-600">Licença</span></h2>
        {error && <div className="mb-6 p-3 bg-red-600/10 text-red-500 text-[10px] font-black uppercase text-center rounded-xl">{error}</div>}
        <form onSubmit={handleSignup} className="space-y-4">
          <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Nome Responsável" className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none" />
          <input required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Nome da Empresa" className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none uppercase" />
          <div className="grid grid-cols-2 gap-4">
            <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="Usuário" className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none" />
            <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Senha" className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none" />
          </div>
          <input maxLength={4} type="password" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} placeholder="PIN MESTRE (4 DÍGITOS)" className="w-full bg-black border border-red-600/30 p-4 rounded-xl text-white font-black text-center text-xl tracking-[0.5em]" />
          <button type="submit" className="w-full py-5 bg-red-600 text-white font-black rounded-xl uppercase text-[10px] tracking-widest mt-4">Ativar Ecossistema</button>
        </form>
      </div>
    </div>
  );
};

export default { Login, Signup };
