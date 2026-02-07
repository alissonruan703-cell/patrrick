
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, Trash2, ArrowLeft, Zap, User, Car, 
  Package, Wrench, Share2, ChevronRight, UserPlus, Save, Loader2, Activity, Phone
} from 'lucide-react';
import { ServiceOrder, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'ativos' | 'nova'>('ativos');
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [newOS, setNewOS] = useState({ clientName: '', phone: '', vehicle: '', plate: '', description: '' });
  const [newItem, setNewItem] = useState<Partial<ServiceItem>>({ type: 'PEÇA', description: '', quantity: 1, price: 0 });

  const getStorageKey = (userId: string) => `crmplus_oficina_v2_orders_${userId}`;

  useEffect(() => {
    const savedUserStr = sessionStorage.getItem('crmplus_user');
    if (!savedUserStr) return;
    const user = JSON.parse(savedUserStr);
    setCurrentUser(user);
    const savedOrders = JSON.parse(localStorage.getItem(getStorageKey(user.id)) || '[]');
    setOrders(savedOrders);

    const osId = searchParams.get('id');
    if (osId) {
      const found = savedOrders.find((o: ServiceOrder) => o.id === osId);
      if (found) { setSelectedOS(found); setView('detalhes'); }
    }
  }, [searchParams]);

  const saveToDatabase = (updatedOrders: ServiceOrder[]) => {
    if (!currentUser) return;
    localStorage.setItem(getStorageKey(currentUser.id), JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    window.dispatchEvent(new Event('storage'));
  };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOS.clientName || !newOS.vehicle || !newOS.plate || !currentUser) return;
    setIsSaving(true);
    const os: ServiceOrder = {
      id: `OS-${Date.now()}`,
      clientId: '',
      clientName: newOS.clientName,
      phone: newOS.phone,
      vehicle: newOS.vehicle,
      plate: newOS.plate.toUpperCase(),
      description: newOS.description,
      items: [],
      photos: [],
      total: 0,
      status: 'Aberto',
      createdAt: new Date().toISOString()
    };
    const updated = [os, ...orders];
    saveToDatabase(updated);
    setTimeout(() => {
      setNewOS({ clientName: '', phone: '', vehicle: '', plate: '', description: '' });
      setActiveTab('ativos');
      setView('lista');
      setIsSaving(false);
    }, 500);
  };

  const handleAddItem = () => {
    if (!selectedOS || !newItem.description || !newItem.price) return;
    const item: ServiceItem = {
      id: Date.now().toString(),
      type: newItem.type as 'PEÇA' | 'MÃO DE OBRA',
      description: newItem.description,
      brand: '',
      quantity: newItem.quantity || 1,
      price: newItem.price || 0,
      timestamp: new Date().toISOString()
    };
    const updatedItems = [...(selectedOS.items || []), item];
    const updatedOS = { ...selectedOS, items: updatedItems, total: updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) };
    saveToDatabase(orders.map(o => o.id === selectedOS.id ? updatedOS : o));
    setSelectedOS(updatedOS);
    setNewItem({ type: 'PEÇA', description: '', quantity: 1, price: 0 });
  };

  const filteredOrders = useMemo(() => orders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.plate.toLowerCase().includes(searchTerm.toLowerCase())
  ), [orders, searchTerm]);

  const totals = useMemo(() => ({
    pecas: (selectedOS?.items || []).filter(i => i.type === 'PEÇA').reduce((a, b) => a + (b.price * b.quantity), 0),
    servicos: (selectedOS?.items || []).filter(i => i.type === 'MÃO DE OBRA').reduce((a, b) => a + (b.price * b.quantity), 0)
  }), [selectedOS]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 md:mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/20"><Wrench size={24} /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Oficina <span className="text-red-600">Pro</span></h1>
            <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest">{currentUser?.companyName}</p>
          </div>
        </div>
        
        {activeTab === 'ativos' && view === 'lista' && (
          <button 
            onClick={() => { setActiveTab('nova'); setView('lista'); }} 
            className="w-full md:w-auto bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <Plus size={18} strokeWidth={3} /> Nova Entrada
          </button>
        )}
      </div>

      {activeTab === 'nova' ? (
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setActiveTab('ativos')} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 uppercase font-black text-[9px] tracking-widest transition-colors">
            <ArrowLeft size={14}/> Voltar operacional
          </button>

          <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl">
            <h2 className="text-xl md:text-2xl font-black uppercase mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/10 text-red-600 rounded-xl flex items-center justify-center"><UserPlus size={20}/></div>
              Nova O.S.
            </h2>

            <form onSubmit={handleCreateOS} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <input required value={newOS.clientName} onChange={e => setNewOS({...newOS, clientName: e.target.value})} placeholder="Nome do Cliente" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
                <input value={newOS.phone} onChange={e => setNewOS({...newOS, phone: e.target.value})} placeholder="WhatsApp" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <input required value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} placeholder="Veículo" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
                <input required value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value.toUpperCase()})} placeholder="Placa" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-black text-white focus:border-red-600 outline-none uppercase tracking-widest" />
              </div>

              <textarea value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} placeholder="Sintomas relatados..." className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-medium text-zinc-300 focus:border-red-600 outline-none h-32 resize-none" />

              <button type="submit" disabled={isSaving} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Abrir Ordem
              </button>
            </form>
          </div>
        </div>
      ) : view === 'lista' ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative group w-full max-w-lg">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
               <input placeholder="Cliente ou Placa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-red-600 outline-none" />
            </div>
            <div className="hidden md:flex text-[9px] font-black uppercase text-zinc-600 tracking-widest bg-zinc-900/50 px-6 py-3 rounded-full border border-zinc-800 items-center gap-2">
               <Activity size={14} className="text-emerald-500" /> {filteredOrders.length} registros
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredOrders.map(os => (
              <div key={os.id} onClick={() => { setSelectedOS(os); setView('detalhes'); }} className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] group hover:border-red-600 transition-all cursor-pointer shadow-xl relative">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black text-zinc-700 font-mono">#{os.id.slice(-4)}</span>
                  <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${os.status === 'Execução' ? 'text-red-500 border-red-500/20' : 'text-zinc-500 border-zinc-800'}`}>{os.status}</span>
                </div>
                <h3 className="text-lg md:text-xl font-black uppercase truncate mb-2">{os.clientName}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 truncate"><Car size={12}/> {os.vehicle} • <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">{os.plate}</span></p>
                <div className="mt-6 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                   <p className="text-lg font-black text-white">R$ {os.total.toFixed(2)}</p>
                   <ChevronRight size={20} className="text-zinc-700 group-hover:text-red-600 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
           <div className="w-full lg:w-80 xl:w-96 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                 <button onClick={() => setView('lista')} className="text-[9px] font-black uppercase text-zinc-600 hover:text-white flex items-center gap-2 mb-6"><ArrowLeft size={14}/> Voltar</button>
                 <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-1 text-red-600">{selectedOS?.plate}</h2>
                 <p className="text-zinc-500 font-bold uppercase text-[10px] mb-8 tracking-widest">{selectedOS?.vehicle}</p>
                 
                 <div className="space-y-3 pt-6 border-t border-zinc-800">
                    <div className="flex justify-between text-[10px]"><span className="text-zinc-600 font-black uppercase">Peças</span><span className="font-bold">R$ {totals.pecas.toFixed(2)}</span></div>
                    <div className="flex justify-between text-[10px]"><span className="text-zinc-600 font-black uppercase">Mão de Obra</span><span className="font-bold">R$ {totals.servicos.toFixed(2)}</span></div>
                    <div className="flex justify-between pt-4 border-t border-zinc-800"><span className="text-xs font-black uppercase text-white">Geral</span><span className="text-2xl font-black text-red-600">R$ {selectedOS?.total.toFixed(2)}</span></div>
                 </div>

                 <div className="flex flex-col gap-2 mt-8">
                   <button className="w-full bg-zinc-800 text-white py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2"><Share2 size={16} /> Link p/ Cliente</button>
                   <button onClick={() => { saveToDatabase(orders.filter(o => o.id !== selectedOS?.id)); setView('lista'); }} className="w-full text-zinc-600 py-3 font-black uppercase text-[9px] hover:text-red-500 transition-colors">Excluir O.S.</button>
                 </div>
              </div>
           </div>

           <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-12 shadow-2xl flex flex-col gap-8">
              <div className="bg-black/30 border border-zinc-800 p-6 md:p-8 rounded-[2rem] space-y-6">
                 <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><Zap size={18} className="text-red-600"/> Lançamento</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none">
                       <option value="PEÇA">PEÇA</option>
                       <option value="MÃO DE OBRA">SERVIÇO</option>
                    </select>
                    <input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Descrição" className="w-full sm:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none" />
                    <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} placeholder="Valor Unit." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none" />
                 </div>
                 <button onClick={handleAddItem} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2"><Plus size={16}/> Adicionar ao Orçamento</button>
              </div>

              <div className="space-y-8 overflow-y-auto no-scrollbar">
                 {['PEÇA', 'MÃO DE OBRA'].map(cat => (
                   <div key={cat} className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center gap-2">
                        {cat === 'PEÇA' ? <Package size={14}/> : <Wrench size={14}/>} {cat === 'PEÇA' ? 'Peças' : 'Serviços'}
                      </h4>
                      <div className="space-y-3">
                        {(selectedOS?.items || []).filter(i => i.type === cat).map(item => (
                          <div key={item.id} className="bg-black/30 border border-zinc-800 p-4 md:p-6 rounded-2xl flex items-center justify-between group">
                             <div className="flex-1">
                                <p className="text-xs md:text-sm font-black uppercase text-white truncate pr-4">{item.description}</p>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase mt-1">Un: R$ {item.price.toFixed(2)}</p>
                             </div>
                             <div className="flex items-center gap-4">
                                <p className="text-sm md:text-base font-black text-zinc-300">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                <button onClick={() => {
                                    const items = selectedOS!.items.filter(i => i.id !== item.id);
                                    const updated = { ...selectedOS!, items, total: items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) };
                                    saveToDatabase(orders.map(o => o.id === selectedOS!.id ? updated : o));
                                    setSelectedOS(updated);
                                }} className="p-2 text-zinc-800 hover:text-red-500"><Trash2 size={16}/></button>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;
