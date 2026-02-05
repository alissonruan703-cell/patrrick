
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, X, Trash2, Calendar, ArrowLeft, Zap, User, Car, 
  Package, Wrench, Share2, Check, AlertCircle, Clock, ChevronRight, 
  CheckCircle2, AlertTriangle, UserPlus, FileText, Save, Loader2, Users,
  History, DollarSign, Activity, Phone
} from 'lucide-react';
import { ServiceOrder, UserProfile, Client, Notification, HistoryEvent, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'ativos' | 'nova'>('ativos');
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [newItem, setNewItem] = useState<Partial<ServiceItem>>({
    type: 'PEÇA', description: '', quantity: 1, price: 0
  });

  const [newOS, setNewOS] = useState({ 
    clientName: '', phone: '', vehicle: '', plate: '', description: ''
  });

  // Chave dinâmica para isolamento de dados por cliente SaaS
  const getStorageKey = (userId: string) => `crmplus_oficina_orders_${userId}`;

  useEffect(() => {
    const savedUser = JSON.parse(sessionStorage.getItem('crmplus_user') || 'null');
    setCurrentUser(savedUser);

    if (savedUser) {
      const key = getStorageKey(savedUser.id);
      const savedOrders = JSON.parse(localStorage.getItem(key) || '[]');
      setOrders(savedOrders);

      // Deep link para uma OS específica
      const osId = searchParams.get('id');
      if (osId) {
        const found = savedOrders.find((o: any) => o.id === osId);
        if (found) { 
          setSelectedOS(found); 
          setView('detalhes'); 
        }
      }
    }
  }, [searchParams]);

  const saveToStorage = (updatedOrders: ServiceOrder[]) => {
    if (!currentUser) return;
    const key = getStorageKey(currentUser.id);
    localStorage.setItem(key, JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddItem = () => {
    if (!selectedOS || !newItem.description) return;
    const item: ServiceItem = {
      id: Date.now().toString(),
      type: newItem.type as 'PEÇA' | 'MÃO DE OBRA',
      description: newItem.description || '',
      brand: '',
      quantity: newItem.quantity || 1,
      price: newItem.price || 0,
      timestamp: new Date().toISOString()
    };
    
    const updatedItems = [...(selectedOS.items || []), item];
    const total = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    
    const updatedOS = { ...selectedOS, items: updatedItems, total };
    const updatedOrders = orders.map(o => o.id === selectedOS.id ? updatedOS : o);
    
    setSelectedOS(updatedOS);
    saveToStorage(updatedOrders);
    setNewItem({ type: 'PEÇA', description: '', quantity: 1, price: 0 });
  };

  const removeItem = (id: string) => {
    if (!selectedOS) return;
    const updatedItems = selectedOS.items.filter(i => i.id !== id);
    const total = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const updatedOS = { ...selectedOS, items: updatedItems, total };
    const updatedOrders = orders.map(o => o.id === selectedOS.id ? updatedOS : o);
    setSelectedOS(updatedOS);
    saveToStorage(updatedOrders);
  };

  const handleCreateOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOS.clientName || !newOS.vehicle || !newOS.plate || !currentUser) return;

    setIsSaving(true);

    // Simula um pequeno delay para feedback visual de processamento "premium"
    await new Promise(resolve => setTimeout(resolve, 600));

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
    saveToStorage(updated);
    
    // Sucesso
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setNewOS({ clientName: '', phone: '', vehicle: '', plate: '', description: '' });
      setActiveTab('ativos');
      setView('lista');
    }, 1500);
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

  const copyLink = (os: ServiceOrder) => {
    const payload = {
      i: os.id,
      tid: currentUser.id,
      n: os.clientName,
      v: os.vehicle,
      p: os.plate,
      d: os.description,
      t: os.total,
      dt: new Date(os.createdAt).toLocaleDateString(),
      it: os.items.map(i => ({ d: i.description, q: i.quantity, p: i.price, t: i.type === 'PEÇA' ? 'P' : 'S' })),
      ph: os.photos || []
    };
    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const url = `${window.location.origin}/#/v/${base64}`;
    navigator.clipboard.writeText(url);
    alert('Link de acompanhamento gerado para o cliente!');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-32 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-red-600 text-white rounded-3xl shadow-lg shadow-red-600/20"><Wrench size={32} /></div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Oficina <span className="text-red-600">Pro</span></h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Conta: {currentUser?.companyName}</p>
          </div>
        </div>
        
        {view === 'lista' && activeTab === 'ativos' && (
          <button 
            onClick={() => { setActiveTab('nova'); setView('lista'); }} 
            className="w-full md:w-auto bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:scale-105 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3"
          >
            <Plus size={18} strokeWidth={3} /> Nova Entrada
          </button>
        )}
      </div>

      {activeTab === 'nova' ? (
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => setActiveTab('ativos')} 
            className="text-zinc-500 hover:text-white flex items-center gap-2 mb-8 uppercase font-black text-[10px] tracking-widest transition-colors"
          >
            <ArrowLeft size={14}/> Voltar para a lista
          </button>

          <div className="bg-zinc-900 border border-zinc-800 p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
            {showSuccess && (
              <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-10 animate-in fade-in">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Entrada Registrada!</h2>
                <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-2">Redirecionando para o painel operacional...</p>
              </div>
            )}

            <div className="flex items-center gap-4 mb-10">
               <div className="w-12 h-12 bg-red-600/10 text-red-600 rounded-2xl flex items-center justify-center"><UserPlus size={24}/></div>
               <h2 className="text-2xl font-black uppercase tracking-tight">Protocolo de Entrada</h2>
            </div>

            <form onSubmit={handleCreateOS} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome do Cliente</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input required placeholder="Nome completo" value={newOS.clientName} onChange={e => setNewOS({...newOS, clientName: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-red-600 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">WhatsApp / Celular</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input placeholder="(00) 00000-0000" value={newOS.phone} onChange={e => setNewOS({...newOS, phone: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-red-600 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Veículo / Modelo</label>
                  <div className="relative">
                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input required placeholder="Ex: Honda Civic G10" value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-red-600 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Placa</label>
                  <input required placeholder="ABC-1234" value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-6 text-sm font-black text-white focus:border-red-600 outline-none transition-all uppercase tracking-widest" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2"><FileText size={14}/> Relato do Cliente / Diagnóstico Prévio</label>
                <textarea placeholder="Descreva os sintomas ou solicitações..." value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-3xl p-6 text-sm font-medium text-zinc-300 focus:border-red-600 outline-none h-40 resize-none transition-all" />
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className={`w-full py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${isSaving ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-red-600 text-white hover:brightness-110 active:scale-95 shadow-red-600/20'}`}
              >
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {isSaving ? 'Processando...' : 'Abrir Ordem de Serviço'}
              </button>
            </form>
          </div>
        </div>
      ) : view === 'lista' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative group w-full max-w-xl">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={20} />
               <input placeholder="Buscar por cliente ou placa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold focus:border-red-600 outline-none transition-all" />
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-zinc-600 tracking-widest bg-zinc-900/50 px-6 py-3 rounded-full border border-zinc-800">
               <Activity size={14} className="text-emerald-500" /> {filtered.length} Registros Encontrados
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(os => (
              <div key={os.id} onClick={() => { setSelectedOS(os); setView('detalhes'); }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] group hover:border-red-600 transition-all cursor-pointer shadow-xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-600/5 blur-3xl rounded-full"></div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black font-mono text-zinc-700 bg-black/40 px-3 py-1 rounded-lg border border-zinc-800">#{os.id.split('-')[1]?.slice(-4) || os.id.slice(-4)}</span>
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border ${os.status === 'Pronto' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-black/50 border-zinc-800 text-zinc-500'}`}>{os.status}</span>
                </div>
                <h3 className="text-xl font-black uppercase truncate mb-2 group-hover:text-red-500 transition-colors">{os.clientName}</h3>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Car size={12}/> {os.vehicle} • <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">{os.plate}</span></p>
                
                <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-zinc-600 uppercase">Investimento</p>
                      <p className="text-xl font-black text-white">R$ {os.total.toFixed(2)}</p>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all">
                      <ChevronRight size={20} />
                   </div>
                </div>
              </div>
            ))}
            
            {filtered.length === 0 && (
              <div className="col-span-full py-32 text-center opacity-20 border-2 border-dashed border-zinc-800 rounded-[4rem] flex flex-col items-center gap-6">
                 <Wrench size={64} />
                 <p className="font-black uppercase tracking-[0.4em] text-sm">Base de dados vazia para este filtro</p>
                 <button onClick={() => { setActiveTab('nova'); setView('lista'); }} className="bg-zinc-800 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-700">Começar Registro</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-top-4">
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                 <button onClick={() => setView('lista')} className="text-[10px] font-black uppercase text-zinc-600 hover:text-white flex items-center gap-2 mb-8 transition-all tracking-widest"><ArrowLeft size={14}/> Voltar operacional</button>
                 
                 <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black font-mono text-zinc-700">#{selectedOS?.id.slice(-6)}</span>
                    <div className="h-px flex-1 bg-zinc-800"></div>
                 </div>

                 <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 text-red-600">{selectedOS?.plate}</h2>
                 <p className="text-zinc-400 font-bold uppercase text-xs mb-8 tracking-widest">{selectedOS?.vehicle}</p>
                 
                 <div className="space-y-4 pt-8 border-t border-zinc-800">
                    <div className="flex justify-between items-center"><span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Peças</span><span className="font-bold">R$ {totals.pecas.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Mão de Obra</span><span className="font-bold">R$ {totals.servicos.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center pt-6 border-t border-zinc-800"><span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Total Geral</span><span className="text-3xl font-black text-red-600">R$ {selectedOS?.total.toFixed(2)}</span></div>
                 </div>

                 <button onClick={() => selectedOS && copyLink(selectedOS)} className="w-full mt-10 bg-zinc-800 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-700 transition-all border border-zinc-700 shadow-xl">
                    <Share2 size={16} /> Link p/ Cliente
                 </button>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] space-y-6 shadow-xl">
                 <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Gerenciar Status</p>
                 <div className="grid grid-cols-2 gap-3">
                    {['Aberto', 'Orçamento', 'Execução', 'Pronto'].map(st => (
                      <button 
                        key={st} 
                        onClick={() => {
                          if (selectedOS) {
                            const updated = orders.map(o => o.id === selectedOS.id ? {...o, status: st as any} : o);
                            setSelectedOS({...selectedOS, status: st as any});
                            saveToStorage(updated);
                          }
                        }}
                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedOS?.status === st ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-black border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                      >
                        {st}
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-[4rem] p-10 md:p-14 shadow-2xl flex flex-col gap-12">
              <div className="bg-black/40 border border-zinc-800 p-10 rounded-[3rem] space-y-10">
                 <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><Zap size={24} strokeWidth={3} className="text-red-600"/> Lançamento Direto</h3>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="col-span-1">
                       <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 ml-1 block">Tipo</label>
                       <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-red-600 appearance-none">
                          <option value="PEÇA">📦 PEÇA</option>
                          <option value="MÃO DE OBRA">🛠 SERVIÇO</option>
                       </select>
                    </div>
                    <div className="md:col-span-2">
                       <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 ml-1 block">Descrição do item</label>
                       <input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Ex: Troca de pastilha" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-red-600" />
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 ml-1 block">Valor Un.</label>
                       <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-red-600" />
                    </div>
                 </div>
                 <button onClick={handleAddItem} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"><Plus size={18} strokeWidth={3}/> Adicionar ao Orçamento</button>
              </div>

              <div className="flex-1 space-y-12 overflow-y-auto pr-4 no-scrollbar">
                 {['PEÇA', 'MÃO DE OBRA'].map(cat => {
                   const catItems = selectedOS?.items.filter(i => i.type === cat) || [];
                   return (
                     <div key={cat} className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-red-600 shadow-inner">{cat === 'PEÇA' ? <Package size={18}/> : <Wrench size={18}/>}</div>
                          {cat === 'PEÇA' ? 'Componentes & Peças' : 'Mão de Obra Especializada'}
                        </h4>
                        <div className="space-y-3">
                          {catItems.length > 0 ? catItems.map(item => (
                            <div key={item.id} className="bg-black/30 border border-zinc-800 p-6 rounded-[2rem] flex items-center justify-between group hover:border-zinc-600 transition-all">
                               <div className="flex-1">
                                  <p className="text-sm font-black uppercase text-white tracking-tight">{item.description}</p>
                                  <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1">Qtde: {item.quantity} • Unit: R$ {item.price.toFixed(2)}</p>
                               </div>
                               <div className="flex items-center gap-8">
                                  <p className="text-lg font-black text-zinc-300">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                  <button onClick={() => removeItem(item.id)} className="p-3 text-zinc-800 hover:text-red-500 bg-zinc-900/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><Trash2 size={18}/></button>
                               </div>
                            </div>
                          )) : (
                            <div className="py-10 text-center bg-black/10 rounded-[2rem] border border-dashed border-zinc-800/50">
                               <p className="text-[9px] font-black uppercase text-zinc-800 tracking-[0.2em]">Sem lançamentos registrados</p>
                            </div>
                          )}
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
