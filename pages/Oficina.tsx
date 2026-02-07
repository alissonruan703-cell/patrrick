
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, Trash2, ArrowLeft, Zap, Car, 
  Package, Wrench, Share2, ChevronRight, UserPlus, Save, Loader2, Activity,
  Camera, X, CheckCircle2, AlertCircle, History
} from 'lucide-react';
import { ServiceOrder, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'ativos' | 'historico' | 'nova'>('ativos');
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [historyFilter, setHistoryFilter] = useState<'Todos' | 'Entregue' | 'Reprovado'>('Todos');
  const [operationalFilter, setOperationalFilter] = useState<'Todos' | 'Aberto' | 'Orçamento' | 'Execução' | 'Pronto'>('Todos');
  
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [newOS, setNewOS] = useState({ clientName: '', phone: '', vehicle: '', plate: '', description: '', photos: [] as string[] });
  const [newItem, setNewItem] = useState<any>({ type: 'PEÇA', description: '', quantity: 1, price: '' });

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // Fix: Explicitly cast 'file' to 'File' to resolve type error when passed to readAsDataURL. 
    // Array.from(FileList) can return unknown[] in some environments.
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewOS(prev => ({ ...prev, photos: [...prev.photos, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
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
      photos: newOS.photos,
      total: 0,
      status: 'Aberto',
      createdAt: new Date().toISOString()
    };
    const updated = [os, ...orders];
    saveToDatabase(updated);
    setTimeout(() => {
      setNewOS({ clientName: '', phone: '', vehicle: '', plate: '', description: '', photos: [] });
      setActiveTab('ativos');
      setView('lista');
      setIsSaving(false);
    }, 500);
  };

  const handleAddItem = () => {
    const priceNum = parseFloat(newItem.price);
    if (!selectedOS || !newItem.description || isNaN(priceNum)) return;
    const item: ServiceItem = {
      id: Date.now().toString(),
      type: newItem.type as any,
      description: newItem.description,
      brand: '',
      quantity: parseInt(newItem.quantity) || 1,
      price: priceNum,
      timestamp: new Date().toISOString()
    };
    const items = [...(selectedOS.items || []), item];
    const updated = { ...selectedOS, items, total: items.reduce((a, b) => a + (b.price * b.quantity), 0) };
    saveToDatabase(orders.map(o => o.id === selectedOS.id ? updated : o));
    setSelectedOS(updated);
    setNewItem({ type: 'PEÇA', description: '', quantity: 1, price: '' });
  };

  const generateLink = () => {
    if (!selectedOS || !currentUser) return;
    const payload = {
      i: selectedOS.id, tid: currentUser.id, n: selectedOS.clientName, v: selectedOS.vehicle, 
      p: selectedOS.plate, d: selectedOS.description, t: selectedOS.total, 
      dt: new Date(selectedOS.createdAt).toLocaleDateString('pt-BR'),
      cn: currentUser.companyName, ph: selectedOS.photos || [],
      it: (selectedOS.items || []).map(i => ({ d: i.description, q: i.quantity, p: i.price, t: i.type === 'PEÇA' ? 'P' : 'S' }))
    };
    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    navigator.clipboard.writeText(`${window.location.origin}/#/v/${base64}`);
    alert('Link do orçamento copiado!');
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.plate.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === 'ativos') {
        if (o.status === 'Entregue' || o.status === 'Reprovado') return false;
        if (operationalFilter !== 'Todos' && o.status !== operationalFilter) return false;
      } else if (activeTab === 'historico') {
        if (o.status !== 'Entregue' && o.status !== 'Reprovado') return false;
        if (historyFilter !== 'Todos' && o.status !== historyFilter) return false;
      }
      return true;
    });
  }, [orders, searchTerm, activeTab, operationalFilter, historyFilter]);

  const totals = useMemo(() => ({
    pecas: (selectedOS?.items || []).filter(i => i.type === 'PEÇA').reduce((a, b) => a + (b.price * b.quantity), 0),
    servicos: (selectedOS?.items || []).filter(i => i.type === 'MÃO DE OBRA').reduce((a, b) => a + (b.price * b.quantity), 0)
  }), [selectedOS]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg"><Wrench size={24} /></div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Oficina <span className="text-red-600">Pro</span></h1>
            <div className="flex gap-4 mt-2">
              <button onClick={() => { setActiveTab('ativos'); setView('lista'); setSelectedOS(null); }} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ativos' ? 'text-red-600' : 'text-zinc-500'}`}>Operacional</button>
              <button onClick={() => { setActiveTab('historico'); setView('lista'); setSelectedOS(null); }} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'historico' ? 'text-red-600' : 'text-zinc-500'}`}>Histórico</button>
            </div>
          </div>
        </div>
        
        {view === 'lista' && (
          <button onClick={() => { setActiveTab('nova'); setView('lista'); }} className="w-full md:w-auto bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-3">
            <Plus size={18} /> Nova O.S.
          </button>
        )}
      </div>

      {activeTab === 'nova' ? (
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setActiveTab('ativos')} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 uppercase font-black text-[9px] tracking-widest"><ArrowLeft size={14}/> Voltar</button>
          <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-10 rounded-[3rem] shadow-2xl">
            <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-white"><UserPlus size={20} className="text-red-600"/> Nova Entrada</h2>
            <form onSubmit={handleCreateOS} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={newOS.clientName} onChange={e => setNewOS({...newOS, clientName: e.target.value})} placeholder="Cliente" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
                <input value={newOS.phone} onChange={e => setNewOS({...newOS, phone: e.target.value})} placeholder="WhatsApp" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} placeholder="Veículo" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
                <input required value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value.toUpperCase()})} placeholder="Placa" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-black text-white focus:border-red-600 outline-none uppercase" />
              </div>
              <textarea value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} placeholder="Sintomas..." className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:border-red-600 outline-none h-24 resize-none" />
              
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-zinc-600 ml-1">Anexar Fotos do Motor / Veículo</p>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-16 h-16 bg-black border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-700 hover:text-red-600 hover:border-red-600 transition-all"><Camera size={20}/></button>
                  {newOS.photos.map((ph, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-800">
                      <img src={ph} className="w-full h-full object-cover" />
                      <button onClick={() => setNewOS(prev => ({...prev, photos: prev.photos.filter((_, idx) => idx !== i)}))} className="absolute top-0 right-0 bg-red-600 p-0.5"><X size={10}/></button>
                    </div>
                  ))}
                  <input type="file" multiple ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Abrir Ordem
              </button>
            </form>
          </div>
        </div>
      ) : view === 'lista' ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="relative group w-full max-w-lg">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
               <input placeholder="Busca por cliente ou placa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-red-600 outline-none" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {activeTab === 'ativos' ? (
                ['Todos', 'Aberto', 'Orçamento', 'Execução', 'Pronto'].map(f => (
                  <button key={f} onClick={() => setOperationalFilter(f as any)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${operationalFilter === f ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-zinc-800 text-zinc-500'}`}>{f}</button>
                ))
              ) : (
                ['Todos', 'Entregue', 'Reprovado'].map(f => (
                  <button key={f} onClick={() => setHistoryFilter(f as any)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${historyFilter === f ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-zinc-800 text-zinc-500'}`}>{f}</button>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(os => (
              <div key={os.id} onClick={() => { setSelectedOS(os); setView('detalhes'); }} className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] group hover:border-red-600 transition-all cursor-pointer shadow-xl relative">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black text-zinc-700 font-mono">#{os.id.slice(-4)}</span>
                  <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${os.status === 'Execução' ? 'text-emerald-500 border-emerald-500/20' : os.status === 'Reprovado' ? 'text-red-500 border-red-500/20' : 'text-zinc-500 border-zinc-800'}`}>{os.status}</span>
                </div>
                <h3 className="text-xl font-black uppercase truncate mb-2">{os.clientName}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2"><Car size={12}/> {os.vehicle} • <span className="text-white bg-white/5 px-2 py-0.5 rounded">{os.plate}</span></p>
                <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-between items-center">
                   <p className="text-lg font-black text-white">R$ {os.total.toFixed(2)}</p>
                   <ChevronRight size={20} className="text-zinc-700 group-hover:text-red-600" />
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-20 border-2 border-dashed border-zinc-800 rounded-[2rem]">
                 <Activity size={48} className="mx-auto mb-4" />
                 <p className="font-black uppercase tracking-[0.3em]">Nenhum registro para este filtro</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
           <div className="w-full lg:w-80 space-y-6">
              <div className={`border p-8 rounded-[3rem] shadow-2xl relative overflow-hidden ${selectedOS?.status === 'Reprovado' ? 'bg-red-600/5 border-red-600/20' : 'bg-zinc-900 border-zinc-800'}`}>
                 <button onClick={() => setView('lista')} className="text-[9px] font-black uppercase text-zinc-600 hover:text-white flex items-center gap-2 mb-6"><ArrowLeft size={14}/> Voltar</button>
                 <h2 className="text-3xl font-black uppercase tracking-tighter mb-1 text-red-600">{selectedOS?.plate}</h2>
                 <p className="text-zinc-500 font-bold uppercase text-[10px] mb-8 tracking-widest">{selectedOS?.vehicle}</p>
                 <div className="space-y-3 pt-6 border-t border-zinc-800">
                    <div className="flex justify-between text-[10px]"><span className="text-zinc-600 font-black uppercase">Peças</span><span className="font-bold">R$ {totals.pecas.toFixed(2)}</span></div>
                    <div className="flex justify-between text-[10px]"><span className="text-zinc-600 font-black uppercase">Serviços</span><span className="font-bold">R$ {totals.servicos.toFixed(2)}</span></div>
                    <div className="flex justify-between pt-4 border-t border-zinc-800"><span className="text-xs font-black uppercase text-white">Geral</span><span className="text-2xl font-black text-red-600">R$ {selectedOS?.total.toFixed(2)}</span></div>
                 </div>
                 <div className="flex flex-col gap-2 mt-8">
                   <button onClick={generateLink} className="w-full bg-zinc-800 text-white py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all shadow-lg"><Share2 size={16} /> Link WhatsApp</button>
                   {selectedOS?.status !== 'Reprovado' && selectedOS?.status !== 'Entregue' && (
                     <div className="grid grid-cols-2 gap-2 mt-4">
                       <button onClick={() => { saveToDatabase(orders.map(o => o.id === selectedOS!.id ? {...o, status: 'Entregue'} : o)); setView('lista'); }} className="p-3 bg-emerald-600/10 text-emerald-500 rounded-xl font-black uppercase text-[8px] hover:bg-emerald-600 hover:text-white transition-all">Entregar</button>
                       <button onClick={() => { saveToDatabase(orders.map(o => o.id === selectedOS!.id ? {...o, status: 'Reprovado'} : o)); setView('lista'); }} className="p-3 bg-red-600/10 text-red-500 rounded-xl font-black uppercase text-[8px] hover:bg-red-600 hover:text-white transition-all">Reprovar</button>
                     </div>
                   )}
                   <button onClick={() => { if(window.confirm('Excluir permanentemente?')){saveToDatabase(orders.filter(o => o.id !== selectedOS?.id)); setView('lista');} }} className="w-full text-zinc-700 py-3 font-black uppercase text-[9px] hover:text-red-500 mt-2">Apagar Registro</button>
                 </div>
              </div>
           </div>

           <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-[3rem] p-6 md:p-10 shadow-2xl flex flex-col gap-8">
              <div className="bg-black/30 border border-zinc-800 p-6 rounded-[2rem] space-y-6">
                 <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-white"><Zap size={18} className="text-red-600"/> Lançamento Direto</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none">
                       <option value="PEÇA">PEÇA</option>
                       <option value="MÃO DE OBRA">SERVIÇO</option>
                    </select>
                    <input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Descrição" className="w-full sm:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none" />
                    <input type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} placeholder="Qtd" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none" />
                    <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="Valor Unit." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none" />
                 </div>
                 <button onClick={handleAddItem} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2"><Plus size={16}/> Adicionar Item</button>
              </div>

              <div className="space-y-8 overflow-y-auto no-scrollbar">
                 {['PEÇA', 'MÃO DE OBRA'].map(cat => (
                   <div key={cat} className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center gap-2">
                        {cat === 'PEÇA' ? <Package size={14}/> : <Wrench size={14}/>} {cat === 'PEÇA' ? 'Peças' : 'Serviços'}
                      </h4>
                      <div className="space-y-3">
                        {(selectedOS?.items || []).filter(i => i.type === cat).map(item => (
                          <div key={item.id} className="bg-black/30 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between group">
                             <div className="flex-1 truncate pr-4">
                                <p className="text-xs font-black uppercase text-white truncate">{item.description}</p>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase mt-1">Qtd: {item.quantity} • Unit: R$ {item.price.toFixed(2)}</p>
                             </div>
                             <div className="flex items-center gap-4">
                                <p className="text-sm font-black text-zinc-300">R$ {(item.price * item.quantity).toFixed(2)}</p>
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
