
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, X, Trash2,
  Calendar, ArrowLeft, Zap, User, Car, Phone, Hash, ClipboardList, Package, Wrench, DollarSign, Share2, Check, AlertCircle, Clock, Bell, ChevronRight, CheckCircle2, Image as ImageIcon, Camera, AlertTriangle
} from 'lucide-react';
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
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  
  const [newOS, setNewOS] = useState<Partial<ServiceOrder>>({
    clientName: '', phone: '', vehicle: '', plate: '', description: '', items: [], status: 'Aberto'
  });
  const [newItem, setNewItem] = useState<Partial<ServiceItem>>({ 
    type: 'PEÇA', description: '', brand: '', quantity: 1, price: 0 
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasPermission = (permission: string) => {
    return activeProfile?.actions?.includes(permission) || false;
  };

  const addLog = (action: string, details: string) => {
    if (!activeProfile) return;
    const logs = JSON.parse(localStorage.getItem('crmplus_logs') || '[]');
    const newLog: LogEntry = { id: Date.now().toString(), timestamp: new Date().toISOString(), userId: activeProfile.id, userName: activeProfile.name, action, details, system: 'OFICINA' };
    localStorage.setItem('crmplus_logs', JSON.stringify([newLog, ...logs].slice(0, 1000)));
  };

  const loadData = () => {
    const savedOrders = localStorage.getItem('crmplus_oficina_orders');
    const parsedOrders = savedOrders ? JSON.parse(savedOrders) : [];
    setOrders(parsedOrders);
    
    const savedConfig = localStorage.getItem('crmplus_system_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));

    const dismissedRaw = localStorage.getItem('crmplus_dismissed_notifications');
    if (dismissedRaw) setDismissedIds(JSON.parse(dismissedRaw));
    
    if (selectedOS) {
      const currentInStorage = parsedOrders.find((o: any) => String(o.id) === String(selectedOS.id));
      if (currentInStorage) setSelectedOS(currentInStorage);
    }

    const osIdFromUrl = searchParams.get('id');
    if (osIdFromUrl) {
      const found = parsedOrders.find((o: any) => String(o.id) === String(osIdFromUrl));
      if (found) {
        setSelectedOS(found);
        setView('detalhes');
        setSearchParams({}, { replace: true });
        handleDismiss(`notif-aberto-${found.id}`);
      }
    }

    const savedProfile = sessionStorage.getItem('crmplus_active_profile');
    if (savedProfile) setActiveProfile(JSON.parse(savedProfile));
  };

  useEffect(() => { 
    loadData(); 
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [selectedOS?.id, searchParams]);

  const saveOrders = (updated: ServiceOrder[]) => {
    setOrders(updated);
    localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDismiss = (id: string) => {
    const current = JSON.parse(localStorage.getItem('crmplus_dismissed_notifications') || '[]');
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem('crmplus_dismissed_notifications', JSON.stringify(updated));
      setDismissedIds(updated);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedOS || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const updatedPhotos = [...(selectedOS.photos || []), base64];
      const updatedOS = { ...selectedOS, photos: updatedPhotos };
      const updatedOrders = orders.map(o => o.id === selectedOS.id ? updatedOS : o);
      setSelectedOS(updatedOS);
      saveOrders(updatedOrders);
      addLog('PHOTO_UPLOAD', `Foto anexada à O.S. #${selectedOS.id}`);
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
    addLog('CREATE_OS', `Nova O.S. #${os.id}`);
    setNewOS({ clientName: '', phone: '', vehicle: '', plate: '', description: '', items: [], status: 'Aberto' });
    setActiveTab('ativos');
    setView('lista');
  };

  const handleUpdateStatus = (id: string, newStatus: ServiceOrder['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    saveOrders(updated);
    if (selectedOS?.id === id) setSelectedOS({ ...selectedOS, status: newStatus });
    addLog('UPDATE_STATUS', `O.S. #${id} -> ${newStatus}`);
  };

  const handleDeleteOS = (id: string) => {
    if (!hasPermission('delete_os')) return;
    const updated = orders.filter(o => o.id !== id);
    saveOrders(updated);
    addLog('DELETE_OS', `O.S. #${id} excluída permanentemente`);
    setOsToDelete(null);
    setSelectedOS(null);
    setView('lista');
  };

  const handleAddItem = () => {
    if (!hasPermission('edit_os') || !selectedOS) return;
    const item: ServiceItem = { 
      ...newItem as ServiceItem, 
      id: Date.now().toString(), 
      timestamp: new Date().toISOString() 
    };
    const updatedItems = [...(selectedOS.items || []), item];
    const newTotal = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    
    const updatedOS = { ...selectedOS, items: updatedItems, total: newTotal };
    saveOrders(orders.map(o => o.id === selectedOS.id ? updatedOS : o));
    setSelectedOS(updatedOS);
    setNewItem({ type: 'PEÇA', description: '', brand: '', quantity: 1, price: 0 });
  };

  const removeItem = (id: string) => {
    if (!selectedOS) return;
    const updatedItems = selectedOS.items.filter(i => i.id !== id);
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
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.plate.toLowerCase().includes(searchTerm.toLowerCase());
      if (statusFilter !== 'Todos' && o.status !== statusFilter) return false;
      
      // Oculta finalizados (Entregue/Reprovado) da aba 'ativos'
      if (activeTab === 'ativos' && (o.status === 'Entregue' || o.status === 'Reprovado')) return false;
      // Mostra APENAS finalizados na aba 'historico'
      if (activeTab === 'historico' && (o.status !== 'Entregue' && o.status !== 'Reprovado')) return false;
      
      return matchesSearch;
    });
  }, [orders, searchTerm, activeTab, statusFilter]);

  const stats = useMemo(() => ({
    aberto: orders.filter(o => o.status === 'Aberto').length,
    orcamento: orders.filter(o => o.status === 'Orçamento').length,
    execucao: orders.filter(o => o.status === 'Execução').length,
    pronto: orders.filter(o => o.status === 'Pronto').length
  }), [orders]);

  return (
    <div className="pt-24 px-6 lg:px-12 max-w-screen-2xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Modal de Confirmação de Exclusão */}
      {osToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           {/* Fix: Removed escaped quotes and backslashes in JSX */}
           <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/5 blur-[60px] rounded-full"></div>
              <div className="w-20 h-20 bg-red-600/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Excluir Ordem de Serviço?</h3>
                <p className="text-slate-400 text-sm leading-relaxed uppercase font-bold tracking-tight px-4">
                  Esta ação é irreversível. Todos os dados desta O.S. serão removidos permanentemente do ecossistema.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setOsToDelete(null)} className="flex-1 py-5 bg-white/5 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">Cancelar</button>
                <button onClick={() => handleDeleteOS(osToDelete)} className="flex-1 py-5 bg-red-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all">Confirmar Exclusão</button>
              </div>
           </div>
        </div>
      )}

      {/* Header com Nome da Empresa Logada */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-8 bg-white/[0.02] backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-5">
             {config.companyLogo ? (
               <img src={config.companyLogo} className="h-12 w-auto object-contain" alt="Logo" />
             ) : (
               <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30 text-cyan-400"><Wrench size={24} /></div>
             )}
             <div>
                <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-1">{config.companyName}</h2>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">OFICINA <span className="text-cyan-400">PRO+</span></h1>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => { setActiveTab('ativos'); setView('lista'); setSelectedOS(null); }} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'ativos' && !selectedOS ? 'bg-cyan-500 text-black' : 'text-slate-300 hover:bg-white/10'}`}>Operacional</button>
             <button onClick={() => { setActiveTab('historico'); setView('lista'); setSelectedOS(null); }} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'historico' ? 'bg-cyan-500 text-black' : 'text-slate-300 hover:bg-white/10'}`}>Histórico</button>
          </div>
        </div>
        <button onClick={() => { setView('lista'); setActiveTab('nova'); setSelectedOS(null); }} className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3">
          <Plus size={18} strokeWidth={4} /> Nova O.S.
        </button>
      </div>

      {/* Barra de Status por cima da lista */}
      {view === 'lista' && activeTab !== 'nova' && !selectedOS && (
        <div className="flex flex-wrap items-center gap-4 bg-white/[0.01] p-4 rounded-[2rem] border border-white/5 overflow-x-auto no-scrollbar">
           {(activeTab === 'ativos' ? ['Todos', 'Aberto', 'Orçamento', 'Execução', 'Pronto'] : ['Todos', 'Entregue', 'Reprovado']).map(st => (
             <button key={st} onClick={() => setStatusFilter(st)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-3 ${statusFilter === st ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-slate-500 hover:text-white'}`}>
               {st} {st !== 'Todos' && <span className="bg-white/10 px-2 py-0.5 rounded text-[8px]">{
                  st === 'Aberto' ? stats.aberto : 
                  st === 'Orçamento' ? stats.orcamento : 
                  st === 'Execução' ? stats.execucao : 
                  st === 'Pronto' ? stats.pronto : 
                  orders.filter(o => o.status === st).length
                }</span>}
             </button>
           ))}
        </div>
      )}

      {/* Lista de Ordens */}
      {view === 'lista' && activeTab !== 'nova' && !selectedOS && (
        <>
          <div className="relative group max-w-2xl"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} /><input placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-white font-bold outline-none focus:ring-2 focus:ring-cyan-500/20" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredOrders.map(o => (
              <div key={o.id} onClick={() => { setSelectedOS(o); setView('detalhes'); }} className="p-8 rounded-[2.5rem] border border-white/10 bg-white/[0.02] flex flex-col justify-between min-h-[250px] shadow-xl hover:border-cyan-500/40 cursor-pointer relative group/card">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-cyan-400 font-mono">#{o.id.slice(-4)}</span>
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border border-white/10`}>{o.status}</span>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase truncate">{o.clientName}</h3>
                  <p className="text-[11px] font-bold text-slate-300 uppercase">{o.vehicle} | {o.plate}</p>
                </div>
                <div className="pt-6 border-t border-white/10 flex items-center justify-between text-white font-black">
                   <span>R$ {o.total.toFixed(2)}</span>
                   {hasPermission('delete_os') && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); setOsToDelete(o.id); }}
                       className="p-2 text-slate-700 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-all"
                     >
                       <Trash2 size={16} />
                     </button>
                   )}
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <Clock size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Nenhuma O.S. {activeTab === 'ativos' ? 'ativa' : 'no histórico'}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Detalhes da OS */}
      {view === 'detalhes' && selectedOS && (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in zoom-in-95">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
             <button onClick={() => { setView('lista'); setSelectedOS(null); }} className="flex items-center gap-3 text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-widest"><ArrowLeft size={18} /> Voltar</button>
             <div className="flex items-center gap-3">
                {hasPermission('delete_os') && (
                  <button 
                    onClick={() => setOsToDelete(selectedOS.id)}
                    className="p-4 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-lg"
                    title="Excluir O.S."
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button onClick={() => copyLink(selectedOS)} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-cyan-400 transition-all shadow-xl">{copyFeedback ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18}/>} Link Cliente</button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3.5rem] space-y-8 shadow-2xl">
                 <div className="flex justify-between items-start">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">#{selectedOS.id.slice(-4)}</h2>
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border border-white/10 bg-white/5`}>{selectedOS.status}</span>
                 </div>
                 <div className="space-y-4">
                    <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</p><p className="text-xl font-black text-white">{selectedOS.clientName}</p></div>
                    <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Veículo</p><p className="text-xl font-black text-white uppercase">{selectedOS.vehicle}</p><p className="text-cyan-400 font-black tracking-widest text-lg font-mono">{selectedOS.plate}</p></div>
                 </div>
              </div>

              {/* Módulo de Fotos */}
              <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[3rem] space-y-6 shadow-xl">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2"><ImageIcon size={16} className="text-cyan-500" /> Fotos</h4>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-cyan-500 text-black rounded-lg hover:brightness-110 flex items-center gap-2 px-3">
                      <Camera size={16} /><span className="text-[8px] font-black uppercase">Anexar</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    {(selectedOS.photos || []).map((ph, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10">
                         <img src={ph} className="w-full h-full object-cover" />
                         <button onClick={() => removePhoto(idx)} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3.5rem] space-y-6">
                 <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Mudar Status</h4>
                 <div className="grid grid-cols-2 gap-3">
                   {['Aberto', 'Orçamento', 'Execução', 'Pronto', 'Entregue', 'Reprovado'].map(st => (
                     <button key={st} onClick={() => handleUpdateStatus(selectedOS.id, st as any)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedOS.status === st ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg' : 'bg-black/40 border-white/5 text-slate-500 hover:text-white'}`}>{st}</button>
                   ))}
                 </div>
                 {(selectedOS.status === 'Entregue' || selectedOS.status === 'Reprovado') && (
                   <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                     <AlertCircle size={16} className="text-amber-500 shrink-0" />
                     <p className="text-[8px] font-bold text-amber-500 uppercase leading-relaxed">
                       O.S. finalizada. Ela será ocultada da visualização operacional e movida para o Histórico.
                     </p>
                   </div>
                 )}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white/[0.02] border border-white/10 p-10 lg:p-14 rounded-[3.5rem] space-y-12 shadow-2xl">
                <div className="flex justify-between items-center">
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Orçamento Detalhado</h3>
                   <div className="text-right bg-black/40 px-8 py-5 rounded-[2rem] border border-white/5"><p className="text-5xl font-black text-white">R$ {selectedOS.total.toFixed(2)}</p></div>
                </div>

                <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase ml-1">Tipo</label><select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white font-bold text-xs"><option value="PEÇA">Peça</option><option value="MÃO DE OBRA">Serviço</option></select></div>
                    <div className="md:col-span-2 space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase ml-1">Descrição</label><input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white font-bold text-xs" /></div>
                    <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase ml-1">Qtd</label><input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white font-black text-xs" /></div>
                    <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase ml-1">Preço</label><input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white font-bold text-xs" /></div>
                  </div>
                  <button onClick={handleAddItem} className="w-full py-4 bg-cyan-500 text-black font-black rounded-2xl uppercase text-[10px] tracking-widest">Lançar no Orçamento</button>
                </div>

                <div className="overflow-hidden border border-white/5 rounded-3xl">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[9px] font-black text-slate-500 uppercase">
                      <tr><th className="px-8 py-5">Descrição</th><th className="px-8 py-5 text-center">Qtd</th><th className="px-8 py-5 text-right">Subtotal</th><th className="px-8 py-5"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedOS.items.map(item => (
                        <tr key={item.id} className="hover:bg-white/[0.02] text-sm font-bold text-white">
                          <td className="px-8 py-5">{item.description}</td>
                          <td className="px-8 py-5 text-center">{item.quantity}</td>
                          <td className="px-8 py-5 text-right">R$ {(item.price * item.quantity).toFixed(2)}</td>
                          <td className="px-8 py-5 text-right"><button onClick={() => removeItem(item.id)} className="p-2 text-slate-600 hover:text-red-500"><Trash2 size={16}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
