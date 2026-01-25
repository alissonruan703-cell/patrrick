
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, Clock, CheckCircle2, 
  X, ChevronRight, Camera, Save, 
  Send, User, Car, FileText, 
  Package, Wrench, Trash2,
  Printer, Hash, Settings, ImageIcon,
  ImagePlus, Share2
} from 'lucide-react';
import { ServiceOrder, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const [view, setView] = useState<'lista' | 'nova' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
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
        if (view === 'nova') setOsPhotos([...osPhotos, reader.result as string]);
        else if (selectedOS) {
           const updated = { ...selectedOS, photos: [...(selectedOS.photos || []), reader.result as string] };
           setSelectedOS(updated);
           setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    if (!selectedOS) return;
    const desc = prompt("O que foi feito?");
    const price = parseFloat(prompt("Qual o valor?") || "0");
    if (!desc) return;

    const newItem: ServiceItem = {
      id: Date.now().toString(),
      type: 'PEÇA',
      description: desc,
      quantity: 1,
      price: price,
      timestamp: new Date().toLocaleTimeString()
    };

    const updated = { ...selectedOS, items: [...selectedOS.items, newItem] };
    updated.total = updated.items.reduce((acc, i) => acc + i.price, 0);
    setSelectedOS(updated);
    setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
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
    // Codifica os dados em base64 para o link (mantendo simples)
    const encoded = btoa(JSON.stringify(data));
    const baseUrl = window.location.href.split('#')[0];
    return `${baseUrl}#/v/${encoded}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {view === 'lista' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900">OFICINA</h1>
            <button onClick={() => setView('nova')} className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <Plus size={20} /> Nova O.S.
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Buscar por nome ou placa..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <div className="grid gap-3">
            {filteredOrders.map(o => (
              <div key={o.id} onClick={() => { setSelectedOS(o); setView('detalhes'); }} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 cursor-pointer flex items-center justify-between group transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50"><Car size={20} /></div>
                  <div>
                    <h3 className="font-bold text-slate-800">{o.clientName}</h3>
                    <p className="text-xs text-slate-500">{o.vehicle} • {o.plate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black">R$ {o.total.toFixed(2)}</p>
                  <p className="text-[10px] uppercase font-bold text-indigo-600">{o.status}</p>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">Nenhum registro encontrado.</div>
            )}
          </div>
        </div>
      )}

      {view === 'nova' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-black text-slate-800 uppercase tracking-tight">Novo Atendimento</h2>
            <button onClick={() => setView('lista')}><X /></button>
          </div>
          <form onSubmit={handleCreateOS} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Cliente</label>
                <input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">WhatsApp</label>
                <input required placeholder="11999999999" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Veículo</label>
                <input required value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Placa</label>
                <input required value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Descrição do Problema</label>
              <textarea required rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase">Fotos</label>
              <div className="flex flex-wrap gap-2">
                {osPhotos.map((p, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200"><img src={p} className="w-full h-full object-cover" /></div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all">
                  <Camera size={24} />
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                </button>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest">Abrir Ordem de Serviço</button>
          </form>
        </div>
      )}

      {view === 'detalhes' && selectedOS && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <div className="flex justify-between items-center no-print">
              <button onClick={() => setView('lista')} className="text-xs font-bold text-slate-400 uppercase tracking-widest">← Voltar</button>
              <div className="flex gap-2">
                <button onClick={addItem} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold">+ Adicionar Item</button>
                <button onClick={() => {
                  const link = generateShareLink();
                  const msg = `Olá! Segue o link do seu orçamento:\n\n${link}`;
                  window.open(`https://wa.me/55${selectedOS.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                  <Send size={14}/> Enviar Link Cliente
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase">#{selectedOS.id}</h2>
                <p className="text-slate-500 font-medium">{selectedOS.clientName}</p>
                <p className="text-xs text-slate-400">{selectedOS.vehicle} ({selectedOS.plate})</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total</p>
                <h3 className="text-3xl font-black text-indigo-600">R$ {selectedOS.total.toFixed(2)}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Itens do Serviço</h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-50">
                    {selectedOS.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 font-bold text-slate-700">{item.description}</td>
                        <td className="px-6 py-4 text-right font-black">R$ {item.price.toFixed(2)}</td>
                      </tr>
                    ))}
                    {selectedOS.items.length === 0 && <tr><td className="px-6 py-10 text-center text-slate-300 italic">Nenhum item adicionado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Fotos do Relatório</h3>
               <div className="flex flex-wrap gap-3">
                 {selectedOS.photos?.map((p, i) => (
                   <img key={i} src={p} className="w-32 h-24 object-cover rounded-xl border border-slate-200" />
                 ))}
                 <button onClick={() => fileInputRef.current?.click()} className="w-32 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                    <ImagePlus size={20} />
                    <span className="text-[10px] font-bold mt-1">+ Foto</span>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                 </button>
               </div>
            </div>

            <div className="pt-6 flex gap-4 no-print">
               <button onClick={() => window.print()} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-xs">Imprimir PDF</button>
               <select 
                 value={selectedOS.status}
                 onChange={(e) => {
                   const updated = { ...selectedOS, status: e.target.value as any };
                   setSelectedOS(updated);
                   setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
                 }}
                 className="flex-1 py-4 bg-indigo-50 text-indigo-700 font-black rounded-2xl uppercase text-xs px-4 outline-none"
               >
                 <option>Aberto</option>
                 <option>Execução</option>
                 <option>Pronto</option>
                 <option>Entregue</option>
               </select>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default Oficina;
