
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Plus, Settings, Trash2, X, Lock, UserCircle, ArrowLeft, 
  Wrench, Utensils, FileText, LayoutGrid, Heart, ClipboardCheck, 
  Users, DollarSign, Monitor, Briefcase, Zap, Check
} from 'lucide-react';

const ICON_AVATARS = [
  { id: 'monitor', icon: <Monitor size={24}/> },
  { id: 'briefcase', icon: <Briefcase size={24}/> },
  { id: 'wrench', icon: <Wrench size={24}/> },
  { id: 'utensils', icon: <Utensils size={24}/> },
  { id: 'dollar', icon: <DollarSign size={24}/> },
  { id: 'users', icon: <Users size={24}/> },
  { id: 'zap', icon: <Zap size={24}/> },
  { id: 'shield', icon: <ShieldCheck size={24}/> },
];

const FUNCTION_PERMISSIONS = [
  { id: 'vendas', label: 'Vendas/Comercial' },
  { id: 'operacional', label: 'Operacional/Técnico' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'gestao', label: 'Gestão/Admin' },
];

const Profiles: React.FC<{ onSelect?: (p: any) => void, mode?: 'select' | 'manage' }> = ({ onSelect, mode = 'select' }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: '', functions: [] as string[], avatar: 'monitor' });

  useEffect(() => {
    const saved = sessionStorage.getItem('crmplus_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const validatePin = () => {
    if (pin === user.pin) {
      if (pendingAction.type === 'delete') {
        const updated = {...user, profiles: user.profiles.filter((p:any) => p.id !== pendingAction.id)};
        updateUser(updated);
      } else if (pendingAction.type === 'add') {
        const updated = {...user, profiles: [...user.profiles, { 
          ...newProfile, 
          id: Date.now().toString(), 
          lastAccess: new Date().toISOString(),
          role: newProfile.functions.join(', ') || 'Operador'
        }]};
        updateUser(updated);
        setShowAddModal(false);
      }
      setPin('');
      setShowPinModal(false);
    } else {
      alert('PIN incorreto');
    }
  };

  const updateUser = (updatedUser: any) => {
    setUser(updatedUser);
    sessionStorage.setItem('crmplus_user', JSON.stringify(updatedUser));
    localStorage.setItem(`crmplus_user_${updatedUser.email}`, JSON.stringify(updatedUser));
  };

  const handleSelect = (profile: any) => {
    if (mode === 'manage') return;
    sessionStorage.setItem('crmplus_profile', JSON.stringify(profile));
    if (onSelect) onSelect(profile);
    navigate('/dashboard');
  };

  const toggleFunction = (id: string) => {
    setNewProfile(prev => ({
      ...prev,
      functions: prev.functions.includes(id) 
        ? prev.functions.filter(f => f !== id) 
        : [...prev.functions, id]
    }));
  };

  const getIconById = (id: string) => ICON_AVATARS.find(a => a.id === id)?.icon || <Monitor />;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          {mode === 'select' ? 'Quem está operando?' : 'Gerenciar Perfis'}
        </h1>
        <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-[0.3em]">{user.companyName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
        {user.profiles.map((p: any) => (
          <div key={p.id} className="group relative">
            <div 
              onClick={() => handleSelect(p)}
              className={`bg-zinc-900 border-2 rounded-[2.5rem] p-10 flex flex-col items-center gap-6 cursor-pointer transition-all hover:scale-105 ${mode === 'select' ? 'border-zinc-800 hover:border-red-600' : 'border-zinc-800'}`}
            >
              <div className="w-20 h-20 bg-black border border-zinc-800 rounded-3xl flex items-center justify-center text-red-600 shadow-inner group-hover:bg-red-600 group-hover:text-white transition-colors">
                {getIconById(p.avatar || 'monitor')}
              </div>
              <div className="text-center">
                <p className="text-xl font-black uppercase tracking-tight mb-1 truncate w-40">{p.name}</p>
                <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest truncate w-40">{p.role}</p>
              </div>
            </div>
            
            {mode === 'manage' && p.id !== 'admin' && (
              <button 
                onClick={() => { setPendingAction({type: 'delete', id: p.id}); setShowPinModal(true); }}
                className="absolute top-4 right-4 p-3 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-lg"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}

        {user.profiles.length < 6 && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-zinc-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-6 text-zinc-600 hover:border-red-600 hover:text-red-600 transition-all hover:scale-105"
          >
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center">
              <Plus size={32} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">Novo Operador</p>
          </button>
        )}
      </div>

      {mode === 'select' ? (
        <button 
          onClick={() => navigate('/account/profiles')}
          className="mt-20 flex items-center gap-3 text-zinc-500 hover:text-red-600 transition-all font-black uppercase text-[10px] tracking-widest bg-zinc-900/50 px-8 py-4 rounded-2xl border border-zinc-800"
        >
          <Settings size={16} /> Gerenciar Perfis
        </button>
      ) : (
        <button 
          onClick={() => navigate('/profiles')}
          className="mt-20 flex items-center gap-3 text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft size={16} /> Voltar à Seleção
        </button>
      )}

      {/* Modal Adicionar Perfil */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] w-full max-w-lg shadow-2xl space-y-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Novo Perfil</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-600 mb-2 ml-1">Nome do Operador</label>
                <input 
                  value={newProfile.name}
                  onChange={e => setNewProfile({...newProfile, name: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-600 mb-4 ml-1">Escolha um Ícone</label>
                <div className="grid grid-cols-4 gap-3">
                  {ICON_AVATARS.map(av => (
                    <button 
                      key={av.id}
                      onClick={() => setNewProfile({...newProfile, avatar: av.id})}
                      className={`p-4 rounded-2xl flex items-center justify-center transition-all ${newProfile.avatar === av.id ? 'bg-red-600 text-white shadow-lg' : 'bg-black border border-zinc-800 text-zinc-600'}`}
                    >
                      {av.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-600 mb-4 ml-1">Funções no Sistema</label>
                <div className="grid grid-cols-2 gap-3">
                  {FUNCTION_PERMISSIONS.map(f => (
                    <button 
                      key={f.id}
                      onClick={() => toggleFunction(f.id)}
                      className={`p-4 rounded-2xl flex items-center gap-3 border text-[10px] font-black uppercase transition-all ${newProfile.functions.includes(f.id) ? 'bg-red-600/10 border-red-600 text-red-600' : 'bg-black border-zinc-800 text-zinc-600'}`}
                    >
                      {/* Fix: Check is now correctly imported from lucide-react */}
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${newProfile.functions.includes(f.id) ? 'bg-red-600 border-red-600 text-white' : 'border-zinc-800'}`}>
                        {newProfile.functions.includes(f.id) && <Check size={10} />}
                      </div>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-xs font-black uppercase text-zinc-500">Cancelar</button>
              <button 
                onClick={() => { setPendingAction({type: 'add'}); setShowPinModal(true); }}
                className="flex-[2] bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl"
              >
                Autorizar com PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[3rem] w-full max-w-sm text-center shadow-2xl">
            <Lock size={32} className="mx-auto mb-6 text-red-600" />
            <h2 className="text-2xl font-black uppercase mb-8 tracking-tighter">Confirmar Ação</h2>
            <input 
              type="password"
              maxLength={4}
              autoFocus
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-black border-2 border-zinc-800 rounded-2xl p-5 text-4xl font-black text-center tracking-[1em] focus:border-red-600 outline-none mb-8"
            />
            <div className="flex gap-4">
              <button onClick={() => { setShowPinModal(false); setPin(''); }} className="flex-1 py-4 text-xs font-black uppercase text-zinc-500">Cancelar</button>
              <button onClick={validatePin} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiles;
