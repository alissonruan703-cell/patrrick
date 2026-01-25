
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, Clock, 
  X, ChevronRight, Camera, 
  Send, User, Car, Wrench, Trash2,
  ImagePlus, Trash
} from 'lucide-react';
import { ServiceOrder, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const [view, setView] = useState<'lista' | 'nova' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const [formData, setFormData] = useState({ clientName: '', plate: '', vehicle: '', phone: '', description: '' });
  const [osPhotos, setOsPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.plate.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchTerm]);

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
    setView('lista');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const data = reader.result as string;
        if (view === 'nova') setOsPhotos([...osPhotos, data]);
        else if (selectedOS) {
           const updated = { ...selectedOS, photos: [...(selectedOS.photos || []), data] };
           setSelectedOS(updated);
           setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addItemInline = () => {
    if (!selectedOS || !newItemDesc) return;
    const item: ServiceItem = {
      id: Date.now().toString(),
      type: 'PEÇA',
      description: newItemDesc,
      quantity: 1,
      price: parseFloat(newItemPrice) || 0,
      timestamp: new Date().toLocaleTimeString()
    };
    const updated = { ...selectedOS, items: [...selectedOS.items, item] };
    updated.total = updated.items.reduce((acc, i) => acc + i.price, 0);
    setSelectedOS(updated);
    setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
    setNewItemDesc('');
    setNewItemPrice('');
  };

  const removeItem = (id: string) => {
    if (!selectedOS) return;
    const updatedItems = selectedOS.items.filter(i => i.id !== id);
    const updated = { ...selectedOS, items: updatedItems };
    updated.total = updated.items.reduce((acc, i) => acc + i.price, 0);
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

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {view === 'lista' && (
        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tight">Gerenciamento <span className="text-violet-500">Oficina</span></h1>
              <p className="text-slate-500 font-medium">Controle de atendimentos e ordens de serviço.</p>
            </div>
            <button 
              onClick={() => setView('nova')} 
              className="w-full sm:w-auto px-8 py-4 bg-violet-600 text-white font-black rounded-2xl shadow-xl shadow-violet-600/20 hover:bg-violet-500 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} strokeWidth={3} /> Nova O.S.
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={20} />
            <input 
              placeholder="Buscar por placa, cliente ou veículo..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-[#1a1d23] border border-white/5 rounded-3xl outline-none focus:ring-2 focus:ring-violet-500 transition-all shadow-inner text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map(o => (
              <div 
                key={o.id} 
                onClick={() => { setSelectedOS(o); setView('detalhes'); }} 
                className="bg-[#1a1d23] p-6 rounded-[2rem] border border-white/5 hover:border-violet-500/30 cursor-pointer flex items-center justify-between group transition-all hover:bg-[#22272e] shadow-lg shadow-black/20"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-[#0f1115] rounded-2xl flex items-center justify-center text-slate-600 group-hover:text-violet-400 group-hover:scale-110 transition-all"><Car size={24} /></div>
                  <div>
                    <h3 className="text-lg font-black text-white">{o.clientName}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{o.vehicle} • <span className="text-violet-500">{o.plate}</span></p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-lg font-black text-white">R$ {o.total.toFixed(2)}</p>
                  <div className="inline-block px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-black uppercase tracking-widest">
                    {o.status}
                  </div>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="col-span-full py-24 text-center text-slate-600 bg-[#1a1d23] rounded-[3rem] border border-dashed border-white/5">
                <Wrench size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-bold text-lg">Nenhuma ordem de serviço ativa.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'nova' && (
        <div className="bg-[#1a1d23] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#22272e]">
            <div>
              <h2 className="text-2xl font-black text-white uppercase">Novo Atendimento</h2>
              <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Preencha os dados do veículo e cliente</p>
            </div>
            <button onClick={() => setView('lista')} className="p-3 hover:bg-white/5 rounded-full text-slate-400"><X size={24}/></button>
          </div>
          <form onSubmit={handleCreateOS} className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Cliente Final</label>
                <input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full px-6 py-4 bg-[#0f1115] border border-white/5 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none text-white transition-all" placeholder="Nome Completo" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">WhatsApp</label>
                <input required placeholder="55 11 99999-9999" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-6 py-4 bg-[#0f1115] border border-white/5 rounded-2xl outline-none text-white focus:ring-2 focus:ring-violet-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Veículo</label>
                <input required placeholder="Marca / Modelo" value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})} className="w-full px-6 py-4 bg-[#0f1115] border border-white/5 rounded-2xl outline-none text-white focus:ring-2 focus:ring-violet-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Placa</label>
                <input required placeholder="AAA-0000" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} className="w-full px-6 py-4 bg-[#0f1115] border border-white/5 rounded-2xl uppercase font-mono outline-none text-white focus:ring-2 focus:ring-violet-500 transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Descrição da Ocorrência</label>
              <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-4 bg-[#0f1115] border border-white/5 rounded-2xl outline-none text-white focus:ring-2 focus:ring-violet-500 transition-all" placeholder="Relate o que o cliente informou..." />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Galeria de Entrada</label>
              <div className="flex flex-wrap gap-4">
                {osPhotos.map((p, i) => (
                  <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-lg"><img src={p} className="w-full h-full object-cover" /></div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-[#0f1115] border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-slate-600 hover:border-violet-500 hover:text-violet-500 transition-all">
                  <Camera size={28} />
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                </button>
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black rounded-[2rem] shadow-2xl shadow-violet-600/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em]">Finalizar Abertura de O.S.</button>
          </form>
        </div>
      )}

      {view === 'detalhes' && selectedOS && (
        <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
          <div className="bg-[#1a1d23] p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="space-y-4">
                <button onClick={() => setView('lista')} className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em] hover:text-violet-300 transition-colors">← Voltar à Lista</button>
                <div>
                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter">O.S. <span className="text-violet-500">#{selectedOS.id}</span></h2>
                    <p className="text-xl text-slate-400 font-bold mt-2">{selectedOS.clientName} • <span className="text-violet-500 font-mono tracking-wider">{selectedOS.plate}</span></p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                 <button 
                  onClick={() => {
                    const link = generateShareLink();
                    const msg = `Seu orçamento CRMPlus+ está pronto:\n\n${link}`;
                    window.open(`https://wa.me/55${selectedOS.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                  }} 
                  className="px-10 py-5 bg-emerald-600 text-white rounded-3xl text-sm font-black flex items-center gap-3 shadow-xl shadow-emerald-900/20 hover:bg-emerald-500 transition-all uppercase tracking-widest"
                >
                  <Send size={18} fill="white"/> Enviar via WhatsApp
                </button>
                <div className="text-right p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total Geral</p>
                   <h3 className="text-4xl font-black text-white">R$ {selectedOS.total.toFixed(2)}</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {/* Serviços Table */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Serviços & Peças</h3>
                    <div className="h-0.5 flex-1 bg-white/5 ml-4"></div>
                  </div>
                  <div className="bg-[#0f1115] rounded-3xl overflow-hidden border border-white/5 shadow-inner">
                    <table className="w-full text-sm">
                      <thead className="bg-[#22272e] text-[10px] uppercase font-black text-slate-500">
                        <tr>
                          <th className="px-6 py-4 text-left">Descrição</th>
                          <th className="px-6 py-4 text-right">Valor</th>
                          <th className="px-6 py-4 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {selectedOS.items.map((item, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-bold">{item.description}</td>
                            <td className="px-6 py-4 text-right font-black text-white">R$ {item.price.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => removeItem(item.id)} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-violet-600/5">
                          <td className="px-4 py-3">
                            <input 
                              placeholder="Novo item..." 
                              value={newItemDesc}
                              onChange={e => setNewItemDesc(e.target.value)}
                              className="w-full bg-transparent border-none px-3 py-2 text-sm focus:ring-0 text-white placeholder:text-slate-600"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input 
                              placeholder="0.00" 
                              type="number"
                              value={newItemPrice}
                              onChange={e => setNewItemPrice(e.target.value)}
                              className="w-24 bg-transparent border-none px-3 py-2 text-sm focus:ring-0 text-right font-black text-violet-400"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={addItemInline}
                              className="p-3 bg-violet-600 text-white rounded-xl hover:bg-violet-500 shadow-lg shadow-violet-900/20 transition-all"
                            >
                              <Plus size={18} strokeWidth={3} />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
               </div>

               {/* Fotos e Ações */}
               <div className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Registro Fotográfico</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedOS.photos?.map((p, i) => (
                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/5 shadow-xl"><img src={p} className="w-full h-full object-cover" /></div>
                      ))}
                      <button onClick={() => fileInputRef.current?.click()} className="aspect-square bg-[#0f1115] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-700 hover:text-violet-500 hover:border-violet-500 transition-all">
                          <ImagePlus size={32} />
                          <span className="text-[10px] font-black mt-2 uppercase tracking-widest">Adicionar</span>
                          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5">
                    <select 
                      value={selectedOS.status}
                      onChange={(e) => {
                        const updated = { ...selectedOS, status: e.target.value as any };
                        setSelectedOS(updated);
                        setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
                      }}
                      className="py-5 bg-white/5 text-white font-black rounded-3xl uppercase text-[10px] tracking-[0.2em] px-6 outline-none border border-white/5 focus:ring-2 focus:ring-violet-500 transition-all"
                    >
                      <option>Aberto</option>
                      <option>Execução</option>
                      <option>Pronto</option>
                      <option>Entregue</option>
                    </select>
                    
                    <button 
                      onClick={deleteOS}
                      className="py-5 bg-red-600/10 border border-red-500/20 text-red-500 font-black rounded-3xl uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash size={16}/> Deletar Registro
                    </button>
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