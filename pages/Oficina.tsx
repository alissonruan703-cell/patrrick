
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, X, Send, Trash2,
  Calendar, FileText, ArrowLeft, ChevronDown, Zap, User, Car, Phone, Hash, ClipboardList, Package, Wrench, DollarSign, Share2, Check
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

  // Estados para Nova OS
  const [newOS, setNewOS] = useState<Partial<ServiceOrder>>({
    clientName: '', phone: '', vehicle: '', plate: '', description: '', items: [], status: 'Aberto'
  });
  const [newItem, setNewItem] = useState<Partial<ServiceItem>>({ type: 'PEÇA', description: '', brand: '', quantity: 1, price: 0 });

  const addLog = (action: string, details: string) => {
    if (!activeProfile) return;
    const logs = JSON.parse(localStorage.getItem('crmplus_logs') || '[]');
    const newLog: LogEntry = { id: Date.now().toString(), timestamp: new Date().toLocaleString(), userId: activeProfile.id, userName: activeProfile.name, action, details, system: 'OFICINA' };
    localStorage.setItem('crmplus_logs', JSON.stringify([newLog, ...logs].slice(0, 1000)));
  };

  const loadData = () => {
    const savedOrders = localStorage.getItem('crmplus_oficina_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    const savedProfile = sessionStorage.getItem('crmplus_active_profile');
    if (savedProfile) setActiveProfile(JSON.parse(savedProfile));
  };

  useEffect(() => { loadData(); }, []);

  const saveOrders = (updated: ServiceOrder[]) => {
    setOrders(updated);
    localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOS.clientName || !newOS.vehicle || !newOS.plate) return;
    
    const os: ServiceOrder = {
      ...newOS as ServiceOrder,
      id: (orders.length + 100).toString(),
      createdAt: new Date().toLocaleDateString('pt-BR'),
      items: [],
      total: 0,
      status: 'Aberto'
    };

    const updated = [os, ...orders];
    saveOrders(updated);
    addLog('CREATE_OS', `Nova O.S. #${os.id} para ${os.clientName}`);
    setNewOS({ clientName: '', phone: '', vehicle: '', plate: '', description: '', items: [], status: 'Aberto' });
    setActiveTab('ativos');
  };

  const handleUpdateStatus = (id: string, newStatus: ServiceOrder['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    saveOrders(updated);
    if (selectedOS?.id === id) setSelectedOS({ ...selectedOS, status: newStatus });
    addLog('UPDATE_STATUS', `O.S. #${id} alterada para ${newStatus}`);
  };

  const handleDeleteOS = (id: string) => {
    if (!window.confirm('Excluir esta O.S. permanentemente?')) return;
    const updated = orders.filter(o => o.id !== id);
    saveOrders(updated);
    addLog('DELETE_OS', `O.S. #${id} excluída`);
    setView('lista');
    setSelectedOS(null);
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.price || !selectedOS) return;
    const item: ServiceItem = { ...newItem as ServiceItem, id: Date.now().toString(), timestamp: new Date().toISOString() };
    const updatedItems = [...(selectedOS.items || []), item];
    const newTotal = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    
    const updatedOS = { ...selectedOS, items: updatedItems, total: newTotal };
    const updatedOrders = orders.map(o => o.id === selectedOS.id ? updatedOS : o);
    
    setSelectedOS(updatedOS);
    saveOrders(updatedOrders);
    setNewItem({ type: 'PEÇA', description: '', brand: '', quantity: 1, price: 0 });
    addLog('ADD_ITEM', `Item adicionado à O.S. #${selectedOS.id}`);
  };

  const generatePublicLink = () => {
    if (!selectedOS) return "";
    const config = JSON.parse(localStorage.getItem('crmplus_system_config') || '{}');
    const payload = {
      i: selectedOS.id,
      n: selectedOS.clientName,
      v: selectedOS.vehicle,
      p: selectedOS.plate,
      d: selectedOS.description,
      o: selectedOS.observation || "",
      t: selectedOS.total,
      dt: selectedOS.createdAt,
      cn: config.companyName || "CRMPLUS",
      it: (selectedOS.items || []).map(i => ({
        t: i.type[0], d: i.description, b: i.brand, q: i.quantity, p: i.price
      }))
    };
    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    return `${window.location.origin}${window.location.pathname}#/v/${base64}`;
  };

  const copyLink = () => {
    const link = generatePublicLink();
    navigator.clipboard.writeText(link);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.plate.toLowerCase().includes(searchTerm.toLowerCase());
      const isHistory = o.status === 'Entregue' || o.status === 'Reprovado';
      if (statusFilter !== 'Todos' && o.status !== statusFilter) return false;
      if (activeTab === 'ativos') { if (isHistory) return false; } else { if (!isHistory) return false; }
      return matchesSearch;
    });
  }, [orders, searchTerm, activeTab, statusFilter]);

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
      
      {/* Header e Navegação */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-8 bg-white/[0.02] backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full"></div>
        <div className="space-y-6 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">OFICINA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">PRO+</span></h1>
          <div className="flex items-center gap-3">
             <button onClick={() => { setActiveTab('ativos'); setView('lista'); }} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all text-[10px] ${activeTab === 'ativos' && view === 'lista' ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(0,240,255,0.4)]' : 'text-slate-300 hover:bg-white/10'}`}>Operacional</button>
             <button onClick={() => { setActiveTab('historico'); setView('lista'); }} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all text-[10px] ${activeTab === 'historico' ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(0,240,255,0.4)]' : 'text-slate-300 hover:bg-white/10'}`}>Histórico</button>
          </div>
        </div>
        <button onClick={() => { setActiveTab('nova'); setView('lista'); }} className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:brightness-125 hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl relative z-10">
          <Plus size={18} strokeWidth={4} /> Nova O.S.
        </button>
      </div>

      {/* Busca */}
      {view === 'lista' && activeTab !== 'nova' && (
        <div className="relative z-10 group max-w-xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors" size={20} />
          <input 
            placeholder="Pesquisar por cliente ou placa..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-md transition-all"
          />
        </div>
      )}

      {/* Conteúdo: Lista */}
      {view === 'lista' && activeTab !== 'nova' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
          {filteredOrders.map(o => (
            <div key={o.id} className="p-8 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-md transition-all flex flex-col justify-between min-h-[260px] shadow-xl hover:border-cyan-500/40 group hover:shadow-[0_0_40px_rgba(0,240,255,0.1)]">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-cyan-400 font-mono bg-cyan-400/10 px-3 py-1.5 rounded-xl border border-cyan-400/30">#{o.id}</span>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusClasses(o.status)}`}>{o.status}</div>
                </div>
                <div onClick={() => { setSelectedOS(o); setView('detalhes'); }} className="cursor-pointer space-y-3">
                  <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight truncate">{o.clientName}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">{o.vehicle}</span>
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                    <span className="text-[11px] font-black text-cyan-400 font-mono tracking-widest">{o.plate}</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Calendar size={12} className="text-cyan-400" /> {o.createdAt}</span>
                <span className="text-white font-black text-base">R$ {o.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4 opacity-30">
              <ClipboardList size={64} className="mx-auto" />
              <p className="font-black uppercase tracking-widest text-xs">Nenhuma ordem de serviço encontrada</p>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo: Nova OS */}
      {activeTab === 'nova' && (
        <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl animate-in slide-in-from-bottom-10">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4"><Plus className="text-cyan-400" /> Abrir <span className="text-cyan-400">Nova O.S.</span></h2>
          <form onSubmit={handleCreateOS} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cliente</label>
                <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16}/><input value={newOS.clientName} onChange={e => setNewOS({...newOS, clientName: e.target.value})} className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20"/></div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Celular / WhatsApp</label>
                <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16}/><input value={newOS.phone} onChange={e => setNewOS({...newOS, phone: e.target.value})} className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20"/></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Veículo (Marca/Modelo)</label>
                <div className="relative"><Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16}/><input value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20"/></div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Placa</label>
                <div className="relative"><Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16}/><input value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value.toUpperCase()})} className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 uppercase font-mono"/></div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Diagnóstico Inicial / Solicitação</label>
              <div className="relative"><ClipboardList className="absolute left-4 top-6 text-slate-600" size={16}/><textarea value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} className="w-full bg-black border border-white/5 rounded-2xl py-5 pl-12 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 min-h-[120px]"/></div>
            </div>
            <button type="submit" className="w-full py-6 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] shadow-2xl hover:brightness-110 active:scale-95 transition-all">Ativar Protocolo de Manutenção</button>
          </form>
        </div>
      )}

      {/* Conteúdo: Detalhes da OS */}
      {view === 'detalhes' && selectedOS && (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="flex items-center justify-between">
              <button onClick={() => setView('lista')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"><ArrowLeft size={16}/> Voltar para Lista</button>
              <div className="flex gap-4">
                 <button onClick={copyLink} className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-cyan-400 transition-all">
                   {copyFeedback ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16}/>} 
                   {copyFeedback ? 'Link Copiado' : 'Link do Cliente'}
                 </button>
                 <button onClick={() => handleDeleteOS(selectedOS.id)} className="p-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Info Card */}
              <div className="lg:col-span-1 space-y-8">
                 <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3rem] space-y-8">
                    <div className="space-y-2">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusClasses(selectedOS.status)}`}>{selectedOS.status}</span>
                       <h2 className="text-3xl font-black text-white uppercase tracking-tighter">#{selectedOS.id}</h2>
                    </div>
                    <div className="space-y-6">
                       <div className="flex items-start gap-4">
                          <User size={20} className="text-cyan-400 mt-1"/>
                          <div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</p>
                             <p className="text-lg font-black text-white">{selectedOS.clientName}</p>
                             <p className="text-slate-400 text-xs font-bold">{selectedOS.phone}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-4">
                          <Car size={20} className="text-cyan-400 mt-1"/>
                          <div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Veículo</p>
                             <p className="text-lg font-black text-white uppercase">{selectedOS.vehicle}</p>
                             <p className="text-cyan-400 font-black tracking-widest text-sm neon-text-cyan">{selectedOS.plate}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-4 pt-8 border-t border-white/5">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Trocar Status</p>
                       <div className="grid grid-cols-2 gap-2">
                          {['Aberto', 'Orçamento', 'Execução', 'Pronto', 'Entregue', 'Reprovado'].map(st => (
                            <button 
                              key={st} 
                              onClick={() => handleUpdateStatus(selectedOS.id, st as any)}
                              className={`py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${selectedOS.status === st ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'}`}
                            >
                              {st}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Items Card */}
              <div className="lg:col-span-2 space-y-8">
                 <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3rem] space-y-10">
                    <div className="flex items-center justify-between">
                       <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4"><Zap className="text-cyan-400"/> Itens da <span className="text-cyan-400">O.S.</span></h3>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Geral</p>
                          <p className="text-4xl font-black text-white tracking-tighter">R$ {selectedOS.total.toFixed(2)}</p>
                       </div>
                    </div>

                    {/* Adicionar Item */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                       <div className="sm:col-span-1">
                          <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full bg-black border border-white/5 rounded-xl py-4 px-4 text-white text-[10px] font-black uppercase tracking-widest outline-none">
                             <option value="PEÇA">Peça</option>
                             <option value="MÃO DE OBRA">Mão de Obra</option>
                             <option value="NOTA">Nota</option>
                          </select>
                       </div>
                       <div className="sm:col-span-2">
                          <input placeholder="Descrição do item..." value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-black border border-white/5 rounded-xl py-4 px-6 text-white text-xs font-bold outline-none" />
                       </div>
                       <div className="sm:col-span-1 flex gap-2">
                          <input type="number" placeholder="R$" value={newItem.price || ''} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} className="w-full bg-black border border-white/5 rounded-xl py-4 px-4 text-white text-xs font-bold outline-none" />
                          <button onClick={handleAddItem} className="p-4 bg-cyan-500 text-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"><Plus size={18}/></button>
                       </div>
                    </div>

                    {/* Lista de Itens */}
                    <div className="space-y-4">
                       {selectedOS.items.length === 0 ? (
                          <div className="py-20 text-center opacity-30 space-y-4">
                             <Package size={48} className="mx-auto" />
                             <p className="text-[10px] font-black uppercase tracking-widest">Nenhum item lançado ainda</p>
                          </div>
                       ) : (
                          <div className="divide-y divide-white/5">
                             {selectedOS.items.map((item) => (
                               <div key={item.id} className="py-5 flex items-center justify-between group">
                                  <div className="flex items-center gap-4">
                                     <div className={`p-3 rounded-xl ${item.type === 'PEÇA' ? 'bg-amber-500/10 text-amber-500' : item.type === 'MÃO DE OBRA' ? 'bg-cyan-500/10 text-cyan-500' : 'bg-violet-500/10 text-violet-500'}`}>
                                        {item.type === 'PEÇA' ? <Package size={16}/> : item.type === 'MÃO DE OBRA' ? <Wrench size={16}/> : <FileText size={16}/>}
                                     </div>
                                     <div>
                                        <p className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{item.description}</p>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.type} {item.brand && `• ${item.brand}`}</p>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-8">
                                     <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preço</p>
                                        <p className="text-sm font-black text-white">R$ {item.price.toFixed(2)}</p>
                                     </div>
                                     <button 
                                      onClick={() => {
                                        const updatedItems = selectedOS.items.filter(i => i.id !== item.id);
                                        const newTotal = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
                                        const updatedOS = { ...selectedOS, items: updatedItems, total: newTotal };
                                        const updatedOrders = orders.map(o => o.id === selectedOS.id ? updatedOS : o);
                                        setSelectedOS(updatedOS);
                                        saveOrders(updatedOrders);
                                        addLog('REMOVE_ITEM', `Item removido da O.S. #${selectedOS.id}`);
                                      }}
                                      className="p-2 text-slate-700 hover:text-red-500 transition-colors"
                                     >
                                       <Trash2 size={16}/>
                                     </button>
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

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Oficina;
