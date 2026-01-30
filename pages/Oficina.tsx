
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, X, Trash2, Calendar, ArrowLeft, Zap, User, Car, Phone, Hash, ClipboardList, Package, Wrench, DollarSign, Share2, Check, AlertCircle, Clock, Bell, ChevronRight, CheckCircle2, Image as ImageIcon, Camera, AlertTriangle, UserPlus, FileText, Tag, Receipt } from 'lucide-react';
import { ServiceOrder, ServiceItem, UserProfile, LogEntry, SystemConfig } from '../types';

type OficinaTab = 'ativos' | 'historico' | 'nova';

const Oficina: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<OficinaTab>('ativos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [config, setConfig] = useState<SystemConfig>({ companyName: 'CRMPLUS', companyLogo: '' });
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [osToDelete, setOsToDelete] = useState<string | null>(null);
  
  const [newOS, setNewOS] = useState<Partial<ServiceOrder>>({ 
    clientName: '', phone: '', vehicle: '', plate: '', description: '', items: [], status: 'Aberto' 
  });
  
  const [newItem, setNewItem] = useState<Partial<ServiceItem>>({ 
    type: 'PEÇA', description: '', quantity: 1, price: 0 
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasPermission = (permission: string) => activeProfile?.actions?.includes(permission) || false;

  const getStatusColorClasses = (status: string) => {
    switch (status) {
      case 'Orçamento': return 'bg-yellow-500/5 border-yellow-500/20 text-yellow-200/70';
      case 'Execução': return 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200/70';
      case 'Reprovado': return 'bg-red-500/5 border-red-500/20 text-red-200/70';
      case 'Pronto': return 'bg-cyan-500/5 border-cyan-500/20 text-cyan-200/70';
      case 'Entregue': return 'bg-blue-500/5 border-blue-500/20 text-blue-200/70';
      default: return 'bg-white/[0.02] border-white/10 text-slate-300';
    }
  };

  const loadData = () => {
    const savedOrders = localStorage.getItem('crmplus_oficina_orders');
    const parsedOrders = savedOrders ? JSON.parse(savedOrders) : [];
    setOrders(parsedOrders);
    const savedConfig = localStorage.getItem('crmplus_system_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    const savedProfile = sessionStorage.getItem('crmplus_active_profile');
    if (savedProfile) setActiveProfile(JSON.parse(savedProfile));
    
    const osIdFromUrl = searchParams.get('id');
    if (osIdFromUrl) { 
      const found = parsedOrders.find((o: any) => String(o.id) === String(osIdFromUrl)); 
      if (found) { setSelectedOS(found); setView('detalhes'); setSearchParams({}, { replace: true }); } 
    }
  };

  useEffect(() => { loadData(); window.addEventListener('storage', loadData); return () => window.removeEventListener('storage', loadData); }, [searchParams]);

  const saveOrders = (updated: ServiceOrder[]) => { 
    setOrders(updated); 
    localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updated)); 
    window.dispatchEvent(new Event('storage')); 
  };

  const addLog = (action: string, details: string) => {
    if (!activeProfile) return;
    const logs = JSON.parse(localStorage.getItem('crmplus_logs') || '[]');
    const newLog: LogEntry = { 
      id: Date.now().toString(), 
      timestamp: new Date().toLocaleString('pt-BR'), 
      userId: activeProfile.id, 
      userName: activeProfile.name, 
      action, 
      details, 
      system: 'OFICINA' 
    };
    localStorage.setItem('crmplus_logs', JSON.stringify([newLog, ...logs].slice(0, 1000)));
  };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('create_os')) { setFormError("Sem permissão."); return; }
    if (!newOS.clientName || !newOS.vehicle || !newOS.plate) { setFormError("Campos obrigatórios."); return; }
    const os: ServiceOrder = { 
      ...newOS as ServiceOrder, 
      id: Date.now().toString(), 
      createdAt: new Date().toLocaleDateString('pt-BR'), 
      items: [], 
      photos: [], 
      total: 0, 
      status: 'Aberto' 
    };
    saveOrders([os, ...orders]);
    addLog('CREATE_OS', `Nova O.S. #${os.id.slice(-4)} aberta para ${os.clientName}`);
    setNewOS({ clientName: '', phone: '', vehicle: '', plate: '', description: '', items: [], status: 'Aberto' });
    setActiveTab('ativos'); setView('lista');
  };

  const handleUpdateStatus = (id: string, newStatus: ServiceOrder['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    saveOrders(updated);
    addLog('UPDATE_STATUS', `O.S. #${id.slice(-4)} alterada para ${newStatus}`);
    if (selectedOS?.id === id) setSelectedOS({ ...selectedOS, status: newStatus });
  };

  const handleDeleteOS = (id: string) => {
    if (!hasPermission('delete_os')) return;
    const updated = orders.filter(o => o.id !== id);
    saveOrders(updated);
    addLog('DELETE_OS', `O.S. #${id.slice(-4)} excluída permanentemente`);
    setOsToDelete(null);
    setSelectedOS(null);
    setView('lista');
  };

  const handleAddItem = () => {
    if (!selectedOS || !newItem.description || (newItem.price || 0) <= 0) return;
    
    const item: ServiceItem = { 
      ...newItem as ServiceItem, 
      id: Date.now().toString(), 
      brand: '',
      timestamp: new Date().toISOString() 
    };
    
    const updatedItems = [...(selectedOS.items || []), item];
    const newTotal = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    
    const updatedOS = { ...selectedOS, items: updatedItems, total: newTotal };
    saveOrders(orders.map(o => o.id === selectedOS.id ? updatedOS : o));
    setSelectedOS(updatedOS);
    addLog('ADD_ITEM', `Adicionado ${item.type}: ${item.description} na O.S. #${selectedOS.id.slice(-4)}`);
    
    setNewItem({ type: newItem.type, description: '', quantity: 1, price: 0 });
  };

  const removeItem = (itemId: string) => {
    if (!selectedOS) return;
    const updatedItems = selectedOS.items.filter(i => i.id !== itemId);
    const newTotal = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const updatedOS = { ...selectedOS, items: updatedItems, total: newTotal };
    saveOrders(orders.map(o => o.id === selectedOS.id ? updatedOS : o));
    setSelectedOS(updatedOS);
  };

  const copyLink = (os: ServiceOrder) => {
    const payload = { 
      i: os.id, n: os.clientName, v: os.vehicle, p: os.plate, d: os.description, 
      t: os.total, dt: os.createdAt, cn: config.companyName, ph: os.photos || [], 
      it: (os.items || []).map(i => ({ t: i.type[0], d: i.description, q: i.quantity, p: i.price })) 
    };
    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#/v/${base64}`);
    setCopyFeedback(true); setTimeout(() => setCopyFeedback(false), 2000);
  };

  const filteredOrders = useMemo(() => orders.filter(o => {
    const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.plate.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter !== 'Todos' && o.status !== statusFilter) return false;
    if (activeTab === 'ativos' && (o.status === 'Entregue' || o.status === 'Reprovado')) return false;
    if (activeTab === 'historico' && (o.status !== 'Entregue' && o.status !== 'Reprovado')) return false;
    return matchesSearch;
  }), [orders, searchTerm, activeTab, statusFilter]);

  return (
    <div className="pt-24 px-6 lg:px-12 max-w-screen-2xl mx-auto space-y-10 pb-20">
      
      {/* Modal de Confirmação de Exclusão */}
      {osToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-[#0a0a0b] border border-red-500/20 rounded-[3rem] p-10 space-y-8 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 blur-[60px] rounded-full"></div>
              <div className="w-20 h-20 bg-red-600/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Apagar Registro?</h3>
                <p className="text-slate-400 text-sm leading-relaxed uppercase font-bold tracking-tight px-4">
                  Esta ação é irreversível. Todos os dados desta Ordem de Serviço serão deletados permanentemente.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setOsToDelete(null)} className="flex-1 py-5 bg-white/5 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">Cancelar</button>
                <button onClick={() => handleDeleteOS(osToDelete)} className="flex-1 py-5 bg-red-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all">Sim, Deletar</button>
              </div>
           </div>
        </div>
      )}

      {/* Header Oficina */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-8 bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-5">
             <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]"><Wrench size={24} /></div>
             <div><h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-1">{config.companyName}</h2><h1 className="text-3xl font-black text-white uppercase tracking-tighter">OFICINA <span className="text-cyan-400">PRO+</span></h1></div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => { setActiveTab('ativos'); setView('lista'); setSelectedOS(null); }} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'ativos' && !selectedOS ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-300 hover:bg-white/10'}`}>Operacional</button>
             <button onClick={() => { setActiveTab('historico'); setView('lista'); setSelectedOS(null); }} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'historico' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-300 hover:bg-white/10'}`}>Histórico</button>
          </div>
        </div>
        <button onClick={() => { setView('lista'); setActiveTab('nova'); setSelectedOS(null); }} className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-3"><Plus size={18} strokeWidth={4} /> Nova O.S.</button>
      </div>

      {activeTab === 'nova' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5">
          <button onClick={() => setActiveTab('ativos')} className="flex items-center gap-3 text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-all"><ArrowLeft size={18} /> Cancelar</button>
          <form onSubmit={handleCreateOS} className="bg-white/[0.03] border border-white/10 p-10 lg:p-14 rounded-[3.5rem] space-y-10 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 blur-[80px] rounded-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cliente</label>
                <input required value={newOS.clientName} onChange={e => setNewOS({...newOS, clientName: e.target.value})} placeholder="Nome Completo" className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/20 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Veículo / Modelo</label>
                <input required value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} placeholder="Ex: Corolla 2023" className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/20 font-bold uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Placa</label>
                <input required value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value})} placeholder="ABC-1234" className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/20 font-black tracking-widest text-center text-xl uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp / Contato</label>
                <input value={newOS.phone} onChange={e => setNewOS({...newOS, phone: e.target.value})} placeholder="(00) 00000-0000" className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/20 font-bold" />
              </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Relato / Sintomas</label>
                <textarea value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} rows={3} placeholder="Descreva os problemas relatados pelo cliente..." className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium resize-none" />
              </div>
            <button type="submit" className="w-full py-6 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-black rounded-[2rem] uppercase text-[12px] tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all">Gerar Ordem de Serviço</button>
          </form>
        </div>
      )}

      {view === 'lista' && activeTab !== 'nova' && !selectedOS && (
        <>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={20} />
              <input placeholder="Filtrar por placa ou cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-white font-bold outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-lg" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl px-8 py-5 text-white font-black uppercase text-[10px] tracking-widest outline-none shadow-lg">
               {['Todos', 'Aberto', 'Orçamento', 'Execução', 'Pronto', 'Entregue', 'Reprovado'].map(s => <option key={s} value={s} className="bg-[#0a0a0b]">{s}</option>)}
            </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredOrders.map(o => (
              <div key={o.id} onClick={() => { setSelectedOS(o); setView('detalhes'); }} className={`p-8 rounded-[2.5rem] border backdrop-blur-2xl flex flex-col justify-between min-h-[250px] shadow-xl hover:border-cyan-500/40 cursor-pointer relative group/card transition-all duration-500 ${getStatusColorClasses(o.status)}`}>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black font-mono tracking-tighter opacity-40">#{o.id.slice(-4)}</span>
                    <div className="flex gap-2">
                       <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase bg-black/20 border border-white/5">{o.status}</span>
                       {hasPermission('delete_os') && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); setOsToDelete(o.id); }}
                            className="p-1.5 bg-red-600/10 text-red-500 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-600 hover:text-white"
                         >
                            <Trash2 size={14}/>
                         </button>
                       )}
                    </div>
                  </div>
                  <h3 className="text-xl font-black uppercase truncate tracking-tight">{o.clientName}</h3>
                  <div className="flex items-center gap-2 text-white/40"><Car size={14}/><p className="text-[11px] font-black uppercase tracking-tight">{o.vehicle} <span className="text-white">| {o.plate}</span></p></div>
                </div>
                <div className="pt-6 border-t border-white/10 flex items-center justify-between font-black">
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-widest opacity-40">Valor Total</span>
                    <span className="text-lg">R$ {o.total.toFixed(2)}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl group-hover/card:bg-cyan-500 group-hover/card:text-black transition-all"><ChevronRight size={18}/></div>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="col-span-full py-32 text-center opacity-10 space-y-4 border-2 border-dashed border-white/10 rounded-[3rem]">
                <Clock size={48} className="mx-auto" />
                <p className="text-[12px] font-black uppercase tracking-[0.4em]">Nenhuma ordem encontrada</p>
              </div>
            )}
          </div>
        </>
      )}

      {view === 'detalhes' && selectedOS && (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
             <button onClick={() => { setView('lista'); setSelectedOS(null); }} className="flex items-center gap-3 text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-widest group transition-all"><ArrowLeft size={18} className="group-hover:-translate-x-1" /> Lista de Atendimentos</button>
             <div className="flex items-center gap-3">
               {hasPermission('delete_os') && (
                 <button onClick={() => setOsToDelete(selectedOS.id)} className="p-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl" title="Deletar OS">
                    <Trash2 size={20}/>
                 </button>
               )}
               <button onClick={() => copyLink(selectedOS)} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-cyan-400 transition-all shadow-xl">{copyFeedback ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Share2 size={18}/>} Compartilhar Orçamento</button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar Detalhes */}
            <div className="lg:col-span-4 space-y-8">
              <div className={`border p-10 rounded-[3.5rem] backdrop-blur-3xl space-y-8 shadow-2xl transition-all duration-500 relative overflow-hidden ${getStatusColorClasses(selectedOS.status)}`}>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full"></div>
                 <div className="flex justify-between items-start relative z-10">
                    <h2 className="text-4xl font-black uppercase tracking-tighter">#{selectedOS.id.slice(-4)}</h2>
                    <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase bg-black/20 border border-white/5">{selectedOS.status}</span>
                 </div>
                 <div className="space-y-6 relative z-10">
                    <div><p className="text-[9px] font-black opacity-40 uppercase tracking-[0.2em] mb-1">Dono do Veículo</p><p className="text-xl font-black flex items-center gap-3"><User size={20} className="text-cyan-400"/> {selectedOS.clientName}</p></div>
                    <div><p className="text-[9px] font-black opacity-40 uppercase tracking-[0.2em] mb-1">Informações Técnicas</p><p className="text-xl font-black uppercase flex items-center gap-3"><Car size={20} className="text-cyan-400"/> {selectedOS.vehicle}</p><p className="font-black tracking-[0.2em] text-lg font-mono opacity-80 mt-1 ml-8">{selectedOS.plate}</p></div>
                    <div className="p-5 bg-black/30 rounded-2xl border border-white/5"><p className="text-[8px] font-black opacity-40 uppercase tracking-[0.2em] mb-2">Relato do Cliente</p><p className="text-xs text-slate-300 italic">"{selectedOS.description}"</p></div>
                 </div>
              </div>

              {/* Seletor de Status */}
              <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-[3.5rem] space-y-6 shadow-xl">
                 <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3"><Receipt size={16} className="text-cyan-400"/> Atualizar Status</h4>
                 <div className="grid grid-cols-2 gap-3">
                   {['Aberto', 'Orçamento', 'Execução', 'Pronto', 'Entregue', 'Reprovado'].map(st => (
                     <button key={st} onClick={() => handleUpdateStatus(selectedOS.id, st as any)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedOS.status === st ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-black/40 border-white/5 text-slate-500 hover:text-white'}`}>{st}</button>
                   ))}
                 </div>
              </div>
            </div>

            {/* Main Lançamentos */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white/[0.02] border border-white/10 p-10 lg:p-14 rounded-[4rem] space-y-12 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-600/5 blur-[120px] rounded-full"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">Orçamento <span className="text-cyan-400">Geral</span></h3>
                   <div className="text-right bg-gradient-to-br from-black/60 to-black/20 px-10 py-6 rounded-[2.5rem] border border-cyan-500/20 shadow-inner">
                     <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1">Valor Total Acumulado</p>
                     <p className="text-5xl font-black text-white tracking-tighter">R$ {selectedOS.total.toFixed(2)}</p>
                   </div>
                </div>

                {/* Form de Lançamento Profissional */}
                <div className="bg-white/[0.03] p-10 rounded-[3rem] border border-white/10 space-y-8 relative z-10">
                  <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => setNewItem({...newItem, type: 'PEÇA'})} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border flex items-center justify-center gap-3 transition-all ${newItem.type === 'PEÇA' ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-black/40 border-white/5 text-slate-500 hover:text-white'}`}><Package size={16}/> Peça</button>
                    <button onClick={() => setNewItem({...newItem, type: 'MÃO DE OBRA'})} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border flex items-center justify-center gap-3 transition-all ${newItem.type === 'MÃO DE OBRA' ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/20' : 'bg-black/40 border-white/5 text-slate-500 hover:text-white'}`}><Wrench size={16}/> Serviço</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    <div className="md:col-span-3 space-y-2">
                       <label className="text-[8px] font-black text-slate-500 uppercase ml-1">Descrição do Item</label>
                       <input 
                         value={newItem.description} 
                         onChange={e => setNewItem({...newItem, description: e.target.value})} 
                         placeholder={newItem.type === 'PEÇA' ? "Ex: Pastilha de Freio Dianteira" : "Ex: Troca de Óleo e Filtros"} 
                         className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-white font-bold text-xs focus:ring-2 focus:ring-cyan-500/20 outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-slate-500 uppercase ml-1">Quantidade</label>
                       <input 
                         type="number" 
                         min="1" 
                         value={newItem.quantity} 
                         onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})} 
                         className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-white font-black text-center text-xs focus:ring-2 focus:ring-cyan-500/20 outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-slate-500 uppercase ml-1">Valor Unitário</label>
                       <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">R$</span>
                         <input 
                           type="number" 
                           value={newItem.price} 
                           onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} 
                           className="w-full bg-black/60 border border-white/10 p-4 pl-9 rounded-xl text-white font-bold text-xs focus:ring-2 focus:ring-cyan-500/20 outline-none" 
                         />
                       </div>
                    </div>
                    <div className="flex items-end">
                      <button onClick={handleAddItem} className="w-full h-[52px] bg-white text-black font-black rounded-xl uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all flex items-center justify-center gap-2">
                        <Plus size={16} strokeWidth={4} /> Incluir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabela de Itens Separada */}
                <div className="overflow-hidden border border-white/10 rounded-[2.5rem] bg-black/20 relative z-10">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10">
                      <tr>
                        <th className="px-8 py-6">Tipo</th>
                        <th className="px-8 py-6">Descrição</th>
                        <th className="px-8 py-6 text-center">Qtd</th>
                        <th className="px-8 py-6 text-right">Unitário</th>
                        <th className="px-8 py-6 text-right">Subtotal</th>
                        <th className="px-8 py-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedOS.items.length > 0 ? selectedOS.items.map(item => (
                        <tr key={item.id} className="hover:bg-white/[0.02] text-xs font-bold text-white transition-all group">
                          <td className="px-8 py-5">
                            <div className={`p-2 rounded-lg inline-flex items-center justify-center ${item.type === 'PEÇA' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-violet-600/10 text-violet-400'}`}>
                              {item.type === 'PEÇA' ? <Package size={14}/> : <Wrench size={14}/>}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-black uppercase tracking-tight">{item.description}</td>
                          <td className="px-8 py-5 text-center font-mono opacity-60">x{item.quantity}</td>
                          <td className="px-8 py-5 text-right font-mono text-slate-400">R$ {item.price.toFixed(2)}</td>
                          <td className="px-8 py-5 text-right font-black text-cyan-400 text-sm">R$ {(item.price * item.quantity).toFixed(2)}</td>
                          <td className="px-8 py-5 text-right">
                             <button onClick={() => removeItem(item.id)} className="p-2 text-slate-800 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-8 py-20 text-center opacity-20 italic text-[10px] font-black uppercase tracking-widest">Aguardando lançamento de itens...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {selectedOS.items.length > 0 && (
                    <div className="bg-white/[0.03] px-10 py-6 flex justify-between items-center border-t border-white/10">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resumo do Orçamento</span>
                       <div className="flex gap-10">
                          <div className="text-right">
                             <p className="text-[8px] font-black text-slate-600 uppercase">Peças</p>
                             <p className="text-sm font-black text-white">R$ {selectedOS.items.filter(i => i.type === 'PEÇA').reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-black text-slate-600 uppercase">Mão de Obra</p>
                             <p className="text-sm font-black text-white">R$ {selectedOS.items.filter(i => i.type === 'MÃO DE OBRA').reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</p>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;
