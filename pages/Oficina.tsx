
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, X, Trash2, Calendar, ArrowLeft, Zap, User, Car, 
  Package, Wrench, Share2, Check, AlertCircle, Clock, ChevronRight, 
  CheckCircle2, AlertTriangle, UserPlus, FileText, Save, Loader2, Users,
  History, DollarSign, Activity
} from 'lucide-react';
import { ServiceOrder, UserProfile, Client, Notification, HistoryEvent, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'ativos' | 'nova'>('ativos');
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [newItem, setNewItem] = useState<Partial<ServiceItem>>({
    type: 'PEÇA', description: '', quantity: 1, price: 0
  });

  const [newOS, setNewOS] = useState<Partial<ServiceOrder>>({ 
    clientId: '', clientName: '', vehicle: '', plate: '', description: '', status: 'Aberto', items: []
  });

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('crmplus_oficina_orders') || '[]');
    const savedClients = JSON.parse(localStorage.getItem('crmplus_clients') || '[]');
    const savedProfile = JSON.parse(sessionStorage.getItem('crmplus_profile') || 'null');
    setOrders(savedOrders);
    setClients(savedClients);
    setActiveProfile(savedProfile);
    
    const osId = searchParams.get('id');
    if (osId) {
      const found = savedOrders.find((o: any) => o.id === osId);
      if (found) { setSelectedOS(found); setView('detalhes'); }
    }
  }, [searchParams]);

  const handleAddItem = () => {
    if (!selectedOS || !newItem.description) return;
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
    const total = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    
    const updatedOS = { ...selectedOS, items: updatedItems, total };
    const updatedOrders = orders.map(o => o.id === selectedOS.id ? updatedOS : o);
    
    setOrders(updatedOrders);
    setSelectedOS(updatedOS);
    localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updatedOrders));
    setNewItem({ type: 'PEÇA', description: '', quantity: 1, price: 0 });
  };

  const removeItem = (id: string) => {
    if (!selectedOS) return;
    const updatedItems = selectedOS.items.filter(i => i.id !== id);
    const total = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const updatedOS = { ...selectedOS, items: updatedItems, total };
    const updatedOrders = orders.map(o => o.id === selectedOS.id ? updatedOS : o);
    setOrders(updatedOrders);
    setSelectedOS(updatedOS);
    localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updatedOrders));
  };

  const totals = useMemo(() => {
    if (!selectedOS) return { pecas: 0, servicos: 0 };
    return {
      pecas: selectedOS.items.filter(i => i.type === 'PEÇA').reduce((a, b) => a + (b.price * b.quantity), 0),
      servicos: selectedOS.items.filter(i => i.type === 'MÃO DE OBRA').reduce((a, b) => a + (b.price * b.quantity), 0)
    };
  }, [selectedOS]);

  const filtered = orders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto pb-32 animate-in fade-in">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-600 text-white rounded-2xl shadow-lg"><Wrench size={32} /></div>
          <div><h1 className="text-3xl font-black uppercase tracking-tighter">Oficina</h1><p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Controle de Serviços</p></div>
        </div>
        {view === 'lista' && (
          <button onClick={() => setActiveTab('nova')} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl">Nova Entrada +</button>
        )}
      </div>

      {view === 'lista' ? (
        <div className="space-y-8">
          <div className="relative group max-w-xl">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
             <input placeholder="Busca rápida..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold focus:border-red-600 outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(os => (
              <div key={os.id} onClick={() => { setSelectedOS(os); setView('detalhes'); }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] group hover:border-red-600 transition-all cursor-pointer shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black font-mono text-zinc-600">#{os.id.slice(-4)}</span>
                  <span className="bg-black/50 px-3 py-1 rounded-lg text-[8px] font-black uppercase border border-zinc-800">{os.status}</span>
                </div>
                <h3 className="text-xl font-black uppercase truncate mb-2">{os.clientName}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{os.vehicle} • <span className="text-white font-mono">{os.plate}</span></p>
                <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
                   <p className="text-lg font-black">R$ {os.total.toFixed(2)}</p>
                   <ChevronRight size={18} className="text-zinc-700 group-hover:text-red-600 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                 <button onClick={() => setView('lista')} className="text-[10px] font-black uppercase text-zinc-600 hover:text-white flex items-center gap-2 mb-8 transition-all"><ArrowLeft size={14}/> Voltar</button>
                 <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">{selectedOS?.plate}</h2>
                 <p className="text-zinc-500 font-bold uppercase text-xs mb-8">{selectedOS?.vehicle}</p>
                 <div className="space-y-4 pt-8 border-t border-zinc-800">
                    <div className="flex justify-between items-center"><span className="text-[9px] font-black text-zinc-500 uppercase">Total Peças</span><span className="font-bold">R$ {totals.pecas.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[9px] font-black text-zinc-500 uppercase">Total Serviços</span><span className="font-bold">R$ {totals.servicos.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-800"><span className="text-[10px] font-black text-white uppercase">Geral</span><span className="text-2xl font-black text-red-600">R$ {selectedOS?.total.toFixed(2)}</span></div>
                 </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-4 shadow-xl">
                 <p className="text-[10px] font-black uppercase text-zinc-600 ml-1">Situação</p>
                 <div className="grid grid-cols-2 gap-2">
                    {['Aberto', 'Orçamento', 'Execução', 'Pronto'].map(st => (
                      <button key={st} className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${selectedOS?.status === st ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-zinc-800 text-zinc-600'}`}>{st}</button>
                    ))}
                 </div>
              </div>
           </div>

           <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-[3.5rem] p-12 shadow-2xl flex flex-col gap-10">
              <div className="bg-black/40 border border-zinc-800 p-8 rounded-[2.5rem] space-y-8">
                 <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3"><Zap size={20} className="text-red-600"/> Lançamento de Itens</h3>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-1">
                       <label className="block text-[9px] font-black text-zinc-600 uppercase mb-2 ml-1">Categoria</label>
                       <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-red-600">
                          <option value="PEÇA">PEÇA</option>
                          <option value="MÃO DE OBRA">SERVIÇO</option>
                       </select>
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[9px] font-black text-zinc-600 uppercase mb-2 ml-1">Descrição</label>
                       <input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-red-600" />
                    </div>
                    <div>
                       <label className="block text-[9px] font-black text-zinc-600 uppercase mb-2 ml-1">Valor Unit.</label>
                       <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-red-600" />
                    </div>
                 </div>
                 <button onClick={handleAddItem} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"><Plus size={16} strokeWidth={3}/> Adicionar ao Protocolo</button>
              </div>

              <div className="flex-1 space-y-10">
                 {['PEÇA', 'MÃO DE OBRA'].map(cat => {
                   const catItems = selectedOS?.items.filter(i => i.type === cat) || [];
                   return (
                     <div key={cat} className="space-y-4">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-red-600">{cat === 'PEÇA' ? <Package size={14}/> : <Wrench size={14}/>}</div>
                          {cat === 'PEÇA' ? 'Peças Substituídas' : 'Serviços Prestados'}
                        </h4>
                        <div className="space-y-2">
                          {catItems.length > 0 ? catItems.map(item => (
                            <div key={item.id} className="bg-black/30 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between group">
                               <div className="flex-1">
                                  <p className="text-sm font-black uppercase text-white tracking-tight">{item.description}</p>
                                  <p className="text-[9px] font-bold text-zinc-600 uppercase mt-1">Qtde: {item.quantity} • Unit: R$ {item.price.toFixed(2)}</p>
                               </div>
                               <div className="flex items-center gap-6">
                                  <p className="text-sm font-black text-zinc-300">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                  <button onClick={() => removeItem(item.id)} className="p-2 text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                               </div>
                            </div>
                          )) : <p className="text-[10px] font-black uppercase text-zinc-800 italic ml-4">Nenhum registro lançado</p>}
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;
