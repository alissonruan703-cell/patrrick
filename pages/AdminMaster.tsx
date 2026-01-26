
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Plus, Trash2, Edit3, X, Check, Search, LogOut, Globe, UserCircle, Calendar, AlertTriangle, Mail, LayoutGrid } from 'lucide-react';
import { AccountLicense } from '../types';

const AdminMaster: React.FC = () => {
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState<AccountLicense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    fullName: '', 
    companyName: '', 
    username: '', 
    password: '', 
    email: '',
    status: 'Ativo' as 'Ativo' | 'Bloqueado',
    expirationDate: '',
    allowedModules: ['oficina'] as string[]
  });

  const availableModules = [
    { id: 'oficina', name: 'Oficina Pro+' },
    { id: 'orcamento', name: 'Vendas Plus' },
    { id: 'restaurante', name: 'Gastro Hub' },
    { id: 'config', name: 'Configurações' }
  ];

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
        fullName: 'Responsável HC',
        companyName: 'Hc Pneus',
        username: 'hcpneus',
        password: 'Volvo@24',
        email: 'contato@hcpneus.com',
        status: 'Ativo',
        createdAt: new Date().toLocaleDateString('pt-BR'),
        expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        allowedModules: ['oficina', 'config']
      }];
      setLicenses(initial);
      localStorage.setItem('crmplus_accounts', JSON.stringify(initial));
    }
  }, []);

  const handleSave = () => {
    if (!formData.fullName || !formData.companyName || !formData.username || !formData.password || !formData.expirationDate || !formData.email) return;

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
    setFormData({ fullName: '', companyName: '', username: '', password: '', email: '', status: 'Ativo', expirationDate: '', allowedModules: ['oficina'] });
  };

  const toggleModule = (id: string) => {
    setFormData(prev => ({
      ...prev,
      allowedModules: prev.allowedModules.includes(id) 
        ? prev.allowedModules.filter(m => m !== id)
        : [...prev.allowedModules, id]
    }));
  };

  const deleteLicense = (id: string) => {
    if (window.confirm('Tem certeza? Isso apaga o acesso da empresa.')) {
      const updated = licenses.filter(l => l.id !== id);
      setLicenses(updated);
      localStorage.setItem('crmplus_accounts', JSON.stringify(updated));
    }
  };

  const filtered = licenses.filter(l => 
    l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Gestão <span className="text-violet-500">SaaS</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Administrador Master do Ecossistema</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="px-6 py-3 bg-white/5 text-slate-500 rounded-xl font-black uppercase text-[10px]">Sair</button>
          <button 
            onClick={() => { setEditingId(null); setShowModal(true); }}
            className="px-8 py-3 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-violet-600/20"
          >
            Nova Licença
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-[#161920] rounded-3xl border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black/20 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-8 py-6">Empresa / Modulos</th>
              <th className="px-8 py-6">Acesso</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(l => (
              <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-white font-black uppercase text-sm">{l.companyName}</span>
                    <div className="flex gap-1">
                      {l.allowedModules?.map(m => (
                        <span key={m} className="bg-violet-600/10 text-violet-500 text-[8px] font-black px-2 py-0.5 rounded uppercase">{m}</span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex flex-col text-xs">
                      <span className="text-emerald-400 font-bold">{l.username}</span>
                      <span className="text-slate-500 font-mono">{l.password}</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${l.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{l.status}</span>
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex justify-end gap-2">
                      <button onClick={() => {
                        setEditingId(l.id);
                        setFormData({ ...l });
                        setShowModal(true);
                      }} className="p-2 text-slate-500 hover:text-white"><Edit3 size={18}/></button>
                      <button onClick={() => deleteLicense(l.id)} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={18}/></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-[#1a1d23] border border-white/10 rounded-[2.5rem] p-10 space-y-8 relative overflow-y-auto max-h-[90vh]">
              <div className="text-center">
                 <h3 className="text-2xl font-black text-white uppercase">{editingId ? 'Editar' : 'Emitir'} Licença</h3>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Empresa</label>
                      <input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Responsável</label>
                      <input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" />
                   </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Email</label>
                    <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Usuário</label>
                      <input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Senha</label>
                      <input value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" />
                   </div>
                 </div>

                 <div className="space-y-3 p-4 bg-black/40 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><LayoutGrid size={14}/> Módulos Liberados</p>
                    <div className="grid grid-cols-2 gap-2">
                       {availableModules.map(m => (
                         <button 
                          key={m.id}
                          onClick={() => toggleModule(m.id)}
                          className={`p-3 rounded-xl border text-[9px] font-black uppercase transition-all ${formData.allowedModules.includes(m.id) ? 'bg-violet-600 border-violet-500 text-white' : 'bg-transparent border-white/5 text-slate-500'}`}
                         >
                           {m.name}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Expiração</label>
                    <input type="date" value={formData.expirationDate} onChange={e => setFormData({...formData, expirationDate: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" />
                 </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 text-slate-500 rounded-xl font-black uppercase text-[10px]">Cancelar</button>
                 <button onClick={handleSave} className="flex-1 py-4 bg-violet-600 text-white rounded-xl font-black uppercase text-[10px]">Salvar Licença</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaster;
