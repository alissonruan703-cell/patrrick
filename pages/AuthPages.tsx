
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserPlus, ArrowRight, User, ShieldCheck, X, Plus, Edit2, Trash2, HelpCircle, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserProfile, SystemConfig } from '../types';

// Lista de avatares pré-definidos para o catálogo
const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jade',
];

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isAdmin = user === 'HzHj2g' && pass === 'Ma4tgz';
    const isTestClient = user === 'hcpneus' && pass === 'Volvo@24';

    if (isAdmin || isTestClient) {
      sessionStorage.setItem('crmplus_account_auth', 'true');
      
      if (isTestClient) {
        const currentConfig = localStorage.getItem('crmplus_system_config');
        if (!currentConfig) {
          const testConfig: SystemConfig = {
            companyName: 'Hc Pneus',
            companyLogo: ''
          };
          localStorage.setItem('crmplus_system_config', JSON.stringify(testConfig));
          window.dispatchEvent(new Event('storage'));
        }
      }

      navigate('/profiles');
    } else {
      setError('Credenciais inválidas. Verifique usuário e senha.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent)]">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-violet-600 rounded-2xl shadow-2xl shadow-violet-600/20 mb-4">
             <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Acesso à <span className="text-violet-500">Plataforma</span></h1>
          <p className="text-slate-500 font-medium">Entre com suas credenciais de acesso.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#1a1d23] border border-white/5 p-8 rounded-3xl shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-600/10 border border-red-500/10 text-red-500 text-[10px] font-black uppercase text-center rounded-xl animate-shake">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuário / Login</label>
            <input 
              value={user}
              onChange={e => setUser(e.target.value)}
              className="w-full bg-black/40 border border-white/5 px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 text-white font-bold transition-all" 
              placeholder="Digite seu usuário"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
            <input 
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="w-full bg-black/40 border border-white/5 px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 text-white font-bold transition-all" 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full py-5 bg-violet-600 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-violet-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-violet-600/20 active:scale-[0.98]">
            Entrar no Sistema <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

const ProfileSelector = ({ onProfileSelect }: { onProfileSelect: (p: UserProfile) => void }) => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [showModal, setShowModal] = useState<'none' | 'add' | 'edit'>('none');
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    pin: '',
    avatar: AVATAR_OPTIONS[0]
  });

  useEffect(() => {
    const saved = localStorage.getItem('crmplus_profiles');
    if (saved) {
      setProfiles(JSON.parse(saved));
    } else {
      const initial = [{ id: '1', name: 'Master', avatar: AVATAR_OPTIONS[0], pin: '1234' }];
      setProfiles(initial);
      localStorage.setItem('crmplus_profiles', JSON.stringify(initial));
    }
  }, []);

  const handleAction = () => {
    if (!formData.name || !formData.pin) return;

    if (showModal === 'add') {
      const p: UserProfile = {
        id: Date.now().toString(),
        name: formData.name,
        pin: formData.pin,
        avatar: formData.avatar
      };
      const updated = [...profiles, p];
      setProfiles(updated);
      localStorage.setItem('crmplus_profiles', JSON.stringify(updated));
    } else if (showModal === 'edit' && editingProfile) {
      const updated = profiles.map(p => 
        p.id === editingProfile.id ? { ...p, name: formData.name, pin: formData.pin, avatar: formData.avatar } : p
      );
      setProfiles(updated);
      localStorage.setItem('crmplus_profiles', JSON.stringify(updated));
    }

    setFormData({ name: '', pin: '', avatar: AVATAR_OPTIONS[0] });
    setShowModal('none');
    setEditingProfile(null);
  };

  const handleSupportRedirect = (type: 'delete' | 'pin', profileName: string) => {
    const config = JSON.parse(localStorage.getItem('crmplus_system_config') || '{"companyName": "Empresa"}');
    const message = `Olá Suporte, gostaria de ${type === 'delete' ? 'excluir o perfil' : 'recuperar o PIN do perfil'} "${profileName}" da conta ${config.companyName}.`;
    window.open(`https://wa.me/5588996655443?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleProfileClick = (p: UserProfile) => {
    if (isManaging) {
      if (p.id === '1') {
        alert("O Perfil Master não pode ser editado ou excluído.");
        return;
      }
      setEditingProfile(p);
      setFormData({ name: p.name, pin: p.pin, avatar: p.avatar });
      setShowModal('edit');
    } else {
      onProfileSelect(p);
      sessionStorage.setItem('crmplus_active_profile', JSON.stringify(p));
      navigate('/pin');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
      <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-16 text-center">
        {isManaging ? 'Gerenciar Perfis' : 'Quem está acessando?'}
      </h1>
      
      <div className="flex flex-wrap justify-center gap-8 sm:gap-12 max-w-5xl mb-20">
        {profiles.map(p => (
          <div 
            key={p.id} 
            onClick={() => handleProfileClick(p)}
            className="group cursor-pointer flex flex-col items-center space-y-4 relative"
          >
            <div className={`w-24 h-24 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 transition-all group-hover:scale-110 shadow-2xl ${isManaging ? (p.id === '1' ? 'border-white/10 opacity-50' : 'border-violet-600 animate-pulse-slow') : 'border-transparent group-hover:border-violet-600'}`}>
              <img src={p.avatar} className="w-full h-full object-cover bg-black/40" alt={p.name} />
              {isManaging && p.id !== '1' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                   <Edit2 className="text-white" size={32} />
                </div>
              )}
              {isManaging && p.id === '1' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                   <Lock className="text-slate-500" size={32} />
                </div>
              )}
            </div>
            <span className="text-slate-400 group-hover:text-white font-bold text-sm sm:text-lg transition-colors uppercase tracking-widest">{p.name}</span>
          </div>
        ))}

        {!isManaging && (
          <div 
            onClick={() => {
              setFormData({ name: '', pin: '', avatar: AVATAR_OPTIONS[0] });
              setShowModal('add');
            }}
            className="group cursor-pointer flex flex-col items-center space-y-4"
          >
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl border-4 border-dashed border-white/10 group-hover:border-white/30 flex items-center justify-center text-white/20 group-hover:text-white transition-all group-hover:scale-110">
              <Plus size={48} />
            </div>
            <span className="text-slate-600 group-hover:text-white font-bold text-sm sm:text-lg uppercase tracking-widest transition-all">Novo Perfil</span>
          </div>
        )}
      </div>

      <button 
        onClick={() => setIsManaging(!isManaging)}
        className={`px-10 py-4 border-2 rounded-xl font-black uppercase tracking-[0.3em] text-xs transition-all ${isManaging ? 'bg-white text-black border-white' : 'text-slate-500 border-slate-500 hover:text-white hover:border-white'}`}
      >
        {isManaging ? 'Concluído' : 'Gerenciar Perfis'}
      </button>

      {/* Modal Profile (Add/Edit) */}
      {showModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#1a1d23] border border-white/10 rounded-[2.5rem] p-8 space-y-8 relative my-8">
             <button onClick={() => setShowModal('none')} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
             
             <div className="text-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  {showModal === 'add' ? 'Novo Perfil' : 'Editar Perfil'}
                </h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-violet-600 shadow-2xl">
                       <img src={formData.avatar} className="w-full h-full object-cover bg-black/40" alt="Preview" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avatar Selecionado</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Nome de Exibição</label>
                      <input 
                        placeholder="Nome" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="w-full bg-black/40 border border-white/5 px-6 py-4 rounded-2xl text-white font-bold uppercase outline-none focus:ring-2 focus:ring-violet-500/20" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Senha do Perfil (Case-Sensitive)</label>
                      <input 
                        type="text"
                        placeholder="Senha alfanumérica" 
                        value={formData.pin} 
                        onChange={e => setFormData({...formData, pin: e.target.value})} 
                        className="w-full bg-black/40 border border-white/5 px-6 py-4 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-violet-500/20" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center md:text-left">Escolha um Ícone</p>
                   <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[260px] p-2 no-scrollbar border border-white/5 rounded-2xl bg-black/20">
                      {AVATAR_OPTIONS.map((av, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setFormData({...formData, avatar: av})}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${formData.avatar === av ? 'border-violet-600' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                          <img src={av} className="w-full h-full object-cover" alt={`Avatar ${idx}`} />
                          {formData.avatar === av && (
                            <div className="absolute top-1 right-1 bg-violet-600 text-white p-0.5 rounded-full">
                              <Check size={10} strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="space-y-3 pt-4 border-t border-white/5">
                <button 
                  onClick={handleAction} 
                  className="w-full py-5 bg-violet-600 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl hover:bg-violet-500 transition-all active:scale-[0.98]"
                >
                  {showModal === 'add' ? 'Criar Perfil' : 'Salvar Alterações'}
                </button>
                {showModal === 'edit' && editingProfile && (
                  <button 
                    onClick={() => handleSupportRedirect('delete', editingProfile.name)}
                    className="w-full py-4 border border-red-500/20 text-red-500 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Excluir Perfil (Suporte)
                  </button>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PinEntry = ({ profile }: { profile: UserProfile | null }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!profile) navigate('/profiles');
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === profile?.pin) {
      sessionStorage.setItem('crmplus_pin_verified', 'true');
      navigate('/');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
      setPassword('');
    }
  };

  const handleForgotPin = () => {
    if (!profile) return;
    const config = JSON.parse(localStorage.getItem('crmplus_system_config') || '{"companyName": "Empresa"}');
    const message = `Olá Suporte, esqueci a senha do meu perfil "${profile.name}" na conta ${config.companyName}.`;
    window.open(`https://wa.me/5588996655443?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in zoom-in duration-500">
      <div className="mb-12 text-center space-y-6">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden mx-auto shadow-2xl border-4 border-violet-600/30">
           <img src={profile?.avatar} className="w-full h-full object-cover" alt="Perfil" />
        </div>
        <div>
          <h2 className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs mb-2">Entrar como</h2>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{profile?.name}</h1>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"}
                autoFocus
                placeholder="Digite sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full bg-[#1a1d23] border-2 px-6 py-5 rounded-2xl text-xl font-bold text-center outline-none transition-all ${error ? 'border-red-500 animate-shake text-red-500' : 'border-white/5 focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10'}`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <X size={20} /> : <ShieldCheck size={20} />}
              </button>
           </div>
           
           <button 
             type="submit" 
             disabled={!password}
             className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase text-sm tracking-widest hover:bg-violet-600 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
           >
             Acessar Perfil
           </button>
        </form>
        
        <div className="flex flex-col gap-6 items-center">
          <button 
            onClick={handleForgotPin}
            className="text-[10px] font-black uppercase text-violet-500/60 tracking-[0.3em] hover:text-violet-400 flex items-center gap-2"
          >
            <HelpCircle size={12} /> Esqueci minha senha
          </button>
          
          <button 
            onClick={() => {
              sessionStorage.removeItem('crmplus_active_profile');
              navigate('/profiles');
            }}
            className="px-6 py-3 bg-white/5 border border-white/5 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            Trocar Perfil
          </button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default { Login, ProfileSelector, PinEntry };
