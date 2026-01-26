
import React, { useState, useEffect } from 'react';
/* Added Navigate to the react-router-dom imports */
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Rocket, Eye, EyeOff, CheckCircle, Shield, Plus, Edit3, User, Key, LogIn } from 'lucide-react';
import { UserProfile, AccountLicense } from '../types';

// Avatares estilo "Personas" - Expressões neutras e profissionais
const AVATAR_OPTIONS = [
  'https://api.dicebear.com/9.x/personas/svg?seed=1',
  'https://api.dicebear.com/9.x/personas/svg?seed=2',
  'https://api.dicebear.com/9.x/personas/svg?seed=3',
  'https://api.dicebear.com/9.x/personas/svg?seed=4',
  'https://api.dicebear.com/9.x/personas/svg?seed=5',
  'https://api.dicebear.com/9.x/personas/svg?seed=6',
  'https://api.dicebear.com/9.x/personas/svg?seed=7',
  'https://api.dicebear.com/9.x/personas/svg?seed=8',
  'https://api.dicebear.com/9.x/personas/svg?seed=9',
  'https://api.dicebear.com/9.x/personas/svg?seed=10',
  'https://api.dicebear.com/9.x/personas/svg?seed=11',
  'https://api.dicebear.com/9.x/personas/svg?seed=12',
  'https://api.dicebear.com/9.x/personas/svg?seed=13',
  'https://api.dicebear.com/9.x/personas/svg?seed=14',
  'https://api.dicebear.com/9.x/personas/svg?seed=15',
  'https://api.dicebear.com/9.x/personas/svg?seed=16',
  'https://api.dicebear.com/9.x/personas/svg?seed=17',
  'https://api.dicebear.com/9.x/personas/svg?seed=18',
  'https://api.dicebear.com/9.x/personas/svg?seed=19',
  'https://api.dicebear.com/9.x/personas/svg?seed=20',
];

