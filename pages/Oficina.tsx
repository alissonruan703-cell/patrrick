
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, Clock, 
  X, ChevronRight, Camera, 
  Send, User, Car, Wrench, Trash2,
  ImagePlus, Trash, History, LayoutGrid, CheckCircle2,
  Settings, Briefcase, Box, Tag, Filter, Calendar
} from 'lucide-react';
import { ServiceOrder, ServiceItem } from '../types';

type OficinaTab = 'ativos' | 'historico' | 'nova';

const Oficina: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OficinaTab>('ativos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlate, setFilterPlate] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [newItemType, setNewItemType] = useState<'PEÇA' | 'MÃO DE OBRA' | 'NOTA'>('PEÇA');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');

  const [formData, setFormData] = useState({ clientName: '', plate: '', vehicle: '', phone: '', description: '' });
  const [osPhotos, setOsPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  const statusOptions: ServiceOrder['status'][] = ['Aberto', 'Orçamento', 'Execução', 'Pronto', 'Entregue'];

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           o.plate.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPlate = filterPlate ? o.plate.toLowerCase().includes(filterPlate.toLowerCase()) : true;

      let matchesDate = true;
      if (filterDateStart || filterDateEnd) {
        const [day, month, year] = o.createdAt.split('/').map(Number);
        const orderDate = new Date(year, month - 1, day);
        
        if (filterDateStart) {
          const start = new Date(filterDateStart);
          if (orderDate < start) matchesDate = false;
        }
        if (filterDateEnd) {
          const end = new Date(filterDateEnd);
          if (orderDate > end) matchesDate = false;
        }
      }
      
      const isHistory = o.status === 'Entregue';
      
      if (activeTab === 'ativos') {
        if (isHistory) return false;
        if (statusFilter !== 'Todos' && o.status !== statusFilter) return false;
      } else {
        if (!isHistory) return false;
      }
      
      return matchesSearch && matchesPlate && matchesDate;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt.split('/').reverse().join('-'));
      const dateB = new Date(b.createdAt.split('/').reverse().join('-'));
      return dateB.getTime() - dateA.getTime();
    });
  }, [orders, searchTerm, activeTab, statusFilter, filterPlate, filterDateStart, filterDateEnd]);

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: ServiceOrder = {
      id: (Math.floor(Math.random() * 9000) + 1000).toString(),
      ...formData,
      status: 'Aberto',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      total: 0,
      items: [],
      photos: osPhotos
    };
    setOrders([nova, ...orders]);
    setFormData({ clientName: '', plate: '', vehicle: '', phone: '', description: '' });
    setOsPhotos([]);
    setActiveTab('ativos');
    setView('lista');
  };

  const addItemInline = () => {
    if (!selectedOS || !newItemDesc) return;
    const qty = parseFloat(newItemQty) || 1;
    const price = parseFloat(newItemPrice) || 0;
    
    const item: ServiceItem = {
      id: Date.now().toString(),
      type: newItemType,
      description: newItemDesc,
      brand: newItemBrand || '-',
      quantity: qty,
      price: price,
      timestamp: new Date().toLocaleTimeString()
    };
    
    const updatedItems = [...selectedOS.items, item];
    const updatedTotal = updatedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    
    const updated = { ...selectedOS, items: updatedItems, total: updatedTotal };
    setSelectedOS(updated);
    setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
    
    setNewItemDesc('');
    setNewItemBrand('');
    setNewItemQty('1');
    setNewItemPrice('');
  };

  const removeItem = (id: string) => {
    if (!selectedOS) return;
    const updatedItems = selectedOS.items.filter(i => i.id !== id);
    const updatedTotal = updatedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const updated = { ...selectedOS, items: updatedItems, total: updatedTotal };
    setSelectedOS(updated);
    setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
  };

  const deleteOS = () => {
    if (!selectedOS) return;
    if (window.confirm("Deseja deletar permanentemente esta O.S.?")) {
      setOrders(orders.filter(o => o.id !== selectedOS.id));
      setView('lista');
    }
  };

  const generateShareLink = () => {
    if (!selectedOS) return "";
    const data = {
      id: selectedOS.id,
      client: selectedOS.clientName,
      vehicle: selectedOS.vehicle,
      plate: selectedOS.plate,
      phone: selectedOS.phone,
      description: selectedOS.description,
      items: selectedOS.items,
      total: selectedOS.total,
      date: selectedOS.createdAt
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    const baseUrl = window.location.href.split('#')[0];
    return `${baseUrl}#/v/${encoded}`;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (view === 'detalhes' && selectedOS) {
        const updatedPhotos = [...(selectedOS.photos || []), base64String];
        const updated = { ...selectedOS, photos: updatedPhotos };
        setSelectedOS(updated);
        setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
      } else if (activeTab === 'nova') {
        setOsPhotos(prev => [...prev, base64String]);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const updateStatus = (newStatus: ServiceOrder['status']) => {
    if (!selectedOS) return;
    const updated = { ...selectedOS, status: newStatus };
    setSelectedOS(updated);
    setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
  };

  return (
    <div className="pt-24 px-6 lg:px-10 max-w-screen-2xl mx-auto space-y-6 animate-in fade-in duration-700 text-[13px]">
      
      {/* Header Compacto e Ajustado */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-[#1a1d23] p-6 rounded-2xl border border-white/5 shadow-xl">
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">OFICINA <span className="text-violet-500">PRO+</span></h1>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => { setActiveTab('ativos'); setView('lista'); }}
              className={`px-4 py-1.5 rounded-lg font-black uppercase tracking-widest transition-all text-[10px] ${activeTab === 'ativos' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-500 hover:bg-white/5'}`}
             >
               Ativos
             </button>
             <button 
              onClick={() => { setActiveTab('historico'); setView('lista'); }}
              className={`px-4 py-1.5 rounded-lg font-black uppercase tracking-widest transition-all text-[10px] ${activeTab === 'historico' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-500 hover:bg-white/5'}`}
             >
               Histórico
             </button>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('nova')} 
          className="px-6 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2 shadow-xl"
        >
          <Plus size={16} strokeWidth={3} /> Nova O.S.
        </button>
      </div>

      {view === 'lista' && activeTab !== 'nova' && (
        <div className="space-y-4">
          {/* Busca e Filtros */}
          <div className="bg-[#1a1d23] p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  placeholder="Pesquisar por cliente, placa..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 text-white text-[12px] transition-all"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${showFilters ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                <Filter size={16} /> Filtros
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
                <input value={filterPlate} onChange={e => setFilterPlate(e.target.value)} placeholder="Placa" className="w-full px-4 py-2 bg-black/40 border border-white/5 rounded-lg text-xs text-white uppercase font-mono" />
                <input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} className="w-full px-4 py-2 bg-black/40 border border-white/5 rounded-lg text-xs text-white" />
                <input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} className="w-full px-4 py-2 bg-black/40 border border-white/5 rounded-lg text-xs text-white" />
                <button onClick={() => { setFilterPlate(''); setFilterDateStart(''); setFilterDateEnd(''); setSearchTerm(''); }} className="w-full py-2 bg-red-600/10 text-red-500 font-black rounded-lg text-[9px] uppercase border border-red-500/10">Limpar</button>
              </div>
            )}
          </div>

          {/* Grid de Cards Compacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredOrders.map(o => (
              <div 
                key={o.id} 
                onClick={() => { setSelectedOS(o); setView('detalhes'); }} 
                className="bg-[#1a1d23] p-5 rounded-2xl border border-white/5 hover:border-violet-500/50 cursor-pointer group transition-all hover:bg-[#22272e] flex flex-col justify-between min-h-[160px] shadow-lg hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-[10px] font-black text-violet-500 font-mono bg-violet-500/10 px-2 py-0.5 rounded">#{o.id}</div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${o.status === 'Pronto' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-violet-600/10 text-violet-500'}`}>
                    {o.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white truncate group-hover:text-violet-400 transition-colors">{o.clientName}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{o.vehicle} • {o.plate}</p>
                </div>
                <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-500 text-[9px] font-bold">
                    <Calendar size={12} /> {o.createdAt}
                  </div>
                  <p className="text-sm font-black text-white">R$ {o.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalhes da O.S. - Refatorado com mais espaçamento na tabela */}
      {view === 'detalhes' && selectedOS && (
        <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-700">
          
          {/* Status Bar */}
          <div className="bg-[#1a1d23] p-3 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-2 shadow-xl">
            {statusOptions.map((s) => (
              <button 
                key={s}
                onClick={() => updateStatus(s)}
                className={`flex-1 min-w-[100px] py-3 rounded-xl flex items-center justify-center transition-all border ${selectedOS.status === s ? 'bg-violet-600 border-violet-500 text-white' : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300'}`}
              >
                <span className="text-[9px] font-black uppercase tracking-widest">{s}</span>
              </button>
            ))}
            <button onClick={() => setView('lista')} className="p-3 text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
          </div>

          <div className="bg-[#1a1d23] p-6 lg:p-8 rounded-3xl border border-white/5 shadow-2xl space-y-8">
            <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">O.S. <span className="text-violet-500">#{selectedOS.id}</span></h2>
                <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[11px]">
                  <span className="text-lg text-white">{selectedOS.clientName}</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full" />
                  <span className="text-violet-500 font-mono tracking-widest">{selectedOS.plate}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full xl:w-auto">
                <div className="text-right p-4 bg-black/40 rounded-2xl border border-white/5 min-w-[160px]">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total</p>
                   <h3 className="text-2xl font-black text-white">R$ {selectedOS.total.toFixed(2)}</h3>
                </div>
                <button 
                  onClick={() => {
                    const link = generateShareLink();
                    window.open(`https://wa.me/55${selectedOS.phone}?text=${encodeURIComponent(`Orçamento O.S. #${selectedOS.id}:\n\n${link}`)}`, '_blank');
                  }} 
                  className="px-6 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-emerald-500 transition-all uppercase tracking-widest shadow-lg"
                >
                  <Send size={16} fill="white"/> Enviar Orçamento
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#0f1115] rounded-2xl overflow-hidden border border-white/5">
                    <table className="w-full text-[12px]">
                      <thead className="bg-[#1a1d23] text-[8px] uppercase font-black text-slate-500 border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4 text-left">Tipo</th>
                          <th className="px-6 py-4 text-left">Descrição</th>
                          <th className="px-6 py-4 text-left">Marca</th>
                          <th className="px-6 py-4 text-center">Qtd</th>
                          <th className="px-6 py-4 text-right">Preço</th>
                          <th className="px-6 py-4 text-right">Total</th>
                          <th className="px-6 py-4 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {selectedOS.items.map((item, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors group">
                            {/* py-5 garante o espaçamento maior entre os itens solicitado */}
                            <td className="px-6 py-5">
                              <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${item.type === 'PEÇA' ? 'bg-blue-500/10 text-blue-500' : item.type === 'MÃO DE OBRA' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="px-6 py-5 font-bold text-white">{item.description}</td>
                            <td className="px-6 py-5 text-slate-500">{item.brand}</td>
                            <td className="px-6 py-5 text-center font-black">{item.quantity}</td>
                            <td className="px-6 py-5 text-right">R$ {item.price.toFixed(2)}</td>
                            <td className="px-6 py-5 text-right font-black text-white">R$ {(item.price * item.quantity).toFixed(2)}</td>
                            <td className="px-6 py-5 text-right">
                              <button onClick={() => removeItem(item.id)} className="text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        ))}
                        
                        <tr className="bg-violet-600/5">
                          <td className="px-4 py-4">
                            <select value={newItemType} onChange={e => setNewItemType(e.target.value as any)} className="bg-[#1a1d23] border border-white/10 rounded px-2 py-1.5 text-[9px] font-black text-white uppercase outline-none focus:ring-2 focus:ring-violet-500/20">
                              <option value="PEÇA">Peça</option>
                              <option value="MÃO DE OBRA">M.O.</option>
                              <option value="NOTA">Nota</option>
                            </select>
                          </td>
                          <td className="px-4 py-4"><input placeholder="Descrição..." value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className="w-full bg-transparent border-none text-[12px] font-bold focus:ring-0 text-white placeholder:text-slate-700" /></td>
                          <td className="px-4 py-4"><input placeholder="Marca..." value={newItemBrand} onChange={e => setNewItemBrand(e.target.value)} className="w-full bg-transparent border-none text-[12px] focus:ring-0 text-white placeholder:text-slate-700" /></td>
                          <td className="px-4 py-4 text-center"><input type="number" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} className="w-10 bg-transparent border-none text-[12px] font-black focus:ring-0 text-center text-white" /></td>
                          <td className="px-4 py-4 text-right"><input placeholder="0.00" type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-20 bg-transparent border-none text-[12px] font-black focus:ring-0 text-right text-violet-400" /></td>
                          <td className="px-4 py-4 text-right">
                             <button onClick={addItemInline} className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-all shadow-lg"><Plus size={16} strokeWidth={4} /></button>
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="p-5 bg-black/20 rounded-2xl border border-white/5 space-y-4 shadow-xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Fotos do Veículo</p>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedOS.photos?.map((p, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10 relative group">
                          <img src={p} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Search size={20} className="text-white" /></div>
                        </div>
                      ))}
                      <button onClick={() => fileInputRef.current?.click()} className="aspect-square bg-black/40 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-slate-700 hover:text-violet-500 transition-all">
                        <ImagePlus size={32} />
                        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                      </button>
                    </div>
                  </div>
                  <button onClick={deleteOS} className="w-full py-3 bg-red-600/5 text-red-500 font-black rounded-xl uppercase text-[9px] tracking-widest border border-red-500/10 hover:bg-red-600 hover:text-white transition-all">Excluir Registro</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário Nova O.S. Ajustado */}
      {activeTab === 'nova' && (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-5 duration-500">
           <div className="bg-[#1a1d23] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h2 className="text-lg font-black text-white uppercase tracking-widest">Abertura de O.S.</h2>
                <button onClick={() => setActiveTab('ativos')} className="text-slate-500 hover:text-white"><X size={24}/></button>
              </div>
              <form onSubmit={handleCreateOS} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Cliente</label>
                    <input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Veículo</label>
                    <input required value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Placa</label>
                    <input required value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm uppercase font-mono text-white outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Diagnóstico Inicial</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/20" />
                </div>
                <button type="submit" className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95">Gerar Ordem de Serviço</button>
              </form>
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
