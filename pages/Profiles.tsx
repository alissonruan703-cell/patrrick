
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, Settings, Trash2, X, Lock, UserCircle, ArrowLeft } from 'lucide-react';

const Profiles: React.FC<{ onSelect?: (p: any) => void, mode?: 'select' | 'manage' }> = ({ onSelect, mode = 'select' }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: '', role: 'Operador' });

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
        const updated = {...user, profiles: [...user.profiles, { ...newProfile, id: Date.now().toString(), lastAccess: 'Nunca', permissions: [] }]};
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          {mode === 'select' ? 'Quem está operando?' : 'Gerenciar Perfis'}
        </h1>
        <p className="text-zinc-600 font-bold uppercase text-xs tracking-widest">{user.companyName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
        {user.profiles.map((p: any) => (
          <div key={p.id} className="group relative">
            <div 
              onClick={() => handleSelect(p)}
              className={`bg-zinc-900 border-2 rounded-[3rem] p-10 flex flex-col items-center gap-6 cursor-pointer transition-all hover:scale-105 ${mode === 'select' ? 'border-zinc-800 hover:border-red-600' : 'border-zinc-800'}`}
            >
              <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                <UserCircle size={48} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-xl font-black uppercase tracking-tight mb-1">{p.name}</p>
                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{p.role}</p>
              </div>
            </div>
            
            {mode === 'manage' && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => { setPendingAction({type: 'delete', id: p.id}); setShowPinModal(true); }}
                  className="p-3 bg-black border border-zinc-800 rounded-2xl text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}

        {user.profiles.length < 4 && (
          <button 
            onClick={() => { setShowAddModal(true); }}
            className="border-2 border-dashed border-zinc-800 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 text-zinc-600 hover:border-red-600 hover:text-red-600 transition-all hover:scale-105"
          >
            <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center">
              <Plus size={32} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest">Novo Perfil</p>
          </button>
        )}
      </div>

      {/* Corrected ternary operator syntax: replaced && with ? */}
      {mode === 'select' ? (
        <button 
          onClick={() => navigate('/account/profiles')}
          className="mt-20 flex items-center gap-3 text-zinc-500 hover:text-red-600 transition-all font-black uppercase text-[10px] tracking-widest"
        >
          <Settings size={16} /> Gerenciar Perfis
        </button>
      ) : (
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-20 flex items-center gap-3 text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[3rem] w-full max-w-sm text-center shadow-2xl">
            <Lock size={32} className="mx-auto mb-6 text-red-600" />
            <h2 className="text-2xl font-black uppercase mb-2">Segurança</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-8">Digite seu PIN de 4 dígitos</p>
            <input 
              type="password"
              maxLength={4}
              autoFocus
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-black border-2 border-zinc-800 rounded-2xl p-5 text-4xl font-black text-center tracking-[1em] focus:border-red-600 outline-none mb-8"
            />
            <div className="flex gap-4">
              <button onClick={() => setShowPinModal(false)} className="flex-1 py-4 text-xs font-black uppercase text-zinc-500">Cancelar</button>
              <button onClick={validatePin} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Validar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase">Novo Perfil</h2>
              <button onClick={() => setShowAddModal(false)}><X size={24} /></button>
            </div>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1 ml-1">Nome do Perfil</label>
                <input 
                  type="text"
                  value={newProfile.name}
                  onChange={e => setNewProfile({...newProfile, name: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1 ml-1">Função</label>
                <select 
                  value={newProfile.role}
                  onChange={e => setNewProfile({...newProfile, role: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600 outline-none"
                >
                  <option>Operador</option>
                  <option>Gestor</option>
                  <option>Atendimento</option>
                  <option>Financeiro</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => { setPendingAction({type: 'add'}); setShowPinModal(true); }}
              className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm"
            >
              Confirmar com PIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiles;