const Login = () => {
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
      navigate('/profiles');
    } else { setError('Credenciais inválidas.'); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.08),transparent_70%)]"></div>
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700 relative z-10">
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-br from-cyan-400 to-violet-600 p-4 rounded-[2rem] w-fit mx-auto shadow-[0_0_40px_rgba(0,240,255,0.4)]"><ShieldCheck className="text-white" size={32}/></div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Login <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Plus+</span></h1>
          <p className="text-cyan-400 font-black uppercase tracking-[0.4em] text-[10px] neon-text-cyan">Autenticação Corporativa</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 p-10 rounded-[3rem] backdrop-blur-3xl shadow-2xl">
          {error && <div className="p-3 bg-red-600/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase text-center rounded-xl mb-6">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-200 uppercase ml-1 tracking-widest">Usuário</label>
              <input value={user} onChange={e => setUser(e.target.value)} className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/30 text-sm font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-200 uppercase ml-1 tracking-widest">Senha</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/30 text-sm font-bold" />
            </div>
            <button type="submit" className="w-full py-5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl hover:brightness-125 transition-all mt-4">Validar Acesso</button>
          </form>
          <div className="mt-10 pt-8 border-t border-white/10 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Nova licença? <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 transition-all underline-offset-4">Criar agora</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', companyName: '', username: '', password: '', pin: '', avatar: AVATAR_OPTIONS[0] });
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.companyName || !formData.username || !formData.password || formData.pin.length !== 4) {
      setError('Todos os campos são obrigatórios. O PIN deve ter 4 dígitos.'); return;
    }
    
    const saved = localStorage.getItem('crmplus_accounts');
    const accounts = saved ? JSON.parse(saved) : [];
    if (accounts.some((a: any) => a.username === formData.username)) {
      setError('Este nome de usuário já está em uso.'); return;
    }

    const accountId = Date.now().toString();
    const newAccount = {
      id: accountId,
      fullName: formData.fullName,
      email: formData.email,
      companyName: formData.companyName,
      username: formData.username,
      password: formData.password,
      status: 'Ativo',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      allowedModules: ['oficina', 'config']
    };

    const masterProfile = {
      id: '1',
      name: formData.fullName.split(' ')[0],
      avatar: formData.avatar,
      pin: formData.pin,
      modules: ['oficina', 'config'],
      actions: ['create_os', 'edit_os', 'delete_os', 'manage_profiles', 'view_logs']
    };

    localStorage.setItem('crmplus_accounts', JSON.stringify([...accounts, newAccount]));
    localStorage.setItem(`crmplus_profiles_${accountId}`, JSON.stringify([masterProfile]));
    
    sessionStorage.setItem('crmplus_account_auth', 'true');
    sessionStorage.setItem('crmplus_account_id', accountId);
    navigate('/profiles');
  };

  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-12 relative flex flex-col items-center overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,70,239,0.06),transparent_70%)]"></div>
      
      <div className="w-full max-w-3xl space-y-10 relative z-10 my-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-br from-violet-600 to-magenta-500 p-4 rounded-[2rem] w-fit mx-auto shadow-[0_0_40px_rgba(217,70,239,0.4)]"><Rocket className="text-white" size={32}/></div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Expansão <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-magenta-400">Plus+</span></h1>
          <p className="text-magenta-400 font-black uppercase tracking-[0.4em] text-[10px] neon-text-magenta">Novo Cadastro de Licença</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-8 md:p-12 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl space-y-10">
          {error && <div className="p-4 bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase text-center rounded-2xl">{error}</div>}
          
          <form onSubmit={handleSignup} className="space-y-10">
            <div className="space-y-6">
               <label className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em] block text-center">Escolha sua Identidade Visual (Neutro)</label>
               <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-4 p-6 bg-black/60 rounded-[2.5rem] border border-white/5 no-scrollbar max-h-64 overflow-y-auto">
                  {AVATAR_OPTIONS.map((av) => (
                    <button 
                      key={av} 
                      type="button" 
                      onClick={() => setFormData({...formData, avatar: av})}
                      className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 hover:scale-110 bg-[#0a0a0a] ${formData.avatar === av ? 'ring-4 ring-magenta-500 scale-110' : 'opacity-30 grayscale hover:grayscale-0 hover:opacity-100'}`}
                    >
                      <img src={av} className="w-full h-full object-cover" alt="Avatar" />
                      {formData.avatar === av && <div className="absolute inset-0 bg-magenta-500/20 flex items-center justify-center"><CheckCircle size={20} className="text-white" /></div>}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-200 uppercase tracking-widest ml-1">Nome Completo</label>
                <input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="João Silva" className="w-full bg-black/40 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-magenta-500/30 text-sm font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-200 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contato@empresa.com" className="w-full bg-black/40 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-magenta-500/30 text-sm font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-200 uppercase tracking-widest ml-1">Empresa</label>
                <input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Oficina Pro" className="w-full bg-black/40 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-magenta-500/30 text-sm font-black uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-200 uppercase tracking-widest ml-1">Usuário de Acesso</label>
                <input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="admin" className="w-full bg-black/40 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-magenta-500/30 text-sm font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-200 uppercase tracking-widest ml-1">Senha Mestra</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="w-full bg-black/40 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-magenta-500/30 text-sm font-bold" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-200 uppercase tracking-widest">PIN do Perfil Mestre (4 Dígitos)</label>
                  <button type="button" onClick={() => setShowPin(!showPin)} className="text-slate-500 hover:text-white transition-colors">{showPin ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                </div>
                <input 
                  type={showPin ? "text" : "password"} 
                  maxLength={4} 
                  value={formData.pin} 
                  onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} 
                  placeholder="0000"
                  className="w-full bg-black/60 border border-magenta-500/40 px-5 py-4 rounded-2xl text-white font-black text-center text-2xl tracking-[0.5em] outline-none focus:ring-4 focus:ring-magenta-500/10 placeholder:opacity-10" 
                />
              </div>
            </div>

            <button type="submit" className="w-full py-6 bg-gradient-to-r from-violet-600 to-magenta-500 text-white font-black rounded-3xl uppercase tracking-[0.3em] text-[11px] shadow-2xl active:scale-95 transition-all">Ativar Licença Agora</button>
          </form>
          <div className="text-center"><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Já possui acesso? <Link to="/login" className="text-cyan-400 hover:underline">Entrar no Sistema</Link></p></div>
        </div>
      </div>
    </div>
  );
};

const ProfileSelector = ({ onProfileSelect }: { onProfileSelect: (p: UserProfile) => void }) => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [showModal, setShowModal] =耀'none' | 'add' | 'edit'>('none');
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  const [account, setAccount] = useState<AccountLicense | null>(null);
  const [formData, setFormData] = useState({ name: '', pin: '', avatar: AVATAR_OPTIONS[0], modules: [] as string[], actions: [] as string[] });

  useEffect(() => {
    const accountId = sessionStorage.getItem('crmplus_account_id');
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    const currentAcc = accounts.find((a: AccountLicense) => a.id === accountId);
    setAccount(currentAcc);
    const storageKey = `crmplus_profiles_${accountId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) setProfiles(JSON.parse(saved));
  }, []);

  const handleAction = () => {
    if (!formData.name || formData.pin.length !== 4) { alert("Nome e PIN de 4 dígitos são obrigatórios."); return; }
    const accountId = sessionStorage.getItem('crmplus_account_id');
    const storageKey = `crmplus_profiles_${accountId}`;
    let updated: UserProfile[];
    if (showModal === 'add') { updated = [...profiles, { id: Date.now().toString(), ...formData }]; }
    else { updated = profiles.map(p => p.id === editingProfile?.id ? { ...p, ...formData } : p); }
    setProfiles(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setShowModal('none');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
      <div className="text-center mb-20 space-y-4">
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Quem está <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Operando?</span></h1>
        <p className="text-cyan-400 font-bold uppercase tracking-[0.4em] text-[10px] neon-text-cyan">{account?.companyName}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-16 mb-24 max-w-6xl">
        {profiles.map((p, idx) => (
          <div key={p.id} onClick={() => {
            if (isManaging) { setEditingProfile(p); setFormData({ ...p }); setShowModal('edit'); }
            else { 
              sessionStorage.setItem('crmplus_active_profile', JSON.stringify(p)); 
              onProfileSelect(p);
              navigate('/pin'); 
            }
          }} className="flex flex-col items-center gap-6 cursor-pointer group animate-in zoom-in duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className={`w-40 h-40 rounded-[3.5rem] border-4 overflow-hidden transition-all group-hover:scale-110 shadow-2xl relative bg-[#0a0a0a] ${isManaging ? 'border-cyan-500 shadow-cyan-500/30' : 'border-white/10 group-hover:border-cyan-500'}`}>
               <img src={p.avatar} className="w-full h-full object-cover" alt={p.name} />
               {idx === 0 && <div className="absolute top-2 right-2 bg-cyan-500 text-black p-1.5 rounded-full shadow-lg"><Shield size={14} fill="currentColor" /></div>}
            </div>
            <span className="text-slate-300 group-hover:text-white font-black uppercase text-sm tracking-widest transition-colors">{p.name} {idx === 0 && "(Mestre)"}</span>
          </div>
        ))}
        {isManaging && (
           <div onClick={() => {
             setFormData({ name: '', pin: '', avatar: AVATAR_OPTIONS[0], modules: account?.allowedModules || ['oficina'], actions: [] });
             setShowModal('add');
           }} className="flex flex-col items-center gap-6 cursor-pointer group">
            <div className="w-40 h-40 rounded-[3.5rem] border-4 border-dashed border-white/10 flex items-center justify-center text-slate-700 hover:border-cyan-500 hover:text-cyan-500 transition-all hover:scale-110">
               <Plus size={48} />
            </div>
            <span className="text-slate-600 font-black uppercase text-sm tracking-widest">Novo Perfil</span>
          </div>
        )}
      </div>

      <button onClick={() => setIsManaging(!isManaging)} className="px-16 py-5 border-2 border-white/10 rounded-3xl font-black uppercase text-[10px] tracking-[0.4em] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all bg-white/[0.02] backdrop-blur-sm">
        {isManaging ? 'Concluir Gerenciamento' : 'Gerenciar Perfis'}
      </button>

      {showModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-[#0a0a0a] rounded-[3.5rem] p-12 border border-white/10 shadow-2xl space-y-8 relative overflow-hidden">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Editar <span className="text-cyan-400">Identidade</span></h2>
              <div className="space-y-8">
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 p-4 bg-black/40 rounded-3xl border border-white/5 max-h-40 overflow-y-auto no-scrollbar">
                   {AVATAR_OPTIONS.map(av => (
                     <button key={av} onClick={() => setFormData({...formData, avatar: av})} className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${formData.avatar === av ? 'border-cyan-500 scale-105' : 'border-transparent opacity-20 hover:opacity-100'}`}>
                        <img src={av} className="w-full h-full object-cover" />
                     </button>
                   ))}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Nome do Operador</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-cyan-500/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">PIN de Acesso</label>
                  <input maxLength={4} type="password" readOnly={showModal === 'edit'} value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g,'')})} className={`w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-black text-center text-2xl tracking-[1em] outline-none ${showModal === 'edit' ? 'opacity-30 cursor-not-allowed border-red-500/10' : 'focus:ring-2 focus:ring-cyan-500/30'}`} />
                  {showModal === 'edit' && <p className="text-[9px] text-red-400 font-bold uppercase italic mt-2 text-center">O PIN só pode ser alterado via suporte para sua segurança.</p>}
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setShowModal('none')} className="flex-1 py-5 bg-white/5 text-slate-400 rounded-2xl font-black uppercase text-[10px]">Cancelar</button>
                   <button onClick={handleAction} className="flex-1 py-5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-black rounded-2xl uppercase text-[10px] shadow-lg">Confirmar</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const PinEntry = ({ profile }: { profile: UserProfile | null }) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Fallback para quando o profile some do estado (recarga de página)
  const activeProfile = profile || JSON.parse(sessionStorage.getItem('crmplus_active_profile') || 'null');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === activeProfile?.pin) {
      sessionStorage.setItem('crmplus_pin_verified', 'true');
      navigate('/');
    } else {
      setError(true); setPin('');
      setTimeout(() => setError(false), 800);
    }
  };

  if (!activeProfile) {
    /* Navigate is now correctly imported */
    return <Navigate to="/profiles" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505] animate-in zoom-in duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.05),transparent_70%)]"></div>
      
      <div className="mb-16 text-center space-y-8 flex flex-col items-center relative z-10">
        <div className="w-52 h-52 rounded-[4.5rem] border-4 border-cyan-500 overflow-hidden shadow-[0_0_80px_rgba(0,240,255,0.25)] bg-[#0a0a0a]">
           <img src={activeProfile.avatar} className="w-full h-full object-cover bg-[#0a0a0a]" alt="Operador" />
        </div>
        <div className="space-y-2">
          <p className="text-cyan-400 font-black uppercase tracking-[0.6em] text-[10px] neon-text-cyan">Acesso Protegido</p>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{activeProfile.name}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-8 relative z-10">
        <input 
          type="password" 
          maxLength={4} 
          autoFocus 
          value={pin} 
          onChange={e => setPin(e.target.value.replace(/\D/g, ''))} 
          className={`w-full bg-black/60 backdrop-blur-3xl border-2 py-8 rounded-[3.5rem] text-4xl font-black text-center text-white outline-none tracking-[1em] transition-all shadow-2xl ${error ? 'border-red-500 animate-shake' : 'border-white/10 focus:border-cyan-500 focus:shadow-[0_0_30px_rgba(0,240,255,0.2)]'}`} 
        />
        <button type="submit" disabled={pin.length < 4} className="w-full py-6 bg-white text-black font-black rounded-[2.5rem] uppercase text-[10px] tracking-[0.4em] disabled:opacity-20 hover:bg-slate-100 active:scale-95 transition-all shadow-2xl">Confirmar PIN</button>
      </form>
      
      <button onClick={() => navigate('/profiles')} className="mt-12 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all relative z-10">Selecionar outro operador</button>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-15px); }
          75% { transform: translateX(15px); }
        }
        .animate-shake { animation: shake 0.15s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default { Login, Signup, ProfileSelector, PinEntry };
