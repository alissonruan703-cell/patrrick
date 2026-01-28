
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ShieldCheck, Rocket, Eye, EyeOff, CheckCircle2, Shield, Plus, Edit3, User, LayoutGrid, Settings, Trash2, FileText, Activity, Key, Lock, AlertCircle, Mail, ArrowLeft, X, Clock, Check, ListChecks, Utensils, Zap } from 'lucide-react';
import { UserProfile, AccountLicense } from '../types';

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
];

const PERMISSION_OPTIONS = [
  { id: 'create_os', name: 'Criar O.S.', desc: 'Permite abrir novos protocolos' },
  { id: 'edit_os', name: 'Editar/Lançar', desc: 'Lançar itens e mudar status' },
  { id: 'delete_os', name: 'Apagar O.S.', desc: 'Excluir ordens do sistema' },
  { id: 'view_history', name: 'Ver Histórico', desc: 'Consultar ordens entregues' },
  { id: 'manage_profiles', name: 'Gerir Perfis', desc: 'Criar/Editar outros operadores' },
  { id: 'view_logs', name: 'Ver Logs', desc: 'Acesso à auditoria master' },
];

const AVAILABLE_MODULES = [
  { id: 'oficina', name: 'Oficina Pro+', icon: <Rocket size={18}/>, desc: 'Gestão de O.S. e Mecânica' },
  { id: 'orcamento', name: 'Vendas Plus', icon: <FileText size={18}/>, desc: 'CRM e Faturamento Rápido' },
  { id: 'restaurante', name: 'Gastro Hub', icon: <Utensils size={18}/>, desc: 'Mesas, Delivery e Pedidos' }
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
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all group z-20">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Catálogo</span>
      </Link>

      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700 relative z-10">
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-br from-cyan-400 to-violet-600 p-4 rounded-[2rem] w-fit mx-auto shadow-[0_0_40px_rgba(0,240,255,0.4)]"><ShieldCheck className="text-white" size={32}/></div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Login <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Plus+</span></h1>
          <p className="text-cyan-400 font-black uppercase tracking-[0.4em] text-[10px] neon-text-cyan">Acesso Corporativo</p>
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
  const [selectedModules, setSelectedModules] = useState<string[]>(['oficina']);
  const [error, setError] = useState('');

  const toggleModule = (id: string) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.companyName || !formData.username || !formData.password || formData.pin.length !== 4) {
      setError('Todos os campos são obrigatórios. O PIN deve ter 4 dígitos.'); return;
    }
    if (selectedModules.length === 0) {
      setError('Selecione ao menos um módulo para sua assinatura.'); return;
    }
    
    const saved = localStorage.getItem('crmplus_accounts');
    const accounts = saved ? JSON.parse(saved) : [];
    if (accounts.some((a: any) => a.username === formData.username)) {
      setError('Este nome de usuário já está em uso.'); return;
    }

    const accountId = Date.now().toString();
    const newAccount: AccountLicense = {
      id: accountId, fullName: formData.fullName, email: formData.email, companyName: formData.companyName, username: formData.username, password: formData.password, status: 'Ativo', createdAt: new Date().toLocaleDateString('pt-BR'), expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], allowedModules: [...selectedModules, 'config']
    };

    const masterProfile: UserProfile = {
      id: '1', name: formData.fullName.split(' ')[0], avatar: formData.avatar, pin: formData.pin, modules: [...selectedModules, 'config'], actions: PERMISSION_OPTIONS.map(p => p.id)
    };

    localStorage.setItem('crmplus_accounts', JSON.stringify([...accounts, newAccount]));
    localStorage.setItem(`crmplus_profiles_${accountId}`, JSON.stringify([masterProfile]));
    
    sessionStorage.setItem('crmplus_account_auth', 'true');
    sessionStorage.setItem('crmplus_account_id', accountId);
    navigate('/profiles');
  };

  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-12 relative flex flex-col items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,70,239,0.06),transparent_70%)]"></div>
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all z-20">
        <ArrowLeft size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">Voltar ao Catálogo</span>
      </Link>
      <div className="w-full max-w-5xl space-y-12 relative z-10 my-10 animate-in fade-in duration-1000">
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-br from-violet-600 to-magenta-500 p-4 rounded-[2rem] w-fit mx-auto shadow-2xl"><Rocket className="text-white" size={32}/></div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Ativar <span className="text-magenta-500">Ecossistema</span></h1>
          <p className="text-magenta-400 font-bold uppercase tracking-[0.4em] text-[10px]">Primeiro Passo para sua Transformação</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 p-10 lg:p-14 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl">
          <form onSubmit={handleSignup} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-10">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Zap size={14} className="text-magenta-500"/> Escolha seus Módulos</label>
                <div className="grid grid-cols-1 gap-3">
                  {AVAILABLE_MODULES.map(mod => (
                    <button 
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className={`flex items-center gap-5 p-5 rounded-3xl border transition-all text-left group ${selectedModules.includes(mod.id) ? 'bg-magenta-500/10 border-magenta-500/40 shadow-lg shadow-magenta-500/5' : 'bg-black/40 border-white/5 opacity-50 hover:opacity-100'}`}
                    >
                      <div className={`p-3 rounded-2xl ${selectedModules.includes(mod.id) ? 'bg-magenta-500 text-white' : 'bg-white/5 text-slate-500 group-hover:text-white'}`}>
                        {mod.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`text-[11px] font-black uppercase tracking-tight ${selectedModules.includes(mod.id) ? 'text-white' : 'text-slate-500'}`}>{mod.name}</p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">{mod.desc}</p>
                      </div>
                      {selectedModules.includes(mod.id) && <Check size={16} className="text-magenta-500" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Avatar Operador Master</label>
                <div className="grid grid-cols-5 gap-3 p-4 bg-black/40 rounded-3xl border border-white/5">
                  {AVATAR_OPTIONS.map(av => (
                    <button key={av} type="button" onClick={() => setFormData({...formData, avatar: av})} className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${formData.avatar === av ? 'border-magenta-500 scale-105' : 'border-transparent opacity-30 hover:opacity-100'}`}><img src={av} className="w-full h-full object-cover" /></button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {error && <div className="p-4 bg-red-600/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase text-center rounded-2xl">{error}</div>}
              <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase">Nome</label><input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-black/40 border border-white/5 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-magenta-500/20 font-bold" placeholder="Seu nome ou apelido" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase">Empresa</label><input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-black/40 border border-white/5 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-magenta-500/20 font-bold uppercase" /></div>
                <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase">E-mail</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/5 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-magenta-500/20 font-bold" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase">Usuário</label><input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-black/40 border border-white/5 px-5 py-4 rounded-2xl text-white font-bold" /></div>
                <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase">Senha</label><input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-black/40 border border-white/5 px-5 py-4 rounded-2xl text-white font-bold" /></div>
              </div>
              <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">PIN Mestre (4 Dígitos)</label><input maxLength={4} type="password" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} className="w-full bg-black/60 border border-magenta-500/30 px-5 py-4 rounded-2xl text-white font-black text-center text-3xl tracking-[1em]" placeholder="0000" /></div>
              <button type="submit" className="w-full py-6 bg-gradient-to-r from-violet-600 to-magenta-500 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl mt-4 active:scale-95 transition-transform">Finalizar e Ativar Acesso</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ProfileSelector = ({ onProfileSelect }: { onProfileSelect: (p: UserProfile) => void }) => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  const [account, setAccount] = useState<AccountLicense | null>(null);
  const [showModal, setShowModal] = useState<'none' | 'add' | 'edit'>('none');
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [isConfirmingMasterPin, setIsConfirmingMasterPin] = useState(false);
  const [masterPinInput, setMasterPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pendingAction, setPendingAction] = useState<'save' | 'delete'>('save');
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserProfile>({ id: '', name: '', pin: '', avatar: AVATAR_OPTIONS[0], modules: ['oficina'], actions: [] });

  useEffect(() => {
    const accountId = sessionStorage.getItem('crmplus_account_id');
    const accounts = JSON.parse(localStorage.getItem('crmplus_accounts') || '[]');
    setAccount(accounts.find((a: any) => a.id === accountId));
    const saved = localStorage.getItem(`crmplus_profiles_${accountId}`);
    if (saved) setProfiles(JSON.parse(saved));
  }, []);

  const togglePermission = (id: string) => {
    if (editingProfile?.id === '1') return; // Master tem tudo
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.includes(id) ? prev.actions.filter(a => a !== id) : [...prev.actions, id]
    }));
  };

  const handleAction = () => {
    if (!formData.name || formData.pin.length !== 4) return;
    setPendingAction('save');
    setIsConfirmingMasterPin(true);
  };

  const finalizeAction = () => {
    const master = profiles.find(p => p.id === '1');
    if (masterPinInput === master?.pin) {
      const accountId = sessionStorage.getItem('crmplus_account_id');
      let updated: UserProfile[];
      if (pendingAction === 'delete') { updated = profiles.filter(p => p.id !== targetDeleteId); }
      else if (showModal === 'add') { updated = [...profiles, { ...formData, id: Date.now().toString() }]; }
      else { updated = profiles.map(p => p.id === formData.id ? formData : p); }
      
      setProfiles(updated);
      localStorage.setItem(`crmplus_profiles_${accountId}`, JSON.stringify(updated));
      setShowModal('none'); setIsConfirmingMasterPin(false); setMasterPinInput('');
    } else { setPinError(true); setMasterPinInput(''); setTimeout(() => setPinError(false), 800); }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative">
       <Link to="/" className="absolute top-8 left-8 flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all z-20"><ArrowLeft size={16}/><span className="text-[10px] font-black uppercase tracking-widest">Catálogo</span></Link>
      <div className="text-center mb-16 space-y-4 animate-in fade-in duration-700">
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Quem está <span className="text-cyan-400">Operando?</span></h1>
        <p className="text-cyan-400 font-bold uppercase tracking-[0.4em] text-[10px]">{account?.companyName}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-16 mb-24 max-w-6xl px-4 animate-in zoom-in-95 duration-700">
        {profiles.map((p) => (
          <div key={p.id} onClick={() => { if (isManaging) { setEditingProfile(p); setFormData({...p}); setShowModal('edit'); } else { sessionStorage.setItem('crmplus_active_profile', JSON.stringify(p)); onProfileSelect(p); navigate('/pin'); } }} className="flex flex-col items-center gap-6 cursor-pointer group relative">
            <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-[3.5rem] border-4 overflow-hidden transition-all group-hover:scale-110 shadow-2xl relative bg-[#0a0a0a] ${isManaging ? 'border-cyan-500' : 'border-white/10 group-hover:border-cyan-500'}`}>
               <img src={p.avatar} className="w-full h-full object-cover" />
               {p.id === '1' && <div className="absolute top-2 right-2 bg-cyan-500 text-black p-1.5 rounded-full shadow-lg"><Shield size={14} fill="currentColor" /></div>}
            </div>
            <span className="text-slate-300 group-hover:text-white font-black uppercase text-xs tracking-widest">{p.name} {p.id === '1' && "(Mestre)"}</span>
          </div>
        ))}
        {isManaging && (
           <div onClick={() => { setFormData({ id: '', name: '', pin: '', avatar: AVATAR_OPTIONS[0], modules: ['oficina'], actions: ['create_os', 'edit_os'] }); setShowModal('add'); }} className="flex flex-col items-center gap-6 cursor-pointer group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[3.5rem] border-4 border-dashed border-white/10 flex items-center justify-center text-slate-700 hover:border-cyan-500 hover:text-cyan-500 transition-all hover:scale-110"><Plus size={48} /></div>
            <span className="text-slate-600 font-black uppercase text-xs tracking-widest">Novo Perfil</span>
          </div>
        )}
      </div>
      <button onClick={() => setIsManaging(!isManaging)} className="px-12 py-5 border border-white/10 rounded-3xl font-black uppercase text-[10px] tracking-widest text-slate-500 hover:text-white transition-all bg-white/[0.02]">
        {isManaging ? 'Sair do Gerenciamento' : 'Gerenciar Perfis'}
      </button>

      {showModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 backdrop-blur-md overflow-y-auto no-scrollbar py-20">
           <div className="w-full max-w-3xl bg-[#0a0a0a] rounded-[3.5rem] p-10 lg:p-14 border border-white/10 shadow-2xl space-y-12 relative animate-in slide-in-from-bottom-10">
              <button onClick={() => setShowModal('none')} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
              
              {!isConfirmingMasterPin ? (
                <>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Configurar <span className="text-cyan-400">Operador</span></h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome de Exibição</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-cyan-500/20" /></div>
                       <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">PIN de Acesso (4 Dígitos)</label><input maxLength={4} type="password" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g,'')})} className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-black text-center text-3xl tracking-[1em]" /></div>
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-500 uppercase ml-1">Avatar</p>
                          <div className="grid grid-cols-5 gap-2">{AVATAR_OPTIONS.map(av => (<button key={av} onClick={() => setFormData({...formData, avatar: av})} className={`aspect-square rounded-xl overflow-hidden border-2 ${formData.avatar === av ? 'border-cyan-500 scale-105' : 'border-transparent opacity-30 hover:opacity-100'}`}><img src={av} className="w-full h-full" /></button>))}</div>
                       </div>
                    </div>
                    <div className="space-y-8">
                       <p className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2"><ListChecks size={14}/> Ações Permitidas</p>
                       <div className="grid grid-cols-1 gap-2">
                          {PERMISSION_OPTIONS.map(p => (
                            <button key={p.id} onClick={() => togglePermission(p.id)} disabled={editingProfile?.id === '1'} className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${formData.actions.includes(p.id) ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-black/40 border-white/5 opacity-40'} ${editingProfile?.id === '1' && 'cursor-not-allowed'}`}>
                               <div><p className={`text-[10px] font-black uppercase ${formData.actions.includes(p.id) ? 'text-white' : 'text-slate-500'}`}>{p.name}</p><p className="text-[8px] font-bold text-slate-600 uppercase mt-1">{p.desc}</p></div>
                               {formData.actions.includes(p.id) && <Check size={14} className="text-cyan-500" />}
                            </button>
                          ))}
                       </div>
                       {editingProfile?.id === '1' && <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest text-center">* O Perfil Mestre possui todas as ações nativamente.</p>}
                    </div>
                  </div>
                  <div className="flex gap-4">
                     {showModal === 'edit' && formData.id !== '1' && <button onClick={() => { setPendingAction('delete'); setTargetDeleteId(formData.id); setIsConfirmingMasterPin(true); }} className="px-8 py-5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>}
                     <button onClick={handleAction} className="flex-1 py-5 bg-cyan-500 text-black font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl shadow-cyan-500/20 hover:brightness-110 transition-all">Autorizar Modificações</button>
                  </div>
                </>
              ) : (
                <div className="space-y-10 text-center py-10">
                  <div className="w-20 h-20 bg-violet-600/10 border border-violet-500/20 rounded-3xl flex items-center justify-center mx-auto text-violet-500 shadow-xl"><Lock size={32}/></div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">PIN do Mestre</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black italic">Apenas o administrador master pode autorizar gestores.</p>
                  </div>
                  <input maxLength={4} type="password" autoFocus value={masterPinInput} onChange={e => setMasterPinInput(e.target.value.replace(/\D/g, ''))} className={`w-full bg-black border-2 py-8 rounded-[2.5rem] text-4xl font-black text-center text-white outline-none tracking-[1em] ${pinError ? 'border-red-500 animate-shake' : 'border-white/10 focus:border-cyan-500'}`} placeholder="0000" />
                  <div className="flex gap-4">
                    <button onClick={() => setIsConfirmingMasterPin(false)} className="flex-1 py-5 text-slate-500 font-black uppercase text-[10px]">Voltar</button>
                    <button onClick={finalizeAction} className={`flex-1 py-5 ${pendingAction === 'delete' ? 'bg-red-600' : 'bg-cyan-500'} text-black font-black rounded-2xl uppercase text-[10px]`}>Finalizar</button>
                  </div>
                </div>
              )}
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
  const activeProfile = profile || JSON.parse(sessionStorage.getItem('crmplus_active_profile') || 'null');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === activeProfile?.pin) { sessionStorage.setItem('crmplus_pin_verified', 'true'); navigate('/'); }
    else { setError(true); setPin(''); setTimeout(() => setError(false), 800); }
  };

  if (!activeProfile) return <Navigate to="/profiles" replace />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.05),transparent_70%)]"></div>
      <div className="mb-16 text-center space-y-8 flex flex-col items-center relative z-10 animate-in fade-in duration-1000">
        <div className="w-52 h-52 rounded-[4.5rem] border-4 border-cyan-500 overflow-hidden shadow-2xl bg-[#0a0a0a]"><img src={activeProfile.avatar} className="w-full h-full object-cover" /></div>
        <div className="space-y-2"><p className="text-cyan-400 font-black uppercase tracking-[0.6em] text-[10px]">Acesso Operacional</p><h1 className="text-4xl font-black text-white uppercase tracking-tighter">{activeProfile.name}</h1></div>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-8 relative z-10">
        <input type="password" maxLength={4} autoFocus value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} className={`w-full bg-black/60 border-2 py-8 rounded-[3.5rem] text-4xl font-black text-center text-white outline-none tracking-[1em] ${error ? 'border-red-500 animate-shake' : 'border-white/10'}`} placeholder="0000" />
        <button type="submit" className="w-full py-6 bg-white text-black font-black rounded-[2.5rem] uppercase text-[10px] tracking-widest shadow-2xl">Acessar Ecossistema</button>
      </form>
      <button onClick={() => navigate('/profiles')} className="mt-12 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all">Trocar Operador</button>
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-15px); } 75% { transform: translateX(15px); } }
        .animate-shake { animation: shake 0.15s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default { Login, Signup, ProfileSelector, PinEntry };
