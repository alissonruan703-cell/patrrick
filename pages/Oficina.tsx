
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Search, X, Send, Trash2,
  Calendar, FileText, ArrowLeft, ChevronDown, Zap, User, Car, Phone, Hash, ClipboardList, Package, Wrench, DollarSign, Share2, Check, AlertCircle, Clock, ShieldAlert, ImagePlus, Camera, Eye, Bell, ChevronRight, MoreHorizontal
} from 'lucide-react';
import { ServiceOrder, ServiceItem, UserProfile, LogEntry } from '../types';

type OficinaTab = 'ativos' | 'historico' | 'nova';

const Oficina: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OficinaTab>('ativos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [quickStatusId, setQuickStatusId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasPermission = (permission: string) => {
    return activeProfile?.actions?.includes(permission) || false;
  };

  const addLog = (action: string, details: string) => {
    if (!activeProfile) return;
    const logs = JSON.parse(localStorage.getItem('crmplus_logs') || '[]');
    const newLog: LogEntry = { id: Date.now().toString(), timestamp: new Date().toLocaleString(), userId: activeProfile.id, userName: activeProfile.name, action, details, system: 'OFICINA' };
    localStorage.setItem('crmplus_logs', JSON.stringify([newLog, ...logs].slice(0, 1000)));
  };

  const loadData = () => {
    const savedOrders = localStorage.getItem('crmplus_oficina_orders');
    const parsedOrders = savedOrders ? JSON.parse(savedOrders) : [];
    setOrders(parsedOrders);
    
    if (selectedOS) {
      const updated = parsedOrders.find((o: any) => o.id === selectedOS.id);
      if (updated && updated.status !== selectedOS.status) {
        setSelectedOS(updated);
      }
    }

    const savedProfile = sessionStorage.getItem('crmplus_active_profile');
    if (savedProfile) setActiveProfile(JSON.parse(savedProfile));
  };

  useEffect(() => { 
    loadData(); 
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [selectedOS?.id, selectedOS?.status]);

  const saveOrders = (updated: ServiceOrder[]) => {
    setOrders(updated);
    localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('create_os')) { setFormError("Seu perfil não tem permissão para criar O.S."); return; }
    if (!newOS.clientName || !newOS.vehicle || !newOS.plate) { setFormError("Preencha ao menos: Cliente, Veículo e Placa."); return; }
    
    const os: ServiceOrder = {
      ...newOS as ServiceOrder,
      id: (orders.length + 101).toString(),
      createdAt: new Date().toLocaleDateString('pt-BR'),
      items: [],
      photos: [],
      total: 0,
      status: 'Aberto'
    };

    const updated = [os, ...orders];
    saveOrders(updated);
    addLog('CREATE_OS', `Nova O.S. #${os.id} para ${os.clientName}`);
    setNewOS({ clientName: '', phone: '', vehicle: '', plate: '', description: '', items: [], status: 'Aberto' });
    setFormError(null);
    setActiveTab('ativos');
  };

  const handleUpdateStatus = (id: string, newStatus: ServiceOrder['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    saveOrders(updated);
    if (selectedOS?.id === id) setSelectedOS({ ...selectedOS, status: newStatus });
    setQuickStatusId(null);
    addLog('UPDATE_STATUS', `O.S. #${id} -> ${newStatus}`);
  };

  const handleDeleteOS = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!hasPermission('delete_os')) return;
    if (!window.confirm('Excluir esta O.S. permanentemente?')) return;
    const updated = orders.filter(o => o.id !== id);
    saveOrders(updated);
    addLog('DELETE_OS', `O.S. #${id} removida`);
    if (selectedOS?.id === id) {
      setView('lista');
      setSelectedOS(null);
    }
  };

  const handleAddItem = () => {
    if (!hasPermission('edit_os')) return;
    if (!newItem.description || !newItem.price || !selectedOS) return;
    const item: ServiceItem = { ...newItem as ServiceItem, id: Date.now().toString(), timestamp: new Date().toISOString() };
    const updatedItems = [...(selectedOS.items || []), item];
    const newTotal = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    
    const updatedOS = { ...selectedOS, items: updatedItems, total: newTotal };
    const updatedOrders = orders.map(o => o.id === selectedOS.id ? updatedOS : o);
    
    setSelectedOS(updatedOS);
    saveOrders(updatedOrders);
    setNewItem({ type: 'PEÇA', description: '', brand: '', quantity: 1, price: 0 });
    addLog('ADD_ITEM', `Item "${item.description}" -> O.S. #${selectedOS.id}`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOS) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const updatedPhotos = [...(selectedOS.photos || []), base64];
      const updatedOS = { ...selectedOS, photos: updatedPhotos };
      const updatedOrders = orders.map(o => o.id === selectedOS.id ? updatedOS : o);
      
      setSelectedOS(updatedOS);
      saveOrders(updatedOrders);
      addLog('ADD_PHOTO', `Foto anexada à O.S. #${selectedOS.id}`);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    if (!selectedOS) return;
    const updatedPhotos = (selectedOS.photos || []).filter((_, i) => i !== index);
    const updatedOS = { ...selectedOS, photos: updatedPhotos };
    const updatedOrders = orders.map(o => o.id === selectedOS.id ? updatedOS : o);
    setSelectedOS(updatedOS);
    saveOrders(updatedOrders);
  };

  const copyLink = (os: ServiceOrder) => {
    const config = JSON.parse(localStorage.getItem('crmplus_system_config') || '{}');
    const payload = {
      i: os.id, n: os.clientName, v: os.vehicle, p: os.plate, d: os.description, o: os.observation || "", t: os.total, dt: os.createdAt, cn: config.companyName || "CRMPLUS", it: (os.items || []).map(i => ({ t: i.type[0], d: i.description, b: i.brand, q: i.quantity, p: i.price }))
    };
    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const link = `${window.location.origin}${window.location.pathname}#/v/${base64}`;
    navigator.clipboard.writeText(link);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.plate.toLowerCase().includes(searchTerm.toLowerCase());
      const isHistory = o.status === 'Entregue' || o.status === 'Reprovado';
      if (statusFilter !== 'Todos' && o.status !== statusFilter) return false;
      if (activeTab === 'ativos') { if (isHistory) return false; } 
      else { 
        if (!hasPermission('view_history')) return false;
        if (!isHistory) return false; 
      }
      return matchesSearch;
    });
  }, [orders, searchTerm, activeTab, statusFilter, activeProfile]);

  const stats = useMemo(() => {
    const counts = {
      aberto: orders.filter(o => o.status === 'Aberto').length,
      orcamento: orders.filter(o => o.status === 'Orçamento').length,
      execucao: orders.filter(o => o.status === 'Execução').length,
      pronto: orders.filter(o => o.status === 'Pronto').length
    };
    return counts;
  }, [orders]);

  const getStatusClasses = (status: ServiceOrder['status']) => {
    switch(status) {
      case 'Orçamento': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Execução': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'Pronto': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Reprovado': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'Entregue': return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      default: return 'bg-violet-500/20 text-violet-400 border-violet-500/40';
    }
  };

  const [newOS, setNewOS] = useState<Partial<ServiceOrder>>({
    clientName: '', phone: '', vehicle: '', plate: '', description: '', items: [], status: 'Aberto'
  });
  const [newItem, setNewItem] = useState<Partial<ServiceItem>>({ type: 'PEÇA', description: '', brand: '', quantity: 1, price: 0 });

  return (
    <div className="pt-24 px-6 lg:px-12 max-w-screen-2xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 bg-[#050505] min-h-screen text-slate-200">
      
      {/* Header Estilizado */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-8 bg-white/[0.02] backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-[120px] rounded-full group-hover:bg-cyan-500/10 transition-all duration-1000"></div>
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
               <Wrench size={24} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">OFICINA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">PRO+</span></h1>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => { setActiveTab('ativos'); setView('lista'); setStatusFilter('Todos'); }} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all text-[10px] ${activeTab === 'ativos' && view === 'lista' ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(0,240,255,0.4)]' : 'text-slate-300 hover:bg-white/10'}`}>Operacional</button>
             {hasPermission('view_history') && <button onClick={() => { setActiveTab('historico'); setView('lista'); setStatusFilter('Todos'); }} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all text-[10px] ${activeTab === 'historico' ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(0,240,255,0.4)]' : 'text-slate-300 hover:bg-white/10'}`}>Histórico</button>}
          </div>
        </div>
        {hasPermission('create_os') && (
          <button onClick={() => { setActiveTab('nova'); setView('lista'); }} className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:brightness-125 hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl relative z-10">
            <Plus size={18} strokeWidth={4} /> Nova O.S.
          </button>
        )}
      </div>

      {/* DASHBOARD DE NOTIFICAÇÕES / STATUS RÁPIDO */}
      {view === 'lista' && activeTab === 'ativos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
           <div onClick={() => setStatusFilter('Orçamento')} className={`p-6 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between h-32 ${statusFilter === 'Orçamento' ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'bg-white/[0.02] border-white/5 hover:border-amber-500/30'}`}>
              <div className="flex justify-between items-start">
                 <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500"><Clock size={20}/></div>
                 <span className="text-3xl font-black text-white">{stats.orcamento}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-amber-400">Aguardando Cliente</p>
           </div>
           
           <div onClick={() => setStatusFilter('Execução')} className={`p-6 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between h-32 ${statusFilter === 'Execução' ? 'bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_30px_rgba(0,240,255,0.2)]' : 'bg-white/[0.02] border-white/5 hover:border-cyan-500/30'}`}>
              <div className="flex justify-between items-start">
                 <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-500"><Zap size={20}/></div>
                 <span className="text-3xl font-black text-white">{stats.execucao}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-cyan-400">Em Manutenção</p>
           </div>

           <div onClick={() => setStatusFilter('Pronto')} className={`p-6 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between h-32 ${statusFilter === 'Pronto' ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-white/[0.02] border-white/5 hover:border-emerald-500/30'}`}>
              <div className="flex justify-between items-start">
                 <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><Bell size={20}/></div>
                 <span className="text-3xl font-black text-white">{stats.pronto}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-400">Prontos para Entrega</p>
           </div>

           <div onClick={() => setStatusFilter('Todos')} className={`p-6 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between h-32 ${statusFilter === 'Todos' ? 'bg-white/10 border-white/20' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}>
              <div className="flex justify-between items-start">
                 <div className="p-2 bg-white/5 rounded-xl text-white"><FileText size={20}/></div>
                 <span className="text-3xl font-black text-white">{orders.filter(o => o.status !== 'Entregue' && o.status !== 'Reprovado').length}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ver Todas Ativas</p>
           </div>
        </div>
      )}

      {/* Busca e Listagem */}
      {view === 'lista' && activeTab !== 'nova' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="relative group max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input placeholder="Pesquisar por cliente, veículo ou placa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-md transition-all shadow-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
            {filteredOrders.map(o => (
              <div key={o.id} onClick={() => { setSelectedOS(o); setView('detalhes'); }} className="p-8 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-md transition-all flex flex-col justify-between min-h-[280px] shadow-xl hover:border-cyan-500/40 group hover:shadow-[0_0_40px_rgba(0,240,255,0.1)] cursor-pointer relative">
                
                {/* BOTÃO EXCLUIR RÁPIDO */}
                {hasPermission('delete_os') && (
                  <button 
                    onClick={(e) => handleDeleteOS(e, o.id)}
                    className="absolute top-6 right-6 p-2.5 bg-red-600/10 text-red-500 opacity-0 group-hover:opacity-100 rounded-xl hover:bg-red-600 hover:text-white transition-all z-20"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <div className="space-y-6">
                  <div className="flex justify-between items-center pr-8">
                    <span className="text-[10px] font-black text-cyan-400 font-mono bg-cyan-400/10 px-3 py-1.5 rounded-xl border border-cyan-400/30">#{o.id}</span>
                    
                    {/* STATUS INTERATIVO NA LISTA */}
                    <div className="relative">
                       <button 
                        onClick={(e) => { e.stopPropagation(); setQuickStatusId(quickStatusId === o.id ? null : o.id); }}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 hover:brightness-125 ${getStatusClasses(o.status)}`}
                       >
                         {o.status} <ChevronDown size={10} />
                       </button>

                       {quickStatusId === o.id && (
                         <div className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-3xl z-30 animate-in fade-in slide-in-from-top-2">
                           {['Aberto', 'Orçamento', 'Execução', 'Pronto', 'Entregue', 'Reprovado'].map(st => (
                             <button 
                              key={st}
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(o.id, st as any); }}
                              className={`w-full text-left px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all ${o.status === st ? 'text-cyan-400' : 'text-slate-500'}`}
                             >
                               {st}
                             </button>
                           ))}
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight truncate">{o.clientName}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{o.vehicle}</span>
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                      <span className="text-[11px] font-black text-cyan-400 font-mono tracking-widest bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-400/10">{o.plate}</span>
                    </div>
                  </div>
                  
                  {/* LEMBRETE DE ETAPA */}
                  <div className="pt-2">
                    {o.status === 'Orçamento' && <div className="flex items-center gap-2 text-[9px] font-bold text-amber-500 uppercase tracking-tighter"><AlertCircle size={10}/> Link enviado? Aguardando OK do cliente.</div>}
                    {o.status === 'Pronto' && <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 uppercase tracking-tighter"><Check size={10}/> Veículo finalizado. Avisar para retirada.</div>}
                    {o.status === 'Execução' && <div className="flex items-center gap-2 text-[9px] font-bold text-cyan-400 uppercase tracking-tighter"><Clock size={10}/> Operação em curso na oficina.</div>}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Calendar size={12} className="text-cyan-400" /> {o.createdAt}</span>
                  <span className="text-white font-black text-base">R$ {o.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4 opacity-30 border-2 border-dashed border-white/5 rounded-[3rem]">
                <ShieldAlert size={64} className="mx-auto text-slate-700" />
                <p className="font-black uppercase tracking-widest text-xs text-slate-500">Nenhum protocolo encontrado nesta base</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tela: Nova OS */}
      {activeTab === 'nova' && (
        <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl animate-in slide-in-from-bottom-10 shadow-3xl">
          <div className="flex items-center justify-between mb-12">
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4"><Zap className="text-cyan-400" /> Ativar <span className="text-cyan-400">Novo Protocolo</span></h2>
             <button onClick={() => setActiveTab('ativos')} className="text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest">Cancelar</button>
          </div>
          
          <form onSubmit={handleCreateOS} className="space-y-10">
            {formError && (
              <div className="p-5 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest animate-pulse">
                <AlertCircle size={20} /> {formError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Proprietário / Cliente</label><div className="relative"><User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/><input value={newOS.clientName} onChange={e => setNewOS({...newOS, clientName: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20" placeholder="Nome" /></div></div>
              <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp de Contato</label><div className="relative"><Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/><input value={newOS.phone} onChange={e => setNewOS({...newOS, phone: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20" placeholder="(00) 00000-0000" /></div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Veículo (Marca/Modelo)</label><div className="relative"><Car className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/><input value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20" placeholder="Ex: VW Golf GTI" /></div></div>
              <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Placa Oficial</label><div className="relative"><Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/><input value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value.toUpperCase()})} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-black text-xl outline-none focus:ring-2 focus:ring-cyan-500/20 uppercase font-mono tracking-widest" placeholder="BRA2E19" /></div></div>
            </div>

            <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Relato de Sintomas / Diagnóstico</label><div className="relative"><ClipboardList className="absolute left-5 top-6 text-slate-600" size={18}/><textarea value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 min-h-[160px] resize-none" placeholder="Descreva o que o cliente relatou ou o diagnóstico inicial..." /></div></div>
            
            <button type="submit" className="w-full py-7 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-3xl hover:brightness-110 active:scale-95 transition-all">Liberar Entrada na Oficina</button>
          </form>
        </div>
      )}

      {/* Tela: Detalhes da O.S. */}
      {view === 'detalhes' && selectedOS && (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
           
           {/* BARRA DE STATUS NO TOPO */}
           <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                 <button onClick={() => setView('lista')} className="flex items-center gap-3 text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.2em] group"><ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Controle</button>
                 <div className="flex items-center gap-4">
                    <button onClick={() => copyLink(selectedOS)} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-xl">
                      {copyFeedback ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18}/>} 
                      {copyFeedback ? 'Link Copiado!' : 'Link do Cliente'}
                    </button>
                    {hasPermission('delete_os') && (
                       <button onClick={(e) => handleDeleteOS(e, selectedOS.id)} className="p-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl"><Trash2 size={20}/></button>
                    )}
                 </div>
              </div>

              {/* LISTA PARA ALTERAR O STATUS - DESTAQUE MÁXIMO NO TOPO */}
              {hasPermission('edit_os') && (
                <div className="bg-white/[0.03] border border-cyan-500/20 p-8 rounded-[3rem] space-y-6 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/50 via-violet-500/50 to-magenta-500/50"></div>
                   <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-500"><Clock size={24}/></div>
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Atual</p>
                            <h4 className="text-xl font-black text-white uppercase tracking-tighter">{selectedOS.status}</h4>
                         </div>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                         {['Aberto', 'Orçamento', 'Execução', 'Pronto', 'Entregue', 'Reprovado'].map(st => (
                           <button 
                             key={st} 
                             onClick={() => handleUpdateStatus(selectedOS.id, st as any)} 
                             className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedOS.status === st ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-105' : 'bg-black/60 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
                           >
                             {st}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
              )}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Sidebar: Dados do Veículo e Fotos */}
              <div className="lg:col-span-4 space-y-10">
                 <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3.5rem] backdrop-blur-3xl space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full"></div>
                    <div className="space-y-8 relative z-10">
                       <h2 className="text-4xl font-black text-white uppercase tracking-tighter">O.S. <span className="text-cyan-400">#{selectedOS.id}</span></h2>
                       <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</p><p className="text-xl font-black text-white">{selectedOS.clientName}</p><p className="text-slate-400 text-sm font-bold">{selectedOS.phone}</p></div>
                       <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Veículo</p><p className="text-xl font-black text-white uppercase">{selectedOS.vehicle}</p><p className="text-cyan-400 font-black tracking-widest text-lg neon-text-cyan font-mono">{selectedOS.plate}</p></div>
                       <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-2"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Diagnóstico Inicial</p><p className="text-slate-300 text-xs italic leading-relaxed">"{selectedOS.description}"</p></div>
                    </div>
                 </div>

                 {/* CAMPO PARA ANEXAR FOTO */}
                 <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[3.5rem] space-y-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                       <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                          <Camera size={18} className="text-cyan-400" /> Galeria de Mídia
                       </h3>
                       <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-cyan-500 text-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20 active:scale-90"
                       >
                          <Plus size={18} strokeWidth={3} />
                       </button>
                       <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       {(selectedOS.photos || []).map((photo, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                             <img src={photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Serviço ${idx}`} />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button className="p-2 bg-white text-black rounded-lg shadow-xl"><Eye size={14}/></button>
                                <button onClick={() => removePhoto(idx)} className="p-2 bg-red-600 text-white rounded-lg shadow-xl"><Trash2 size={14}/></button>
                             </div>
                          </div>
                       ))}
                       {(!selectedOS.photos || selectedOS.photos.length === 0) && (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="col-span-2 py-10 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-cyan-500/30 transition-all opacity-30 hover:opacity-100"
                          >
                             <ImagePlus size={32} />
                             <p className="text-[9px] font-black uppercase tracking-widest text-center">Anexar evidências fotográficas</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Principal: Orçamento e Lançamento de Itens */}
              <div className="lg:col-span-8 space-y-10">
                 <div className="bg-white/[0.02] border border-white/10 p-10 lg:p-14 rounded-[3.5rem] backdrop-blur-3xl space-y-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/5 blur-[100px] rounded-full"></div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-5"><Zap size={28} className="text-cyan-400"/> Gestão de <span className="text-cyan-400">Custos</span></h3>
                       <div className="text-center sm:text-right bg-black/40 px-8 py-5 rounded-[2rem] border border-white/5 shadow-inner">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total do Orçamento</p>
                          <p className="text-5xl font-black text-white tracking-tighter">R$ {selectedOS.total.toFixed(2)}</p>
                       </div>
                    </div>

                    {/* Formulário de Adição */}
                    {hasPermission('edit_os') && (selectedOS.status === 'Aberto' || selectedOS.status === 'Orçamento') && (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 relative z-10 shadow-2xl">
                         <div className="sm:col-span-1 space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Tipo</label>
                            <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl py-5 px-5 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-cyan-500/20">
                               <option value="PEÇA">Peça / Produto</option>
                               <option value="MÃO DE OBRA">Mão de Obra</option>
                               <option value="NOTA">Nota Fiscal / Taxa</option>
                            </select>
                         </div>
                         <div className="sm:col-span-2 space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Descrição do Item</label>
                            <input placeholder="Ex: Óleo 5W30 Sintético" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 text-white text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner" />
                         </div>
                         <div className="sm:col-span-1 space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Valor Unitário</label>
                            <div className="flex gap-3">
                               <div className="relative flex-1">
                                  <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                  <input type="number" placeholder="0.00" value={newItem.price || ''} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-10 pr-4 text-white text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner" />
                               </div>
                               <button onClick={handleAddItem} className="p-5 bg-gradient-to-br from-cyan-400 to-violet-600 text-white rounded-2xl hover:brightness-125 transition-all shadow-xl shadow-cyan-500/20 active:scale-90"><Plus size={20} strokeWidth={3} /></button>
                            </div>
                         </div>
                      </div>
                    )}

                    {/* Listagem de Itens no Orçamento */}
                    <div className="space-y-6 relative z-10">
                       {selectedOS.items.length === 0 ? (
                          <div className="py-24 text-center opacity-30 space-y-6 border-2 border-dashed border-white/5 rounded-[3rem]">
                             <Package size={64} className="mx-auto text-slate-700" />
                             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">O orçamento está vazio</p>
                          </div>
                       ) : (
                          <div className="divide-y divide-white/5 bg-black/20 rounded-[2.5rem] border border-white/5 p-4">
                             {selectedOS.items.map((item) => (
                               <div key={item.id} className="py-6 px-6 flex items-center justify-between group hover:bg-white/[0.02] rounded-2xl transition-all">
                                  <div className="flex items-center gap-6">
                                     <div className={`p-4 rounded-2xl shadow-lg ${item.type === 'PEÇA' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : item.type === 'MÃO DE OBRA' ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' : 'bg-violet-500/10 text-violet-500 border border-violet-500/20'}`}>
                                        {item.type === 'PEÇA' ? <Package size={20}/> : item.type === 'MÃO DE OBRA' ? <Wrench size={20}/> : <FileText size={20}/>}
                                     </div>
                                     <div>
                                        <p className="text-base font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{item.description}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.type}</p>
                                          <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">QTD: {item.quantity}</p>
                                        </div>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-10">
                                     <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Subtotal</p>
                                        <p className="text-lg font-black text-white">R$ {item.price.toFixed(2)}</p>
                                     </div>
                                     {hasPermission('edit_os') && (
                                       <button onClick={() => {
                                          const updatedItems = selectedOS.items.filter(i => i.id !== item.id);
                                          const newTotal = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
                                          const updatedOS = { ...selectedOS, items: updatedItems, total: newTotal };
                                          const updatedOrders = orders.map(o => o.id === selectedOS.id ? updatedOS : o);
                                          setSelectedOS(updatedOS); saveOrders(updatedOrders);
                                          addLog('REMOVE_ITEM', `Removido: ${item.description} da O.S. #${selectedOS.id}`);
                                       }} className="p-3 text-slate-800 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={18}/></button>
                                     )}
                                  </div>
                               </div>
                             ))}
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
