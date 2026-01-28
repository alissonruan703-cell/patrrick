
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, X, Send, Trash2,
  Calendar, FileText, ArrowLeft, ChevronDown, Zap, User, Car, Phone, Hash, ClipboardList, Package, Wrench, DollarSign, Share2, Check, AlertCircle, Clock, ShieldAlert, ImagePlus, Camera, Eye, Bell, ChevronRight, MoreHorizontal, History, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { ServiceOrder, ServiceItem, UserProfile, LogEntry } from '../types';

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
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [quickStatusId, setQuickStatusId] = useState<string | null>(null);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [osToDelete, setOsToDelete] = useState<ServiceOrder | null>(null);
  
  // States para novos formulários
  const [newOS, setNewOS] = useState<Partial<ServiceOrder>>({
    clientName: '', phone: '', vehicle: '', plate: '', description: '', items: [], status: 'Aberto'
  });
  const [newItem, setNewItem] = useState<Partial<ServiceItem>>({ type: 'PEÇA', description: '', brand: '', quantity: 1, price: 0 });

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
    
    const osIdFromUrl = searchParams.get('id');
    if (osIdFromUrl) {
      const found = parsedOrders.find((o: any) => o.id === osIdFromUrl);
      if (found) {
        setSelectedOS(found);
        setView('detalhes');
        setSearchParams({}, { replace: true });
      }
    }

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
  }, [selectedOS?.id, selectedOS?.status, searchParams]);

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
      id: Date.now().toString(),
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

  const handleDeleteOS = (e: React.MouseEvent, os: ServiceOrder) => {
    e.stopPropagation();
    if (!hasPermission('delete_os')) return;
    setOsToDelete(os);
  };

  const confirmDeleteOS = () => {
    if (!osToDelete) return;
    const updated = orders.filter(o => o.id !== osToDelete.id);
    saveOrders(updated);
    addLog('DELETE_OS', `O.S. #${osToDelete.id} removida`);
    if (selectedOS?.id === osToDelete.id) {
      setView('lista');
      setSelectedOS(null);
    }
    setOsToDelete(null);
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

  const removeItem = (id: string) => {
    if (!selectedOS) return;
    const updatedItems = selectedOS.items.filter(i => i.id !== id);
    const newTotal = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const updatedOS = { ...selectedOS, items: updatedItems, total: newTotal };
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

  const smartAlerts = useMemo(() => {
    const alerts: any[] = [];
    const now = new Date();
    
    orders.forEach(os => {
      const createdAt = new Date(parseInt(os.id) || now.getTime());
      const hoursDiff = Math.abs(now.getTime() - createdAt.getTime()) / 36e5;

      if (hoursDiff > 168) return; 

      if (os.status === 'Aberto' && hoursDiff > 2 && hoursDiff < 24) {
        alerts.push({
          id: `alert-a-${os.id}`,
          osId: os.id,
          type: 'urgent',
          title: 'Serviço Estagnado',
          message: `Veículo ${os.plate} parado há ${Math.floor(hoursDiff)}h. Necessário diagnóstico.`,
          icon: <AlertCircle className="text-red-500" />
        });
      }
      
      if (os.status === 'Orçamento' && hoursDiff > 4 && hoursDiff < 48) {
        alerts.push({
          id: `alert-o-${os.id}`,
          osId: os.id,
          type: 'warning',
          title: 'Aguardando Aprovação',
          message: `Orçamento de ${os.clientName} pendente. Relembrar via WhatsApp?`,
          icon: <Clock className="text-amber-500" />
        });
      }

      if (os.status === 'Pronto') {
        alerts.push({
          id: `alert-p-${os.id}`,
          osId: os.id,
          type: 'success',
          title: 'Retirada Disponível',
          message: `${os.vehicle} pronto para entrega ao cliente.`,
          icon: <Zap className="text-emerald-500" />
        });
      }
    });

    return alerts.slice(0, 15);
  }, [orders]);

  const handleNotifClick = (osId: string) => {
    const found = orders.find(o => o.id === osId);
    if (found) {
      setSelectedOS(found);
      setView('detalhes');
      setIsNotifDrawerOpen(false);
    }
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
    return {
      aberto: orders.filter(o => o.status === 'Aberto').length,
      orcamento: orders.filter(o => o.status === 'Orçamento').length,
      execucao: orders.filter(o => o.status === 'Execução').length,
      pronto: orders.filter(o => o.status === 'Pronto').length
    };
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

  return (
    <div className="pt-24 px-6 lg:px-12 max-w-screen-2xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 bg-[#050505] min-h-screen text-slate-200">
      
      {/* Modal de Confirmação Crítico */}
      {osToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-[#0f0f0f] border border-red-500/20 rounded-[3rem] p-10 space-y-8 shadow-[0_0_80px_rgba(239,68,68,0.15)] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/5 blur-[60px] rounded-full"></div>
              <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                 <div className="p-5 bg-red-600/10 text-red-500 rounded-3xl border border-red-500/20">
                    <Trash2 size={32} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Confirmar Exclusão</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                       Você está prestes a remover permanentemente a Ordem de Serviço de:
                    </p>
                 </div>
                 
                 <div className="w-full p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-3">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</span>
                       <span className="text-white font-black uppercase text-lg">{osToDelete.clientName}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Veículo / Placa</span>
                       <span className="text-cyan-400 font-mono font-black text-lg tracking-widest">{osToDelete.vehicle} • {osToDelete.plate}</span>
                    </div>
                 </div>

                 <p className="text-[10px] text-red-400/60 font-black uppercase tracking-widest">Esta ação é irreversível.</p>

                 <div className="flex gap-4 w-full">
                    <button onClick={() => setOsToDelete(null)} className="flex-1 py-5 bg-white/5 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:text-white transition-all">Cancelar</button>
                    <button onClick={confirmDeleteOS} className="flex-1 py-5 bg-red-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/20 hover:brightness-110 active:scale-95 transition-all">Confirmar</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Drawer de Alertas */}
      {isNotifDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
           <div onClick={() => setIsNotifDrawerOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
           <div className="w-full max-w-md bg-[#0f0f0f] border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] relative z-10 flex flex-col h-full animate-in slide-in-from-right-full duration-500">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500"><Bell size={24} className="animate-pulse"/></div>
                    <div>
                       <h2 className="text-xl font-black text-white uppercase tracking-tighter">Central de Alertas</h2>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Controle de Pendências</p>
                    </div>
                 </div>
                 <button onClick={() => setIsNotifDrawerOpen(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-500 transition-colors"><X size={24}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                 {smartAlerts.length > 0 ? (
                   smartAlerts.map(alert => (
                     <div key={alert.id} onClick={() => handleNotifClick(alert.osId)} className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-3 group hover:border-white/10 transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              {alert.icon}
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">{alert.title}</span>
                           </div>
                           <ChevronRight size={14} className="text-slate-800 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed uppercase tracking-tight">{alert.message}</p>
                     </div>
                   ))
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-20">
                       <CheckCircle2 size={64} className="text-emerald-500" />
                       <p className="text-sm font-black uppercase tracking-widest">Tudo em conformidade</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-8 bg-white/[0.02] backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-[120px] rounded-full group-hover:bg-cyan-500/10 transition-all duration-1000"></div>
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30 text-cyan-400">
               <Wrench size={24} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">OFICINA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">PRO+</span></h1>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => { setActiveTab('ativos'); setView('lista'); }} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all text-[10px] ${activeTab === 'ativos' ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(0,240,255,0.4)]' : 'text-slate-300 hover:bg-white/10'}`}>Operacional</button>
             <button onClick={() => { setActiveTab('historico'); setView('lista'); }} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all text-[10px] ${activeTab === 'historico' ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(0,240,255,0.4)]' : 'text-slate-300 hover:bg-white/10'}`}>Histórico</button>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={() => setIsNotifDrawerOpen(true)}
            className={`relative p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group ${smartAlerts.length > 0 ? 'text-amber-500' : 'text-slate-500'}`}
          >
             <Bell size={24} className={smartAlerts.length > 0 ? 'animate-bounce' : ''} />
             {smartAlerts.length > 0 && (
               <span className="absolute -top-1 -right-1 min-w-[24px] h-6 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#050505] shadow-lg px-1.5">
                 {smartAlerts.length > 9 ? '9+' : smartAlerts.length}
               </span>
             )}
          </button>

          <button onClick={() => { setActiveTab('nova'); setView('lista'); }} className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:brightness-125 hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl">
            <Plus size={18} strokeWidth={4} /> Nova O.S.
          </button>
        </div>
      </div>

      {/* Visualização de Lista */}
      {view === 'lista' && activeTab !== 'nova' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
             <div onClick={() => setStatusFilter('Orçamento')} className={`p-6 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between h-32 ${statusFilter === 'Orçamento' ? 'bg-amber-500/20 border-amber-500/50' : 'bg-white/[0.02] border-white/5'}`}>
                <Clock size={20} className="text-amber-500"/>
                <span className="text-3xl font-black text-white">{stats.orcamento}</span>
                <p className="text-[10px] font-black uppercase text-slate-400">Aguardando Cliente</p>
             </div>
             <div onClick={() => setStatusFilter('Execução')} className={`p-6 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between h-32 ${statusFilter === 'Execução' ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-white/[0.02] border-white/5'}`}>
                <Zap size={20} className="text-cyan-500"/>
                <span className="text-3xl font-black text-white">{stats.execucao}</span>
                <p className="text-[10px] font-black uppercase text-slate-400">Em Manutenção</p>
             </div>
             <div onClick={() => setStatusFilter('Pronto')} className={`p-6 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between h-32 ${statusFilter === 'Pronto' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/[0.02] border-white/5'}`}>
                <CheckCircle2 size={20} className="text-emerald-500"/>
                <span className="text-3xl font-black text-white">{stats.pronto}</span>
                <p className="text-[10px] font-black uppercase text-slate-400">Retirada Pendente</p>
             </div>
             <div onClick={() => setStatusFilter('Todos')} className={`p-6 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between h-32 ${statusFilter === 'Todos' ? 'bg-white/10' : 'bg-white/[0.02] border-white/5'}`}>
                <FileText size={20} className="text-white"/>
                <span className="text-3xl font-black text-white">{filteredOrders.length}</span>
                <p className="text-[10px] font-black uppercase text-slate-400">Total no Filtro</p>
             </div>
          </div>

          <div className="relative group max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input placeholder="Pesquisar por cliente, veículo ou placa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredOrders.map(o => (
              <div key={o.id} onClick={() => { setSelectedOS(o); setView('detalhes'); }} className="p-8 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-md transition-all flex flex-col justify-between min-h-[280px] shadow-xl hover:border-cyan-500/40 group cursor-pointer relative">
                {hasPermission('delete_os') && (
                  <button onClick={(e) => handleDeleteOS(e, o)} className="absolute top-6 right-6 p-2.5 bg-red-600/10 text-red-500 opacity-0 group-hover:opacity-100 rounded-xl hover:bg-red-600 hover:text-white transition-all z-20"><Trash2 size={14} /></button>
                )}
                <div className="space-y-6">
                  <div className="flex justify-between items-center pr-8">
                    <span className="text-[10px] font-black text-cyan-400 font-mono bg-cyan-400/10 px-3 py-1.5 rounded-xl border border-cyan-400/30">#{o.id.slice(-4)}</span>
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusClasses(o.status)}`}>{o.status}</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight truncate">{o.clientName}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{o.vehicle}</span>
                      <span className="text-[11px] font-black text-cyan-400 font-mono tracking-widest bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-400/10">{o.plate}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Calendar size={12} className="text-cyan-400" /> {o.createdAt}</span>
                  <span className="text-white font-black text-base">R$ {o.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tela de Nova OS (FIXED) */}
      {activeTab === 'nova' && (
        <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl animate-in slide-in-from-bottom-10 shadow-3xl">
          <div className="flex items-center justify-between mb-12">
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4"><Zap className="text-cyan-400" /> Ativar <span className="text-cyan-400">Novo Protocolo</span></h2>
             <button onClick={() => setActiveTab('ativos')} className="text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest">Cancelar</button>
          </div>
          
          <form onSubmit={handleCreateOS} className="space-y-10">
            {formError && <div className="p-5 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest">{formError}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Proprietário / Cliente</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                  <input value={newOS.clientName} onChange={e => setNewOS({...newOS, clientName: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20" placeholder="Nome completo" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp de Contato</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                  <input value={newOS.phone} onChange={e => setNewOS({...newOS, phone: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20" placeholder="(00) 00000-0000" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Veículo (Marca/Modelo)</label>
                <div className="relative">
                  <Car className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                  <input value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20" placeholder="Ex: VW Golf GTI" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Placa Oficial</label>
                <div className="relative">
                  <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                  <input value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value.toUpperCase()})} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-black text-xl outline-none focus:ring-2 focus:ring-cyan-500/20 uppercase font-mono tracking-widest" placeholder="ABC1234" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sintomas / Diagnóstico</label>
              <div className="relative">
                <ClipboardList className="absolute left-5 top-6 text-slate-600" size={18}/>
                <textarea value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 min-h-[160px] resize-none" placeholder="Descreva os problemas relatados..." />
              </div>
            </div>
            <button type="submit" className="w-full py-7 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-3xl hover:brightness-110 active:scale-95 transition-all">Liberar Entrada na Oficina</button>
          </form>
        </div>
      )}

      {/* Detalhes da O.S. */}
      {view === 'detalhes' && selectedOS && (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
             <button onClick={() => setView('lista')} className="flex items-center gap-3 text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.2em] group"><ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Controle</button>
             <div className="flex items-center gap-4">
                <button onClick={() => copyLink(selectedOS)} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-xl">
                  {copyFeedback ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18}/>} 
                  {copyFeedback ? 'Link Copiado!' : 'Link do Cliente'}
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3.5rem] backdrop-blur-3xl space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full"></div>
                <div className="space-y-8 relative z-10">
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter">O.S. <span className="text-cyan-400">#{selectedOS.id.slice(-4)}</span></h2>
                   <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</p><p className="text-xl font-black text-white">{selectedOS.clientName}</p></div>
                   <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Veículo</p><p className="text-xl font-black text-white uppercase">{selectedOS.vehicle}</p><p className="text-cyan-400 font-black tracking-widest text-lg font-mono">{selectedOS.plate}</p></div>
                   <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-2"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Diagnóstico Técnico</p><p className="text-slate-300 text-xs italic leading-relaxed">"{selectedOS.description}"</p></div>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3.5rem] space-y-6">
                 <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Mudar Status</h4>
                 <div className="grid grid-cols-2 gap-3">
                   {['Aberto', 'Orçamento', 'Execução', 'Pronto', 'Entregue', 'Reprovado'].map(st => (
                     <button key={st} onClick={() => handleUpdateStatus(selectedOS.id, st as any)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedOS.status === st ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg' : 'bg-black/40 border-white/5 text-slate-500 hover:text-white'}`}>{st}</button>
                   ))}
                 </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-white/[0.02] border border-white/10 p-10 lg:p-14 rounded-[3.5rem] backdrop-blur-3xl space-y-12 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-5"><DollarSign size={28} className="text-cyan-400"/> Lançamentos</h3>
                   <div className="text-right bg-black/40 px-8 py-5 rounded-[2rem] border border-white/5 shadow-inner">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Geral</p>
                      <p className="text-5xl font-black text-white tracking-tighter">R$ {selectedOS.total.toFixed(2)}</p>
                   </div>
                </div>

                {hasPermission('edit_os') && (
                  <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Tipo</label>
                        <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white font-bold text-xs uppercase cursor-pointer">
                          <option value="PEÇA">Peça</option>
                          <option value="MÃO DE OBRA">Serviço</option>
                          <option value="NOTA">Taxa</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Descrição / Nome do Item</label>
                        <input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white font-bold text-xs" placeholder="Ex: Óleo 5W30" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Preço Unitário</label>
                        <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white font-bold text-xs" placeholder="0.00" />
                      </div>
                    </div>
                    <button onClick={handleAddItem} className="w-full py-4 bg-cyan-500 text-black font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                      <Plus size={16} strokeWidth={4} /> Lançar Item na O.S.
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedOS.items.length > 0 ? (
                    <div className="bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <tr>
                            <th className="px-8 py-5">Item / Descrição</th>
                            <th className="px-8 py-5 text-right">Subtotal</th>
                            <th className="px-8 py-5 text-right w-16"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {selectedOS.items.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-8 py-5">
                                <p className="text-sm font-black text-white uppercase">{item.description}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">{item.type} {item.quantity > 1 ? `(${item.quantity}x R$ ${item.price.toFixed(2)})` : ''}</p>
                              </td>
                              <td className="px-8 py-5 text-right font-black text-white text-base">R$ {(item.price * item.quantity).toFixed(2)}</td>
                              <td className="px-8 py-5 text-right">
                                <button onClick={() => removeItem(item.id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors"><X size={16}/></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-20 text-center opacity-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                       <Package size={48} className="mx-auto mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em]">Nenhum item lançado ainda</p>
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
