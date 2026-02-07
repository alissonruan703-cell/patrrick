
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, Lock, Mail, ArrowLeft, Zap, ShieldCheck, User, Building2, Key, Check } from 'lucide-react';
import { AccountLicense } from '../types';

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
      sessionStorage.setItem('crmplus_account_auth', 'true');
      sessionStorage.setItem('crmplus_account_id', account.id);
      navigate('/profiles');
    } else {
      setError('Credenciais incorretas.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-white italic">CRM<span className="text-red-600">Plus+</span></h1>
          <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Ecossistema de Gestão</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-zinc-500 mb-8 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">
            <ArrowLeft size={16} /> Voltar ao Início
          </button>
          {error && <div className="p-4 bg-red-600/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase text-center rounded-xl mb-6">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-6">
            <input required value={user} onChange={e => setUser(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" placeholder="Usuário" />
            <input required type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" placeholder="Senha" />
            <button type="submit" className="w-full py-5 bg-red-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-red-700 transition-all">Entrar</button>
          </form>
          <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
            <Link to="/signup" className="text-zinc-500 text-[10px] font-black uppercase hover:text-red-600 transition-colors">Ativar Nova Licença</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', companyName: '', username: '', password: '', confirmPassword: '', pin: '' });
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError('As senhas não coincidem.'); return; }
    if (formData.pin.length !== 4) { setError('O PIN deve ter 4 dígitos.'); return; }

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
      expirationDate: yesterday.toISOString(), 
      allowedModules: ['oficina', 'orcamento', 'restaurante', 'config']
    };

    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    localStorage.setItem('crmplus_accounts', JSON.stringify([...accounts, newAccount]));
    sessionStorage.setItem('crmplus_account_id', accountId);
    navigate('/billing');
  };

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 p-10 md:p-14 rounded-[4rem] shadow-2xl animate-in fade-in">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-zinc-500 mb-10 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">
          <ArrowLeft size={16} /> Voltar ao Login
        </button>
        <div className="text-center mb-10">
           <Zap className="text-red-600 mx-auto mb-4" size={48} />
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Ativar <span className="text-red-600">Ecossistema</span></h2>
        </div>
        {error && <div className="p-4 bg-red-600/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase text-center rounded-2xl mb-8">{error}</div>}
        <form onSubmit={handleSignup} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" placeholder="Nome Completo" />
            <input required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-black uppercase" placeholder="Nome da Empresa" />
          </div>
          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" placeholder="Seu Melhor E-mail" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" placeholder="Usuário" />
            <input required maxLength={4} type="password" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} className="bg-black border border-zinc-800 p-4 rounded-2xl text-red-600 font-black text-center text-3xl" placeholder="PIN 0000" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" placeholder="Senha" />
            <input required type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-red-600 font-bold" placeholder="Confirmar Senha" />
          </div>
          <button type="submit" className="w-full py-6 bg-red-600 text-white font-black rounded-[2rem] uppercase text-xs tracking-widest shadow-2xl hover:scale-[1.02] transition-all">Ativar Licença</button>
        </form>
      </div>
    </div>
  );
};
