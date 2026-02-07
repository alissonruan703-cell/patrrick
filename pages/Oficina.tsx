
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, Trash2, ArrowLeft, Zap, Car, 
  Package, Wrench, Share2, ChevronRight, UserPlus, Save, Loader2, Activity,
  Camera, X, Settings2, MessageSquare, ClipboardList, CheckCircle2, History
} from 'lucide-react';
import { ServiceOrder, ServiceItem, PhotoWithObs } from '../types';

const STATUS_LIST: ServiceOrder['status'][] = [
  'Aberto', 'Orçamento', 'Aguardando Peças', 'Execução', 
  'Pendente Cliente', 'Pronto', 'Entregue', 'Reprovado', 'Garantia', 'Finalizado'
];

const Oficina: React.FC = () => {
  const navigate = useNavigate();
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

  // Estados para novas fotos/obs
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewOS(prev => ({ ...prev, photos: [...prev.photos, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleExecutionPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedOS || !e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto: PhotoWithObs = {
        url: reader.result as string,
        obs: execPhotoObs,
        timestamp: new Date().toISOString()
      };
      const updatedPhotos = [...(selectedOS.photos || []), newPhoto];
      const updatedOS = { ...selectedOS, photos: updatedPhotos };
      saveToDatabase(orders.map(o => o.id === selectedOS.id ? updatedOS : o));
      setSelectedOS(updatedOS);
      setExecPhotoObs('');
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOS.clientName || !newOS.vehicle || !newOS.plate || !currentUser) return;
    setIsSaving(true);
    
    // Converte fotos simples de abertura para o novo formato estruturado
    const initialPhotos: PhotoWithObs[] = newOS.photos.map(url => ({
      url,
      obs: 'Foto de abertura',
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

  const updateBudgetNotes = (notes: string) => {
    if (!selectedOS) return;
    const updatedOS = { ...selectedOS, budgetNotes: notes };
    setSelectedOS(updatedOS);
    saveToDatabase(orders.map(o => o.id === selectedOS.id ? updatedOS : o));
  };

  const generateLink = () => {
    if (!selectedOS || !currentUser) return;
    // Payload otimizado com chaves curtas para link menor
    const payload = {
      i: selectedOS.id,
      tid: currentUser.id,
      n: selectedOS.clientName,
      v: selectedOS.vehicle,
      p: selectedOS.plate,
      d: selectedOS.description,
      bn: selectedOS.budgetNotes || '',
      t: selectedOS.total,
      cn: currentUser.companyName,
      ph: selectedOS.photos.map(p => ({ u: p.url, o: p.obs })),
      it: (selectedOS.items || []).map(i => ({ d: i.description, q: i.quantity, p: i.price }))
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
        if (['Entregue', 'Reprovado', 'Finalizado'].includes(o.status)) return false;
        if (operationalFilter !== 'Todos' && o.status !== operationalFilter) return false;
      } else if (activeTab === 'historico') {
        if (!['Entregue', 'Reprovado', 'Finalizado'].includes(o.status)) return false;
      }
      return true;
    });
  }, [orders, searchTerm, activeTab, operationalFilter]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg"><Wrench size={24} /></div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Oficina <span className="text-red-600">Pro+</span></h1>
            <div className="flex gap-4 mt-2">
              <button onClick={() => setActiveTab('ativos')} className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'ativos' ? 'text-red-600' : 'text-zinc-500'}`}>Operacional</button>
              <button onClick={() => setActiveTab('historico')} className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'historico' ? 'text-red-600' : 'text-zinc-500'}`}>Histórico</button>
            </div>
          </div>
        </div>
        <button onClick={() => setActiveTab('nova')} className="w-full md:w-auto bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-3">
          <Plus size={18} /> Abrir O.S.
        </button>
      </div>

      {activeTab === 'nova' ? (
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setActiveTab('ativos')} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 uppercase font-black text-[9px] tracking-widest transition-all">
            <ArrowLeft size={14}/> Voltar operacional
          </button>
          <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-12 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3"><UserPlus className="text-red-600" /> Nova Entrada</h2>
            <form onSubmit={handleCreateOS} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={newOS.clientName} onChange={e => setNewOS({...newOS, clientName: e.target.value})} placeholder="Nome do Cliente" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
                <input value={newOS.phone} onChange={e => setNewOS({...newOS, phone: e.target.value})} placeholder="WhatsApp" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} placeholder="Veículo" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
                <input required value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value.toUpperCase()})} placeholder="Placa" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-black text-white focus:border-red-600 outline-none uppercase" />
              </div>
              <textarea value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} placeholder="Relato técnico inicial..." className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:border-red-600 outline-none h-24 resize-none" />
              
              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase text-zinc-600 ml-1">Fotos do Veículo (Check-in)</p>
                <div className="flex flex-wrap gap-2">
                   <button type="button" onClick={() => fileInputRef.current?.click()} className="w-16 h-16 bg-black border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-700 hover:text-red-600 hover:border-red-600 transition-all"><Camera size={20}/></button>
                   {newOS.photos.map((ph, i) => (
                     <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-800"><img src={ph} className="w-full h-full object-cover" /><button onClick={() => setNewOS(prev => ({...prev, photos: prev.photos.filter((_, idx) => idx !== i)}))} className="absolute top-0 right-0 bg-red-600 p-0.5"><X size={10}/></button></div>
                   ))}
                   <input type="file" multiple ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all">
                {isSaving ? <Loader2 className="animate-spin" /> : 'Abrir Ordem de Serviço'}
              </button>
            </form>
          </div>
        </div>
      ) : view === 'lista' ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative group w-full max-w-lg">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
               <input placeholder="Filtrar por placa ou cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-red-600 outline-none" />
            </div>
            {activeTab === 'ativos' && (
              <select value={operationalFilter} onChange={e => setOperationalFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-2 text-[9px] font-black uppercase text-zinc-500 outline-none cursor-pointer">
                <option value="Todos">Todos os Status</option>
                {STATUS_LIST.slice(0, 7).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(os => (
              <div key={os.id} className="relative group">
                <div onClick={() => { setSelectedOS(os); setView('detalhes'); }} className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] hover:border-red-600 transition-all cursor-pointer shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black text-zinc-700 font-mono">#{os.id.slice(-4)}</span>
                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${os.status === 'Execução' ? 'text-emerald-500 border-emerald-500/20' : 'text-zinc-500 border-zinc-800'}`}>{os.status}</span>
                  </div>
                  <h3 className="text-lg font-black uppercase truncate mb-1">{os.clientName}</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2 truncate"><Car size={12}/> {os.vehicle} • <span className="text-white bg-white/5 px-2 py-0.5 rounded font-mono">{os.plate}</span></p>
                  <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-between items-center">
                    <p className="text-lg font-black text-white">R$ {os.total.toFixed(2)}</p>
                    <ChevronRight size={20} className="text-zinc-800 group-hover:text-red-600 transition-all" />
                  </div>
                </div>

                {/* Menu de Ações Rápidas */}
                <div className="absolute top-4 right-10">
                  <button onClick={(e) => { e.stopPropagation(); setShowQuickMenu(showQuickMenu === os.id ? null : os.id); }} className="p-2 bg-black/40 border border-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all"><Settings2 size={16}/></button>
                  {showQuickMenu === os.id && (
                    <div className="absolute right-0 top-10 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95">
                       <p className="text-[8px] font-black uppercase text-zinc-600 px-3 py-2 border-b border-zinc-800 mb-2">Alterar Status</p>
                       <div className="max-h-40 overflow-y-auto no-scrollbar space-y-1">
                          {STATUS_LIST.map(st => (
                            <button key={st} onClick={(e) => { e.stopPropagation(); saveToDatabase(orders.map(o => o.id === os.id ? {...o, status: st} : o)); setShowQuickMenu(null); }} className="w-full text-left px-3 py-2 rounded-lg text-[9px] font-black uppercase text-zinc-400 hover:bg-white/5 hover:text-white transition-all">{st}</button>
                          ))}
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); if(confirm('Excluir OS?')) saveToDatabase(orders.filter(o => o.id !== os.id)); setShowQuickMenu(null); }} className="w-full text-left px-3 py-2 mt-2 border-t border-zinc-800 rounded-lg text-[9px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2"><Trash2 size={12}/> Excluir Registro</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
           {/* Sidebar de Resumo */}
           <div className="w-full lg:w-80 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                 <button onClick={() => setView('lista')} className="text-[9px] font-black uppercase text-zinc-600 hover:text-white flex items-center gap-2 mb-6"><ArrowLeft size={14}/> Voltar</button>
                 <h2 className="text-3xl font-black uppercase tracking-tighter mb-1 text-red-600">{selectedOS?.plate}</h2>
                 <p className="text-zinc-500 font-bold uppercase text-[10px] mb-8 tracking-widest">{selectedOS?.vehicle}</p>
                 
                 <div className="space-y-4 mb-8">
                    <p className="text-[9px] font-black uppercase text-zinc-600 ml-1">Mudar Status Geral</p>
                    <select value={selectedOS?.status} onChange={e => {
                        const next = e.target.value as any;
                        const updated = {...selectedOS!, status: next};
                        setSelectedOS(updated);
                        saveToDatabase(orders.map(o => o.id === selectedOS!.id ? updated : o));
                    }} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-[10px] font-black uppercase text-white outline-none">
                        {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>

                 <div className="pt-6 border-t border-zinc-800 space-y-2">
                    <div className="flex justify-between text-[10px]"><span className="text-zinc-600 font-black uppercase">Subtotal Itens</span><span className="font-bold">R$ {selectedOS?.total.toFixed(2)}</span></div>
                    <div className="flex justify-between pt-4 border-t border-zinc-800"><span className="text-xs font-black uppercase text-white">Geral</span><span className="text-2xl font-black text-red-600">R$ {selectedOS?.total.toFixed(2)}</span></div>
                 </div>

                 <div className="mt-8">
                   <button onClick={generateLink} className="w-full bg-zinc-800 text-white py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all"><Share2 size={16} /> Enviar Orçamento</button>
                 </div>
              </div>

              {/* Notas do Orçamento */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] shadow-xl space-y-4">
                 <h3 className="text-[10px] font-black uppercase text-white flex items-center gap-2"><MessageSquare size={14} className="text-red-600"/> Nota p/ Cliente</h3>
                 <textarea value={selectedOS?.budgetNotes} onChange={e => updateBudgetNotes(e.target.value)} placeholder="Condições de pagamento, prazo de entrega..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-[10px] text-zinc-400 font-medium h-32 resize-none focus:border-red-600 outline-none" />
              </div>
           </div>

           {/* Painel Principal de Lançamento e Execução */}
           <div className="flex-1 space-y-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-6 md:p-10 shadow-2xl flex flex-col gap-8">
                 <div className="bg-black/30 border border-zinc-800 p-6 rounded-[2rem] space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><Zap size={18} className="text-red-600"/> Lançamento de Itens</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                       <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none">
                          <option value="PEÇA">PEÇA</option>
                          <option value="MÃO DE OBRA">SERVIÇO</option>
                       </select>
                       <input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Descrição" className="w-full sm:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none" />
                       <input type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} placeholder="Qtd" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none" />
                       <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="Valor Unit." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none" />
                    </div>
                    <button onClick={handleAddItem} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"><Plus size={16}/> Adicionar ao Orçamento</button>
                 </div>

                 {/* Tabela de Itens */}
                 <div className="space-y-6 overflow-y-auto no-scrollbar max-h-[400px]">
                    {(selectedOS?.items || []).map(item => (
                      <div key={item.id} className="bg-black/30 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between group">
                         <div className="flex-1 truncate pr-4">
                            <p className="text-xs font-black uppercase text-white truncate">{item.description}</p>
                            <p className="text-[9px] font-bold text-zinc-600 uppercase mt-1">{item.type} • Qtd: {item.quantity} • Un: R$ {item.price.toFixed(2)}</p>
                         </div>
                         <div className="flex items-center gap-4">
                            <p className="text-sm font-black text-zinc-300 font-mono">R$ {(item.price * item.quantity).toFixed(2)}</p>
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

              {/* Registro de Execução / Fotos */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><Camera size={18} className="text-red-600"/> Registro de Execução</h3>
                 </div>

                 <div className="bg-black/30 border border-zinc-800 p-6 rounded-[2rem] space-y-4">
                    <p className="text-[9px] font-black uppercase text-zinc-600">Anexar evidência do serviço realizado</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                       <input value={execPhotoObs} onChange={e => setExecPhotoObs(e.target.value)} placeholder="Observação da foto (Opcional)" className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-[10px] font-bold text-white outline-none" />
                       <button onClick={() => executionFileRef.current?.click()} className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"><Plus size={16}/> Selecionar Foto</button>
                       <input type="file" ref={executionFileRef} onChange={handleExecutionPhoto} className="hidden" accept="image/*" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(selectedOS?.photos || []).map((ph, idx) => (
                      <div key={idx} className="bg-black/40 border border-zinc-800 rounded-2xl overflow-hidden group relative">
                         <img src={ph.url} className="w-full aspect-video object-cover" />
                         <div className="p-4 bg-zinc-900/80 backdrop-blur-md">
                            <p className="text-[9px] text-zinc-400 font-medium italic">"{ph.obs || 'Sem observação.'}"</p>
                            <p className="text-[7px] font-black text-zinc-600 uppercase mt-2 tracking-widest">{new Date(ph.timestamp).toLocaleString('pt-BR')}</p>
                         </div>
                         <button onClick={() => {
                            const updated = { ...selectedOS!, photos: selectedOS!.photos.filter((_, i) => i !== idx) };
                            setSelectedOS(updated);
                            saveToDatabase(orders.map(o => o.id === selectedOS!.id ? updated : o));
                         }} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl"><X size={12}/></button>
                      </div>
                    ))}
                    {(selectedOS?.photos || []).length === 0 && (
                       <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-800 rounded-[2rem] opacity-30">
                          <Camera size={32} className="mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma imagem anexada ao serviço</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;
