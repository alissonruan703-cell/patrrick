
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Plus, Trash2, Edit3, X, Check, Search, LogOut, Globe, UserCircle, Calendar, AlertTriangle } from 'lucide-react';
import { AccountLicense } from '../types';

const AdminMaster: React.FC = () => {
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState<AccountLicense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    companyName: '', 
    username: '', 
    password: '', 
    status: 'Ativo' as 'Ativo' | 'Bloqueado',
    expirationDate: '' 
  });

  useEffect(() => {
    const isMaster = sessionStorage.getItem('crmplus_is_master') === 'true';
    if (!isMaster) {
      navigate('/login');
      return;
    }

    const saved = localStorage.getItem('crmplus_accounts');
    if (saved) {
      setLicenses(JSON.parse(saved));
    } else {
      const initial: AccountLicense[] = [{
        id: '1',
        companyName: 'Hc Pneus',
        username: 'hcpneus',
        password: 'Volvo@24',
        status: 'Ativo',
        createdAt: new Date().toLocaleDateString('pt-BR'),
        expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      }];
      setLicenses(initial);
      localStorage.setItem('crmplus_accounts', JSON.stringify(initial));
    }
  }, []);

  const handleSave = () => {
    if (!formData.companyName || !formData.username || !formData.password || !formData.expirationDate) return;

    let updated: AccountLicense[];
    if (editingId) {
      updated = licenses.map(l => l.id === editingId ? { ...l, ...formData } : l);
    } else {
      const newLicense: AccountLicense = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      updated = [...licenses, newLicense];
    }

    setLicenses(updated);
    localStorage.setItem('crmplus_accounts', JSON.stringify(updated));
    setShowModal(false);
    setEditingId(null);
    setFormData({ companyName: '', username: '', password: '', status: 'Ativo', expirationDate: '' });
  };

  const deleteLicense = (id: string) => {
    if (window.confirm('Tem certeza que deseja apagar esta licença? Todos os dados dessa empresa serão inacessíveis.')) {
      const updated = licenses.filter(l => l.id !== id);
      setLicenses(updated);
      localStorage.setItem('crmplus_accounts', JSON.stringify(updated));
    }
  };

  const filtered = licenses.filter(l => 
    l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (date: string) => {
    const expDate = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0);
    return expDate < today;
  };

  const isCloseToExpiry = (date: string) => {
    const expDate = new Date(date);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 p-6 lg:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-violet-600 rounded-2xl shadow-2xl shadow-violet-600/20">
               <Shield size={24} className="text-white" />
             </div>
             <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Painel <span className="text-violet-500">Master</span></h1>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Gestão de Licenças e Acessos SaaS</p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              sessionStorage.clear();
              navigate('/login');
            }}
            className="px-6 py-3 bg-white/5 hover:bg-red-600/10 text-slate-500 hover:text-red-500 border border-white/5 hover:border-red-500/20 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
          >
            <LogOut size={16} /> Encerrar Sessão
          </button>
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ companyName: '', username: '', password: '', status: 'Ativo', expirationDate: '' });
              setShowModal(true);
            }}
            className="px-8 py-3 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-violet-500 transition-all shadow-xl shadow-violet-600/20 flex items-center gap-2"
          >
            <Plus size={16} strokeWidth={4} /> Nova Licença
          </button>
        </div>
      </div>

      {/* Stats & Search */}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 relative">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
           <input 
              placeholder="Pesquisar por empresa ou login..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#161920] border border-white/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:ring-2 focus:ring-violet-500/20 text-white font-bold transition-all"
           />
        </div>
        <div className="bg-[#161920] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
           <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Ativas</span>
           <span className="text-2xl font-black text-white">{licenses.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto bg-[#161920] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-8 py-6">Empresa</th>
                <th className="px-8 py-6">Login de Acesso</th>
                <th className="px-8 py-6">Senha Master</th>
                <th className="px-8 py-6">Criação</th>
                <th className="px-8 py-6">Expiração</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(l => {
                const expired = isExpired(l.expirationDate);
                const closeToExpiry = isCloseToExpiry(l.expirationDate);
                
                return (
                  <tr key={l.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-500 font-black">
                           {l.companyName[0].toUpperCase()}
                         </div>
                         <span className="text-white font-black uppercase text-sm tracking-tight">{l.companyName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <code className="bg-black/40 px-3 py-1.5 rounded-lg text-emerald-400 font-bold text-xs">{l.username}</code>
                    </td>
                    <td className="px-8 py-6">
                      <code className="bg-black/40 px-3 py-1.5 rounded-lg text-violet-400 font-bold text-xs">{l.password}</code>
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-500 font-bold">{l.createdAt}</td>
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-2 font-mono text-xs font-bold ${expired ? 'text-red-500' : closeToExpiry ? 'text-amber-500' : 'text-slate-400'}`}>
                         <Calendar size={14} className="opacity-50" />
                         {formatDate(l.expirationDate)}
                         {expired && <AlertTriangle size={14} className="animate-pulse" />}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${l.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                          onClick={() => {
                            setEditingId(l.id);
                            setFormData({ 
                              companyName: l.companyName, 
                              username: l.username, 
                              password: l.password, 
                              status: l.status,
                              expirationDate: l.expirationDate || ''
                            });
                            setShowModal(true);
                          }}
                          className="p-2 text-slate-600 hover:text-white transition-colors"
                         >
                           <Edit3 size={18} />
                         </button>
                         <button 
                          onClick={() => deleteLicense(l.id)}
                          className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                         >
                           <Trash2 size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="p-4 bg-white/5 rounded-full text-slate-700">
                         <Globe size={40} />
                       </div>
                       <p className="text-slate-600 font-black uppercase text-xs tracking-widest">Nenhuma licença encontrada</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Licença */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-[#1a1d23] border border-white/10 rounded-[2.5rem] p-10 space-y-8 relative shadow-[0_0_100px_rgba(139,92,246,0.1)]">
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-600 hover:text-white"><X size={24}/></button>
              
              <div className="text-center space-y-2">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">{editingId ? 'Ajustar Licença' : 'Emitir Nova Licença'}</h3>
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Controle de credenciais master da conta</p>
              </div>

              <div className="space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Nome da Empresa / Cliente</label>
                    <input 
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-violet-500/20 uppercase"
                      placeholder="Ex: Hc Pneus"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Login (Usuário)</label>
                        <input 
                          value={formData.username}
                          onChange={e => setFormData({...formData, username: e.target.value})}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-violet-500/20"
                          placeholder="hcpneus"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Senha Master</label>
                        <input 
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-violet-500/20"
                          placeholder="Volvo@24"
                        />
                    </div>
                 </div>
                 
                 {/* Novo campo: Data de Expiração */}
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Data de Expiração da Licença</label>
                    <div className="relative">
                       <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500 opacity-50" size={18} />
                       <input 
                         type="date"
                         value={formData.expirationDate}
                         onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                         className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-violet-500/20"
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Status da Licença</label>
                    <div className="flex gap-4">
                       {['Ativo', 'Bloqueado'].map(s => (
                         <button 
                          key={s}
                          onClick={() => setFormData({...formData, status: s as any})}
                          className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border transition-all ${formData.status === s ? 'bg-violet-600 border-violet-500 text-white shadow-lg' : 'bg-black/40 border-white/5 text-slate-600 hover:text-slate-400'}`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="pt-4">
                 <button 
                  onClick={handleSave}
                  className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase text-[11px] tracking-widest hover:bg-violet-600 hover:text-white transition-all shadow-xl active:scale-95"
                 >
                   {editingId ? 'Salvar Alterações' : 'Confirmar e Ativar'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaster;
