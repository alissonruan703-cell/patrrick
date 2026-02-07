
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Trash2, ArrowLeft, Wrench, Share2, 
  Check, X, CheckCircle2, DollarSign, Package
} from 'lucide-react';
import { ServiceOrder, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Estados do Formulário
  const [newOS, setNewOS] = useState({ clientName: '', phone: '', vehicle: '', plate: '', description: '' });
  const [newItem, setNewItem] = useState({ type: 'PEÇA' as 'PEÇA' | 'MÃO DE OBRA', description: '', quantity: 1, price: 0 });

  useEffect(() => {
    const accountId = sessionStorage.getItem('crmplus_account_id') || localStorage.getItem('crmplus_last_account_id');
    const saved = localStorage.getItem(`crmplus_oficina_orders_${accountId}`);
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  const saveOrders = (updated: ServiceOrder[]) => {
    const accountId = sessionStorage.getItem('crmplus_account_id') || localStorage.getItem('crmplus_last_account_id');
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
    const item: ServiceItem = { id: Date.now().toString(), ...newItem };
    const items = [...selectedOS.items, item];
    const total = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const updated = { ...selectedOS, items, total };
    saveOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
    setSelectedOS(updated);
    setNewItem({ type: 'PEÇA', description: '', quantity: 1, price: 0 });
  };

  const removeItem = (id: string) => {
    if (!selectedOS) return;
    const items = selectedOS.items.filter(i => i.id !== id);
    const total = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const updated = { ...selectedOS, items, total };
    saveOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
    setSelectedOS(updated);
  };

  const handleStatus = (status: ServiceOrder['status']) => {
    if (!selectedOS) return;
    const updated = { ...selectedOS, status };
    saveOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
    setSelectedOS(updated);
  };

  const generatePublicLink = (os: ServiceOrder) => {
    const payload = { 
      i: os.id, n: os.clientName, v: os.vehicle, p: os.plate, 
      d: os.description, t: os.total, c: "Oficina Pro",
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
    <div className="p-12 max-w-7xl mx-auto pb-32 animate-in fade-in">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg"><Wrench size={24}/></div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Oficina <span className="text-red-600">Pro+</span></h1>
        </div>
        {view === 'lista' ? (
          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16}/>
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar placa..." className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-2xl text-white outline-none focus:border-red-600 font-bold" />
          </div>
        ) : (
          <button onClick={() => setView('lista')} className="p-4 bg-zinc-900 text-zinc-500 rounded-2xl flex items-center gap-2 uppercase font-black text-[10px]"><ArrowLeft size={16}/> Voltar</button>
        )}
      </div>

      {view === 'lista' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div onClick={() => setView('detalhes')} className="border-2 border-dashed border-zinc-800 rounded-[3rem] p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-red-600 transition-all bg-zinc-900/20 group">
            <Plus size={40} className="text-zinc-600 group-hover:text-red-600"/>
            <p className="text-[10px] font-black uppercase text-zinc-600 group-hover:text-white">Abrir Nova O.S.</p>
          </div>
          {filtered.map(os => (
            <div key={os.id} onClick={() => { setSelectedOS(os); setView('detalhes'); }} className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] hover:border-red-600 cursor-pointer shadow-xl transition-all relative">
              <span className={`absolute top-6 right-8 px-3 py-1 rounded-full text-[8px] font-black uppercase border ${os.status === 'Aberto' ? 'text-zinc-500 border-zinc-800' : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'}`}>{os.status}</span>
              <h3 className="text-2xl font-black uppercase text-white mb-2">{os.clientName}</h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{os.vehicle} • <span className="text-red-600">{os.plate}</span></p>
              <div className="mt-10 pt-8 border-t border-zinc-800 flex justify-between items-center"><p className="text-2xl font-black text-white">R$ {os.total.toFixed(2)}</p><CheckCircle2 size={18} className="text-zinc-800"/></div>
            </div>
          ))}
        </div>
      ) : selectedOS ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3.5rem] space-y-8 shadow-2xl">
              <div className="space-y-4">
                <div><p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Cliente</p><p className="text-2xl font-black text-white uppercase">{selectedOS.clientName}</p></div>
                <div><p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Veículo</p><p className="text-2xl font-black text-white uppercase">{selectedOS.vehicle} <span className="text-red-600">[{selectedOS.plate}]</span></p></div>
              </div>
              <div className="pt-8 border-t border-zinc-800 space-y-4">
                 <button onClick={() => generatePublicLink(selectedOS)} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all">{copyFeedback ? <Check size={18}/> : <Share2 size={18}/>} {copyFeedback ? 'Link Copiado!' : 'Link do Orçamento'}</button>
                 <div className="grid grid-cols-2 gap-2">
                   {['Execução', 'Pronto', 'Entregue', 'Reprovado'].map(st => (
                     <button key={st} onClick={() => handleStatus(st as any)} className={`py-3 rounded-xl text-[9px] font-black uppercase border ${selectedOS.status === st ? 'bg-white text-black border-white' : 'bg-black border-zinc-800 text-zinc-500 hover:text-white transition-all'}`}>{st}</button>
                   ))}
                 </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 p-10 lg:p-14 rounded-[3.5rem] shadow-2xl space-y-12">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Itens do Orçamento</h3>
              <div className="text-right bg-black px-8 py-5 rounded-3xl border border-zinc-800"><p className="text-5xl font-black text-white">R$ {selectedOS.total.toFixed(2)}</p></div>
            </div>
            <div className="bg-black/40 p-10 rounded-[3rem] border border-zinc-800 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2"><label className="text-[9px] font-black text-zinc-500 uppercase">Tipo</label><select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white text-xs font-bold"><option value="PEÇA">PEÇA</option><option value="MÃO DE OBRA">SERVIÇO</option></select></div>
                <div className="md:col-span-2 space-y-2"><label className="text-[9px] font-black text-zinc-500 uppercase">Descrição</label><input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white text-xs font-bold" /></div>
                <div className="space-y-2"><label className="text-[9px] font-black text-zinc-500 uppercase">Valor</label><input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white text-xs font-bold" /></div>
              </div>
              <button onClick={handleAddItem} className="w-full py-5 bg-zinc-800 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all">Lançar Item</button>
            </div>
            <div className="overflow-hidden border border-zinc-800 rounded-3xl">
              <table className="w-full text-left">
                <thead className="bg-black/40 text-[9px] font-black text-zinc-500 uppercase"><tr><th className="px-8 py-5">Item</th><th className="px-8 py-5 text-center">Qtd</th><th className="px-8 py-5 text-right">Subtotal</th><th className="px-8 py-5"></th></tr></thead>
                <tbody className="divide-y divide-zinc-800">
                  {selectedOS.items.map(item => (
                    <tr key={item.id} className="text-sm font-bold text-white hover:bg-white/5 transition-colors"><td className="px-8 py-5">{item.description}</td><td className="px-8 py-5 text-center">x{item.quantity}</td><td className="px-8 py-5 text-right">R$ {(item.price * item.quantity).toFixed(2)}</td><td className="px-8 py-5 text-right"><button onClick={() => removeItem(item.id)} className="text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={16}/></button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-14 rounded-[4rem] animate-in slide-in-from-bottom-4 shadow-2xl">
          <h2 className="text-3xl font-black uppercase text-center mb-10 tracking-tighter">Dados do <span className="text-red-600">Veículo</span></h2>
          <form onSubmit={handleCreateOS} className="space-y-6">
            <input required value={newOS.clientName} onChange={e => setNewOS({...newOS, clientName: e.target.value})} placeholder="Cliente" className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-white font-bold" />
            <div className="grid grid-cols-2 gap-4">
              <input required value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} placeholder="Veículo" className="bg-black border border-zinc-800 p-5 rounded-2xl text-white font-bold" />
              <input required value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value.toUpperCase()})} placeholder="Placa" className="bg-black border border-zinc-800 p-5 rounded-2xl text-white font-black uppercase tracking-widest" />
            </div>
            <textarea value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} placeholder="Relato do cliente..." className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-white h-32 resize-none" />
            <button type="submit" className="w-full py-6 bg-red-600 text-white font-black rounded-3xl uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] transition-all">Abrir Registro</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Oficina;
