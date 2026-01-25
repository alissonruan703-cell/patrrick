
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, Clock, 
  X, ChevronRight, Camera, 
  Send, User, Car, Wrench, Trash2,
  ImagePlus, Trash, History, LayoutGrid, CheckCircle2,
  Settings, Briefcase, Box, Tag
} from 'lucide-react';
import { ServiceOrder, ServiceItem } from '../types';

type OficinaTab = 'ativos' | 'historico' | 'nova';

const Oficina: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OficinaTab>('ativos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States para novo item
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
      
      const isHistory = o.status === 'Entregue';
      
      if (activeTab === 'ativos') {
        if (isHistory) return false;
        if (statusFilter !== 'Todos' && o.status !== statusFilter) return false;
      } else {
        if (!isHistory) return false;
      }
      
      return matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchTerm, activeTab, statusFilter]);

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
    <div className="pt-28 px-6 lg:px-12 max-w-screen-2xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Header & Tabs */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">OFICINA <span className="text-violet-600">PRO</span></h1>
            <div className="flex items-center gap-4">
               <button 
                onClick={() => { setActiveTab('ativos'); setView('lista'); }}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all pb-1 border-b-2 ${activeTab === 'ativos' ? 'border-violet-600 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
               >
                 Atendimentos Ativos
               </button>
               <button 
                onClick={() => { setActiveTab('historico'); setView('lista'); }}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all pb-1 border-b-2 ${activeTab === 'historico' ? 'border-violet-600 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
               >
                 Histórico Finalizado
               </button>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('nova')} 
            className={`px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'nova' ? 'bg-violet-600 text-white' : 'bg-white text-black hover:bg-slate-200'}`}
          >
            <Plus size={18} /> Abrir Nova O.S.
          </button>
        </div>

        {view === 'lista' && activeTab !== 'nova' && (
          <div className="space-y-6">
            {activeTab === 'ativos' && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {['Todos', 'Aberto', 'Orçamento', 'Execução', 'Pronto'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${statusFilter === status ? 'bg-white text-black border-white' : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}

            <div className="relative group max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={20} />
              <input 
                placeholder="Buscar por placa ou cliente..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-[#1a1d23] border border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 transition-all text-white font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map(o => (
                <div 
                  key={o.id} 
                  onClick={() => { setSelectedOS(o); setView('detalhes'); }} 
                  className="bg-[#1a1d23] p-6 rounded-2xl border border-white/5 hover:border-violet-500/50 cursor-pointer group transition-all hover:bg-[#22272e] shadow-xl hover:-translate-y-1 flex flex-col justify-between h-56"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-black/40 rounded-xl text-slate-400 group-hover:text-violet-500 transition-colors"><Car size={24} /></div>
                    <span className="px-3 py-1 bg-violet-600/10 text-violet-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-violet-500/20">{o.status}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{o.clientName}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{o.vehicle} • <span className="text-violet-500">{o.plate}</span></p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-lg font-black text-white">R$ {o.total.toFixed(2)}</p>
                    <ChevronRight size={20} className="text-slate-600 group-hover:text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeTab === 'nova' && (
        <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-[#1a1d23] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Nova Ordem de Serviço</h2>
                <button onClick={() => setActiveTab('ativos')} className="text-slate-500 hover:text-white"><X size={24}/></button>
              </div>
              <form onSubmit={handleCreateOS} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cliente</label>
                    <input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full px-5 py-4 bg-[#0f1115] border border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefone</label>
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 bg-[#0f1115] border border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Veículo</label>
                    <input required value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})} className="w-full px-5 py-4 bg-[#0f1115] border border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Placa</label>
                    <input required value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} className="w-full px-5 py-4 bg-[#0f1115] border border-white/5 rounded-xl uppercase font-mono outline-none focus:ring-2 focus:ring-violet-500 text-white transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sintomas</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-[#0f1115] border border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-white transition-all" />
                </div>
                <button type="submit" className="w-full py-5 bg-white text-black font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-[0.2em] text-xs">Iniciar O.S.</button>
              </form>
           </div>
        </div>
      )}

      {view === 'detalhes' && selectedOS && (
        <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-700">
          
          {/* Status Tracker Superior (A lista de status por cima da OS) */}
          <div className="bg-[#1a1d23] p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-2 shadow-lg">
            {statusOptions.map((s, idx) => (
              <React.Fragment key={s}>
                <button 
                  onClick={() => updateStatus(s)}
                  className={`flex-1 min-w-[120px] py-3 rounded-xl flex items-center justify-center gap-2 transition-all border ${selectedOS.status === s ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20' : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/20'}`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${selectedOS.status === s ? 'bg-white text-violet-600' : 'bg-slate-800 text-slate-500'}`}>{idx + 1}</div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{s}</span>
                </button>
                {idx < statusOptions.length - 1 && <div className="hidden lg:block w-4 h-px bg-white/5" />}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-[#1a1d23] p-8 lg:p-10 rounded-3xl border border-white/5 shadow-2xl space-y-10">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div className="space-y-4">
                <button onClick={() => setView('lista')} className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] hover:text-white transition-all flex items-center gap-2">
                  <X size={14} /> Fechar Detalhes
                </button>
                <div className="space-y-1">
                  <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter">O.S. <span className="text-violet-500">#{selectedOS.id}</span></h2>
                  <div className="flex items-center gap-4 text-slate-400">
                    <p className="text-lg font-bold uppercase">{selectedOS.clientName}</p>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <p className="text-lg font-mono text-violet-500 tracking-widest">{selectedOS.plate}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
                 <button 
                  onClick={() => {
                    const link = generateShareLink();
                    const msg = `Olá! O orçamento da sua O.S. #${selectedOS.id} já está disponível:\n\n${link}`;
                    window.open(`https://wa.me/55${selectedOS.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                  }} 
                  className="w-full lg:w-auto px-8 py-4 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all uppercase tracking-widest shadow-xl shadow-emerald-600/10"
                >
                  <Send size={18} fill="white"/> Enviar Orçamento
                </button>
                <div className="text-right p-6 bg-black/40 rounded-2xl border border-white/5 w-full">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Consolidado</p>
                   <h3 className="text-4xl font-black text-white">R$ {selectedOS.total.toFixed(2)}</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
               {/* Serviços Table */}
               <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Detalhamento Técnico</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[8px] font-black text-slate-600 uppercase">Peça</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[8px] font-black text-slate-600 uppercase">Mão de Obra</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-[#0f1115] rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#1a1d23] text-[9px] uppercase font-black text-slate-500">
                          <tr>
                            <th className="px-6 py-4 text-left">Tipo</th>
                            <th className="px-6 py-4 text-left">Descrição</th>
                            <th className="px-6 py-4 text-left">Marca</th>
                            <th className="px-6 py-4 text-center">Qtd</th>
                            <th className="px-6 py-4 text-right">Unitário</th>
                            <th className="px-6 py-4 text-right">Total</th>
                            <th className="px-6 py-4 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {selectedOS.items.map((item, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors group">
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.type === 'PEÇA' ? 'bg-blue-500/10 text-blue-500' : item.type === 'MÃO DE OBRA' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-200">{item.description}</td>
                              <td className="px-6 py-4 text-slate-500">{item.brand}</td>
                              <td className="px-6 py-4 text-center font-black">{item.quantity}</td>
                              <td className="px-6 py-4 text-right text-slate-400">R$ {item.price.toFixed(2)}</td>
                              <td className="px-6 py-4 text-right font-black text-white">R$ {(item.price * item.quantity).toFixed(2)}</td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => removeItem(item.id)} className="text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                              </td>
                            </tr>
                          ))}
                          
                          {/* Input Row Refatorada */}
                          <tr className="bg-violet-600/5">
                            <td className="px-4 py-3">
                              <select 
                                value={newItemType} 
                                onChange={e => setNewItemType(e.target.value as any)} 
                                className="bg-[#1a1d23] border border-white/10 rounded px-2 py-1.5 text-[10px] font-black text-white uppercase outline-none focus:ring-1 focus:ring-violet-500"
                              >
                                <option value="PEÇA">Peça</option>
                                <option value="MÃO DE OBRA">M.O.</option>
                                <option value="NOTA">Nota</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input placeholder="Ex: Óleo 5W30" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className="w-full bg-transparent border-none text-xs font-bold focus:ring-0 text-white placeholder:text-slate-700" />
                            </td>
                            <td className="px-4 py-3">
                              <input placeholder="Marca..." value={newItemBrand} onChange={e => setNewItemBrand(e.target.value)} className="w-full bg-transparent border-none text-xs focus:ring-0 text-white placeholder:text-slate-700" />
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} className="w-12 bg-transparent border-none text-xs focus:ring-0 text-center text-white font-black" />
                            </td>
                            <td className="px-4 py-3">
                              <input placeholder="0.00" type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-24 bg-transparent border-none text-xs focus:ring-0 text-right text-violet-400 font-bold" />
                            </td>
                            <td className="px-4 py-3 text-right">
                               <span className="text-[10px] font-black text-violet-500/40 italic">Novo</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={addItemInline} className="p-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-all shadow-lg"><Plus size={16} strokeWidth={4} /></button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
               </div>

               {/* Lateral Info */}
               <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Galeria de Check-in</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedOS.photos?.map((p, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/5 group relative">
                          <img src={p} className="w-full h-full object-cover" />
                          <button className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Search size={20} className="text-white" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => fileInputRef.current?.click()} className="aspect-square bg-[#0f1115] border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-slate-700 hover:text-violet-500 transition-all group">
                          <ImagePlus size={24} />
                          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 p-6 bg-red-600/5 rounded-2xl border border-red-600/10">
                    <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Área de Risco</h3>
                    <button 
                      onClick={deleteOS}
                      className="w-full py-4 bg-red-600 text-white font-black rounded-xl uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-600/10"
                    >
                      <Trash size={14}/> Excluir Registro
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        select option { background-color: #1a1d23; color: white; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Oficina;
