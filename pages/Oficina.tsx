
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, ArrowLeft, Wrench, Share2, Check, Package, DollarSign, Camera, X } from 'lucide-react';
import { ServiceOrder, ServiceItem, PhotoWithObs } from '../types';

const Oficina: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Estados do Formulário
  const [newOS, setNewOS] = useState({ clientName: '', phone: '', vehicle: '', plate: '', description: '' });
  const [newItem, setNewItem] = useState({ type: 'PEÇA' as any, description: '', quantity: 1, price: 0 });

  useEffect(() => {
    const accountId = sessionStorage.getItem('crmplus_account_id');
    const saved = localStorage.getItem(`crmplus_oficina_orders_${accountId}`);
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  const saveOrders = (updated: ServiceOrder[]) => {
    const accountId = sessionStorage.getItem('crmplus_account_id');
    localStorage.setItem(`crmplus_oficina_orders_${accountId}`, JSON.stringify(updated));
    setOrders(updated);
  };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    const os: ServiceOrder = {
      id: Date.now().toString(),
      ...newOS,
      items: [],
      photos: [],
      total: 0,
      status: 'Aberto',
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    saveOrders([os, ...orders]);
    setNewOS({ clientName: '', phone: '', vehicle: '', plate: '', description: '' });
    setSelectedOS(os);
    setView('detalhes');
  };

  const handleAddItem = () => {
    if (!selectedOS || !newItem.description) return;
    const item: ServiceItem = { ...newItem, id: Date.now().toString() };
    const items = [...selectedOS.items, item];
    const total = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const updated = { ...selectedOS, items, total };
    saveOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
    setSelectedOS(updated);
    setNewItem({ type: 'PEÇA', description: '', quantity: 1, price: 0 });
  };

  const handleStatus = (status: ServiceOrder['status']) => {
    if (!selectedOS) return;
    const updated = { ...selectedOS, status };
    saveOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
    setSelectedOS(updated);
  };

  const generatePublicLink = (os: ServiceOrder) => {
    const companyName = "CRMPLUS"; // Pode ser carregado dinamicamente
    const payload = { 
      i: os.id, n: os.clientName, v: os.vehicle, p: os.plate, 
      d: os.description, t: os.total, c: companyName,
      it: os.items.map(i => ({ d: i.description, q: i.quantity, p: i.price }))
    };
    const token = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const url = `${window.location.origin}/#/v/${token}`;
    navigator.clipboard.writeText(url);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const filtered = orders.filter(o => o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.plate.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto pb-32 animate-in fade-in">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg"><Wrench size={24}/></div>
          <h1 className="text-2xl font-black uppercase italic">Sistema de <span className="text-red-600">Oficina</span></h1>
        </div>
        {view === 'detalhes' ? (
          <button onClick={() => setView('lista')} className="p-4 bg-zinc-900 text-zinc-500 rounded-2xl flex items-center gap-2 uppercase font-black text-[10px]"><ArrowLeft size={16}/> Voltar</button>
        ) : (
          <div className="flex gap-4">
            <div className="relative group w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16}/>
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-2xl text-white outline-none focus:border-red-600" />
            </div>
          </div>
        )}
      </div>

      {view === 'lista' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div onClick={() => { setSelectedOS(null); setView('detalhes'); }} className="border-2 border-dashed border-zinc-800 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-red-600 transition-all group">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-600 group-hover:text-red-600"><Plus size={32}/></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Abrir Nova O.S.</p>
          </div>
          {filtered.map(os => (
            <div key={os.id} onClick={() => { setSelectedOS(os); setView('detalhes'); }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] hover:border-red-600 cursor-pointer shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-[8px]">#{os.id.slice(-4)}</div>
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase border ${os.status === 'Aberto' ? 'text-zinc-500 border-zinc-800' : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'}`}>{os.status}</span>
              </div>
              <h3 className="text-xl font-black uppercase text-white mb-2">{os.clientName}</h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{os.vehicle} • {os.plate}</p>
              <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center"><p className="text-lg font-black text-red-600">R$ {os.total.toFixed(2)}</p><Check size={18} className="text-zinc-800"/></div>
            </div>
          ))}
        </div>
      ) : selectedOS ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3.5rem] space-y-8 shadow-2xl relative overflow-hidden">
              <div className="space-y-1"><p className="text-[9px] font-black text-zinc-500 uppercase">Cliente</p><p className="text-xl font-black text-white uppercase">{selectedOS.clientName}</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-zinc-500 uppercase">Veículo</p><p className="text-xl font-black text-white uppercase">{selectedOS.vehicle} [{selectedOS.plate}]</p></div>
              <div className="pt-6 border-t border-zinc-800 space-y-4">
                 <button onClick={() => generatePublicLink(selectedOS)} className="w-full py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-red-600 transition-all">{copyFeedback ? <Check size={16} /> : <Share2 size={16} />} {copyFeedback ? 'Link Copiado!' : 'Copiar Link Orçamento'}</button>
                 <div className="grid grid-cols-2 gap-2">
                   {['Execução', 'Pronto', 'Entregue', 'Reprovado'].map(st => (
                     <button key={st} onClick={() => handleStatus(st as any)} className={`py-3 rounded-xl text-[8px] font-black uppercase border ${selectedOS.status === st ? 'bg-red-600 border-red-500 text-white' : 'bg-black border-zinc-800 text-zinc-500'}`}>{st}</button>
                   ))}
                 </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 p-10 rounded-[3.5rem] shadow-2xl space-y-10">
            <div className="flex justify-between items-center"><h3 className="text-xl font-black uppercase">Orçamento Detalhado</h3><div className="text-right"><p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Total</p><p className="text-4xl font-black text-white tracking-tighter">R$ {selectedOS.total.toFixed(2)}</p></div></div>
            <div className="bg-black/40 p-8 rounded-[2.5rem] border border-zinc-800 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2"><label className="text-[9px] font-black text-zinc-500 uppercase">Tipo</label><select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white text-xs"><option value="PEÇA">PEÇA</option><option value="MÃO DE OBRA">SERVIÇO</option></select></div>
                <div className="md:col-span-1 space-y-2"><label className="text-[9px] font-black text-zinc-500 uppercase">Descrição</label><input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white text-xs" /></div>
                <div className="space-y-2"><label className="text-[9px] font-black text-zinc-500 uppercase">Preço</label><input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white text-xs" /></div>
              </div>
              <button onClick={handleAddItem} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl">Lançar Item</button>
            </div>
            <div className="overflow-hidden border border-zinc-800 rounded-3xl">
              <table className="w-full text-left">
                <thead className="bg-black/40 text-[9px] font-black text-zinc-500 uppercase tracking-widest"><tr><th className="px-8 py-5">Item</th><th className="px-8 py-5 text-center">Qtd</th><th className="px-8 py-5 text-right">Subtotal</th></tr></thead>
                <tbody className="divide-y divide-zinc-800">
                  {selectedOS.items.map(item => (
                    <tr key={item.id} className="text-sm font-black text-white hover:bg-white/5"><td className="px-8 py-5">{item.description}</td><td className="px-8 py-5 text-center">x{item.quantity}</td><td className="px-8 py-5 text-right">R$ {(item.price * item.quantity).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-12 rounded-[4rem] animate-in slide-in-from-bottom-4 shadow-2xl">
          <form onSubmit={handleCreateOS} className="space-y-6">
            <input required value={newOS.clientName} onChange={e => setNewOS({...newOS, clientName: e.target.value})} placeholder="Nome do Cliente" className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white font-bold" />
            <input required value={newOS.phone} onChange={e => setNewOS({...newOS, phone: e.target.value})} placeholder="WhatsApp" className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white font-bold" />
            <div className="grid grid-cols-2 gap-4">
              <input required value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} placeholder="Veículo" className="bg-black border border-zinc-800 p-4 rounded-2xl text-white font-bold" />
              <input required value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value.toUpperCase()})} placeholder="Placa" className="bg-black border border-zinc-800 p-4 rounded-2xl text-white font-black uppercase" />
            </div>
            <textarea value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} placeholder="Reclamação do Cliente..." className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white h-24 resize-none" />
            <button type="submit" className="w-full py-6 bg-red-600 text-white font-black rounded-3xl uppercase text-xs tracking-widest shadow-xl">Abrir O.S.</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Oficina;
