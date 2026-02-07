
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, Trash2, ArrowLeft, Zap, Car, 
  Wrench, ChevronRight, UserPlus, Loader2,
  Camera, X, Settings2, MessageSquare, MoreVertical, Send
} from 'lucide-react';
import { ServiceOrder, ServiceItem, PhotoWithObs } from '../types';

const STATUS_LIST: ServiceOrder['status'][] = [
  'Aberto', 'Orçamento', 'Aguardando Peças', 'Execução', 
  'Pendente Cliente', 'Pronto', 'Entregue', 'Reprovado', 'Garantia', 'Finalizado'
];

const Oficina: React.FC = () => {
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const executionFileRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'ativos' | 'historico' | 'nova'>('ativos');
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [operationalFilter, setOperationalFilter] = useState<'Todos' | string>('Todos');
  const [showQuickMenu, setShowQuickMenu] = useState<string | null>(null);
  
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [newOS, setNewOS] = useState({ clientName: '', phone: '', vehicle: '', plate: '', description: '', photos: [] as string[] });
  const [newItem, setNewItem] = useState<any>({ type: 'PEÇA', description: '', quantity: 1, price: '' });
  const [execPhotoObs, setExecPhotoObs] = useState('');

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
    
    const initialPhotos: PhotoWithObs[] = newOS.photos.map(url => ({
      url,
      obs: 'Entrada',
      timestamp: new Date().toISOString()
    }));

    const os: ServiceOrder = {
      id: `OS-${Date.now()}`,
      clientId: '',
      clientName: newOS.clientName,
      phone: newOS.phone,
      vehicle: newOS.vehicle,
      plate: newOS.plate.toUpperCase(),
      description: newOS.description,
      items: [],
      photos: initialPhotos,
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

  const sendWhatsApp = () => {
    if (!selectedOS || !currentUser) return;
    const publicBudget = {
      id: selectedOS.id,
      tenantId: currentUser.id,
      company: currentUser.company || 'Sua Oficina',
      client: selectedOS.clientName,
      vehicle: selectedOS.vehicle,
      plate: selectedOS.plate,
      items: selectedOS.items,
      photos: selectedOS.photos,
      notes: selectedOS.budgetNotes,
      total: selectedOS.total,
      description: selectedOS.description
    };
    localStorage.setItem(`pb_${selectedOS.id}`, JSON.stringify(publicBudget));
    const shortToken = btoa(JSON.stringify({ i: selectedOS.id, t: currentUser.id }));
    const url = `${window.location.origin}/#/v/${shortToken}`;
    const message = `Olá ${selectedOS.clientName}, aqui é da ${currentUser.company || 'Oficina'}. Segue o link para aprovação do orçamento: ${url}`;
    const phone = selectedOS.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.plate.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (activeTab === 'ativos') {
        if (['Entregue', 'Reprovado', 'Finalizado'].includes(o.status)) return false;
        if (operationalFilter !== 'Todos' && o.status !== operationalFilter) return false;
      } else if (activeTab === 'historico') {
        if (!['Entregue', 'Reprovado', 'Finalizado'].includes(o.status)) return false;
      }
      return true;
    });
  }, [orders, searchTerm, activeTab, operationalFilter]);

  const getStatusColor = (status: string) => {
    if (status === 'Execução') return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
    if (status === 'Aberto') return 'text-zinc-400 border-zinc-800 bg-black';
    if (status === 'Orçamento') return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
    if (status === 'Reprovado') return 'text-red-500 border-red-500/20 bg-red-500/5';
    return 'text-zinc-500 border-zinc-800 bg-zinc-900/50';
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg"><Wrench size={24} /></div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Sistema de <span className="text-red-600">oficina</span></h1>
            <div className="flex gap-4 mt-2">
              <button onClick={() => setActiveTab('ativos')} className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'ativos' ? 'text-red-600' : 'text-zinc-500'}`}>Entrada</button>
              <button onClick={() => setActiveTab('historico')} className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'historico' ? 'text-red-600' : 'text-zinc-500'}`}>Histórico</button>
            </div>
          </div>
        </div>
        <button onClick={() => setActiveTab('nova')} className="w-full md:w-auto bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-3">
          <Plus size={18} /> Nova O.S.
        </button>
      </div>

      {activeTab === 'nova' ? (
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setActiveTab('ativos')} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 uppercase font-black text-[9px] tracking-widest"><ArrowLeft size={14}/> Voltar</button>
          <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-12 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-white"><UserPlus className="text-red-600" /> Registro de Entrada</h2>
            <form onSubmit={handleCreateOS} className="space-y-6">
              <input required value={newOS.clientName} onChange={e => setNewOS({...newOS, clientName: e.target.value})} placeholder="Nome do Cliente" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
              <input value={newOS.phone} onChange={e => setNewOS({...newOS, phone: e.target.value})} placeholder="WhatsApp" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input required value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} placeholder="Veículo" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
                <input required value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value.toUpperCase()})} placeholder="Placa" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-black text-white focus:border-red-600 outline-none uppercase" />
              </div>
              <textarea value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} placeholder="Relato inicial..." className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:border-red-600 outline-none h-24 resize-none" />
              <button type="submit" disabled={isSaving} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all">{isSaving ? <Loader2 className="animate-spin mx-auto" /> : 'Abrir Ordem de Serviço'}</button>
            </form>
          </div>
        </div>
      ) : view === 'lista' ? (
        <div className="space-y-6">
          <div className="relative group w-full max-w-lg">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
             <input placeholder="Filtrar placa ou cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-red-600 outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOrders.map(os => (
              <div key={os.id} className="relative group/card">
                <div onClick={() => { setSelectedOS(os); setView('detalhes'); }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-red-600/50 transition-all cursor-pointer shadow-xl h-full flex flex-col pt-16 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between border-b border-zinc-800/50 bg-black/20">
                    <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase border ${getStatusColor(os.status)}`}>{os.status}</span>
                    <span className="text-[9px] font-black text-zinc-400 font-mono tracking-widest">#{os.id.slice(-4)}</span>
                    <button onClick={(e) => {e.stopPropagation(); setShowQuickMenu(showQuickMenu === os.id ? null : os.id);}} className="p-1 text-zinc-600 hover:text-white"><MoreVertical size={16}/></button>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xl font-black uppercase truncate mb-2 text-white">{os.clientName}</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2 mb-6"><Car size={12}/> {os.vehicle} • <span className="text-white bg-white/5 px-2 py-0.5 rounded font-mono">{os.plate}</span></p>
                    <div className="pt-6 border-t border-zinc-800 flex justify-between items-center">
                      <p className="text-lg font-black text-white">R$ {os.total.toFixed(2)}</p>
                      <ChevronRight size={20} className="text-zinc-800 group-hover/card:text-red-600 transition-all" />
                    </div>
                  </div>
                </div>
                {showQuickMenu === os.id && (
                  <div className="absolute top-12 right-6 w-44 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95">
                     <p className="text-[7px] font-black uppercase text-zinc-600 px-3 py-1 mb-1">Mudar Status</p>
                     <div className="max-h-40 overflow-y-auto no-scrollbar space-y-1">
                        {STATUS_LIST.map(st => (
                          <button key={st} onClick={(e) => { e.stopPropagation(); saveToDatabase(orders.map(o => o.id === os.id ? {...o, status: st} : o)); setShowQuickMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg text-[8px] font-black uppercase text-zinc-400 hover:bg-white/5 hover:text-white transition-all">{st}</button>
                        ))}
                     </div>
                     <div className="h-px bg-zinc-800 my-2" />
                     <button onClick={(e) => { e.stopPropagation(); if(confirm('Apagar O.S.?')) saveToDatabase(orders.filter(o => o.id !== os.id)); setShowQuickMenu(null); }} className="w-full text-left px-3 py-2 rounded-lg text-[8px] font-black uppercase text-red-500 hover:bg-red-500/10 flex items-center gap-2"><Trash2 size={12}/> Excluir O.S.</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
           {/* Sidebar e conteúdo de detalhes simplificado para exemplo */}
           <div className="w-full lg:w-80 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                 <button onClick={() => setView('lista')} className="text-[9px] font-black uppercase text-zinc-600 hover:text-white flex items-center gap-2 mb-6"><ArrowLeft size={14}/> Voltar</button>
                 <h2 className="text-3xl font-black uppercase tracking-tighter mb-1 text-red-600">{selectedOS?.plate}</h2>
                 <p className="text-zinc-500 font-bold uppercase text-[10px] mb-8 tracking-widest">{selectedOS?.vehicle}</p>
                 
                 <div className="pt-6 border-t border-zinc-800">
                    <div className="flex justify-between items-center text-white font-black"><span className="text-xs uppercase">Total</span><span className="text-2xl text-red-600">R$ {selectedOS?.total.toFixed(2)}</span></div>
                 </div>

                 <div className="mt-8">
                   <button onClick={sendWhatsApp} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl"><Send size={16} /> Enviar Orçamento</button>
                 </div>
              </div>
           </div>
           <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-lg font-black uppercase text-white mb-6">Itens da O.S.</h3>
              {/* Lógica de itens aqui conforme Oficina/Oficina.tsx original */}
              <p className="text-zinc-500 text-xs uppercase font-bold italic">Selecione os serviços e peças para compor o orçamento.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;
