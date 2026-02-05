
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, X, Trash2, Calendar, ArrowLeft, Zap, User, Car, 
  Package, Wrench, Share2, Check, AlertCircle, Clock, ChevronRight, 
  CheckCircle2, AlertTriangle, UserPlus, FileText, Save, Loader2, Users,
  History, DollarSign, Activity, Phone
} from 'lucide-react';
import { ServiceOrder, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Estados de Interface
  const [activeTab, setActiveTab] = useState<'ativos' | 'nova'>('ativos');
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  
  // Estados de Dados
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Estados do Formulário
  const [newOS, setNewOS] = useState({ 
    clientName: '', phone: '', vehicle: '', plate: '', description: ''
  });

  const [newItem, setNewItem] = useState<Partial<ServiceItem>>({
    type: 'PEÇA', description: '', quantity: 1, price: 0
  });

  // Chave única por cliente SaaS (Isolamento de Base de Dados)
  const getStorageKey = (userId: string) => `crmplus_oficina_v2_orders_${userId}`;

  useEffect(() => {
    const savedUserStr = sessionStorage.getItem('crmplus_user');
    if (!savedUserStr) {
      console.error("Usuário não encontrado na sessão.");
      return;
    }

    const user = JSON.parse(savedUserStr);
    setCurrentUser(user);

    const key = getStorageKey(user.id);
    const savedOrders = JSON.parse(localStorage.getItem(key) || '[]');
    setOrders(savedOrders);

    // Suporte a link direto para uma OS
    const osId = searchParams.get('id');
    if (osId) {
      const found = savedOrders.find((o: ServiceOrder) => o.id === osId);
      if (found) {
        setSelectedOS(found);
        setView('detalhes');
      }
    }
  }, [searchParams]);

  const saveToDatabase = (updatedOrders: ServiceOrder[]) => {
    if (!currentUser) return;
    const key = getStorageKey(currentUser.id);
    localStorage.setItem(key, JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    // Notifica outros componentes/abas sobre a mudança
    window.dispatchEvent(new Event('storage'));
  };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOS.clientName || !newOS.vehicle || !newOS.plate || !currentUser) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsSaving(true);

    try {
      const os: ServiceOrder = {
        id: `OS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        clientId: '', // Pode ser vinculado ao módulo de clientes futuramente
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

      // Limpeza e Redirecionamento
      setNewOS({ clientName: '', phone: '', vehicle: '', plate: '', description: '' });
      setActiveTab('ativos');
      setView('lista');
      
      console.log("OS Criada com Sucesso:", os.id);
    } catch (err) {
      console.error("Erro ao criar OS:", err);
      alert("Falha técnica ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
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
    const total = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    
    const updatedOS = { ...selectedOS, items: updatedItems, total };
    const updatedOrders = orders.map(o => o.id === selectedOS.id ? updatedOS : o);
    
    setSelectedOS(updatedOS);
    saveToDatabase(updatedOrders);
    setNewItem({ type: 'PEÇA', description: '', quantity: 1, price: 0 });
  };

  const deleteOS = (id: string) => {
    if (!window.confirm("Deseja realmente excluir esta O.S. permanentemente?")) return;
    const updated = orders.filter(o => o.id !== id);
    saveToDatabase(updated);
    if (selectedOS?.id === id) {
      setView('lista');
      setSelectedOS(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const totals = useMemo(() => {
    if (!selectedOS) return { pecas: 0, servicos: 0 };
    return {
      pecas: (selectedOS.items || []).filter(i => i.type === 'PEÇA').reduce((a, b) => a + (b.price * b.quantity), 0),
      servicos: (selectedOS.items || []).filter(i => i.type === 'MÃO DE OBRA').reduce((a, b) => a + (b.price * b.quantity), 0)
    };
  }, [selectedOS]);

  const generateLink = (os: ServiceOrder) => {
    const payload = {
      i: os.id,
      tid: currentUser.id,
      n: os.clientName,
      v: os.vehicle,
      p: os.plate,
      d: os.description,
      t: os.total,
      dt: new Date(os.createdAt).toLocaleDateString(),
      it: (os.items || []).map(i => ({ d: i.description, q: i.quantity, p: i.price, t: i.type === 'PEÇA' ? 'P' : 'S' })),
      ph: os.photos || []
    };
    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const url = `${window.location.origin}/#/v/${base64}`;
    navigator.clipboard.writeText(url);
    alert('Link operacional copiado!');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-32 animate-in fade-in">
      {/* Header Operational */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-red-600 text-white rounded-3xl shadow-lg shadow-red-600/20"><Wrench size={32} /></div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Oficina <span className="text-red-600">Pro</span></h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Base Privada: {currentUser?.companyName}</p>
          </div>
        </div>
        
        {activeTab === 'ativos' && view === 'lista' && (
          <button 
            onClick={() => { setActiveTab('nova'); setView('lista'); }} 
            className="w-full md:w-auto bg-red-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3"
          >
            <Plus size={20} strokeWidth={3} /> Nova Entrada +
          </button>
        )}
      </div>

      {activeTab === 'nova' ? (
        <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95">
          <button 
            onClick={() => setActiveTab('ativos')} 
            className="text-zinc-500 hover:text-white flex items-center gap-2 mb-8 uppercase font-black text-[10px] tracking-widest transition-colors"
          >
            <ArrowLeft size={14}/> Voltar para Operacional
          </button>

          <div className="bg-zinc-900 border border-zinc-800 p-10 md:p-14 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5"><UserPlus size={120}/></div>
            
            <h2 className="text-2xl font-black uppercase tracking-tight mb-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600/10 text-red-600 rounded-2xl flex items-center justify-center"><UserPlus size={24}/></div>
              Registro de Nova Entrada
            </h2>

            <form onSubmit={handleCreateOS} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Proprietário / Cliente</label>
                  <input 
                    required 
                    value={newOS.clientName} 
                    onChange={e => setNewOS({...newOS, clientName: e.target.value})}
                    placeholder="Nome completo" 
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">WhatsApp de Contato</label>
                  <input 
                    value={newOS.phone} 
                    onChange={e => setNewOS({...newOS, phone: e.target.value})}
                    placeholder="(00) 00000-0000" 
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Veículo / Modelo</label>
                  <input 
                    required 
                    value={newOS.vehicle} 
                    onChange={e => setNewOS({...newOS, vehicle: e.target.value})}
                    placeholder="Ex: Golf TSI 2020" 
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Placa</label>
                  <input 
                    required 
                    value={newOS.plate} 
                    onChange={e => setNewOS({...newOS, plate: e.target.value.toUpperCase()})}
                    placeholder="ABC-1234" 
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-black text-white focus:border-red-600 outline-none transition-all uppercase tracking-widest" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Relato de Problemas ou Checklist</label>
                <textarea 
                  value={newOS.description} 
                  onChange={e => setNewOS({...newOS, description: e.target.value})}
                  placeholder="Descreva aqui os sintomas relatados pelo cliente..." 
                  className="w-full bg-black border border-zinc-800 rounded-3xl p-6 text-sm font-medium text-zinc-300 focus:border-red-600 outline-none h-40 resize-none transition-all" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-red-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-red-600/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {isSaving ? 'Registrando...' : 'Abrir Ordem de Serviço Agora'}
              </button>
            </form>
          </div>
        </div>
      ) : view === 'lista' ? (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative group w-full max-w-xl">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={20} />
               <input 
                placeholder="Pesquisar por cliente ou placa..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold focus:border-red-600 outline-none transition-all" 
               />
            </div>
            <div className="text-[10px] font-black uppercase text-zinc-600 tracking-widest bg-zinc-900/50 px-6 py-3 rounded-full border border-zinc-800 flex items-center gap-2">
               <Activity size={14} className="text-emerald-500" /> {filteredOrders.length} ordens encontradas
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(os => (
              <div 
                key={os.id} 
                onClick={() => { setSelectedOS(os); setView('detalhes'); }} 
                className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] group hover:border-red-600 transition-all cursor-pointer shadow-xl relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black font-mono text-zinc-600 bg-black/40 px-3 py-1 rounded-lg border border-zinc-800">#{os.id.split('-')[1]?.slice(-4) || 'OS'}</span>
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border ${os.status === 'Execução' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20' : 'bg-black/50 border-zinc-800 text-zinc-500'}`}>{os.status}</span>
                </div>
                <h3 className="text-xl font-black uppercase truncate mb-2 group-hover:text-red-500 transition-colors">{os.clientName}</h3>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Car size={12}/> {os.vehicle} • <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">{os.plate}</span></p>
                
                <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-zinc-600 uppercase">Orçamento</p>
                      <p className="text-xl font-black text-white">R$ {os.total.toFixed(2)}</p>
                   </div>
                   <ChevronRight size={24} className="text-zinc-700 group-hover:text-red-600 transition-all" />
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="col-span-full py-32 text-center opacity-20 border-2 border-dashed border-zinc-800 rounded-[3rem]">
                 <Wrench size={64} className="mx-auto mb-4" />
                 <p className="font-black uppercase tracking-[0.3em]">Nenhum registro encontrado nesta base</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in">
           {/* Coluna Lateral de Resumo */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                 <button onClick={() => setView('lista')} className="text-[10px] font-black uppercase text-zinc-600 hover:text-white flex items-center gap-2 mb-8 transition-all"><ArrowLeft size={14}/> Voltar operacional</button>
                 <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 text-red-600">{selectedOS?.plate}</h2>
                 <p className="text-zinc-500 font-bold uppercase text-xs mb-8 tracking-widest">{selectedOS?.vehicle}</p>
                 
                 <div className="space-y-4 pt-8 border-t border-zinc-800">
                    <div className="flex justify-between items-center"><span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Peças</span><span className="font-bold">R$ {totals.pecas.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Mão de Obra</span><span className="font-bold">R$ {totals.servicos.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center pt-6 border-t border-zinc-800"><span className="text-[11px] font-black text-white uppercase">Geral</span><span className="text-3xl font-black text-red-600">R$ {selectedOS?.total.toFixed(2)}</span></div>
                 </div>

                 <div className="flex flex-col gap-3 mt-10">
                   <button onClick={() => selectedOS && generateLink(selectedOS)} className="w-full bg-zinc-800 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-700 transition-all border border-zinc-700">
                      <Share2 size={16} /> Link p/ WhatsApp
                   </button>
                   <button onClick={() => selectedOS && deleteOS(selectedOS.id)} className="w-full bg-red-600/10 text-red-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all">
                      <Trash2 size={16} /> Excluir Registro
                   </button>
                 </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] space-y-4 shadow-xl">
                 <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Gerenciar Fluxo</p>
                 <div className="grid grid-cols-2 gap-2">
                    {['Aberto', 'Orçamento', 'Execução', 'Pronto'].map(st => (
                      <button 
                        key={st} 
                        onClick={() => {
                          if (selectedOS) {
                            const updated = orders.map(o => o.id === selectedOS.id ? {...o, status: st as any} : o);
                            setSelectedOS({...selectedOS, status: st as any});
                            saveToDatabase(updated);
                          }
                        }}
                        className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedOS?.status === st ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-black border-zinc-800 text-zinc-600'}`}
                      >
                        {st}
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Coluna Principal de Lançamentos */}
           <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-[4rem] p-12 shadow-2xl flex flex-col gap-10">
              <div className="bg-black/40 border border-zinc-800 p-8 rounded-[3rem] space-y-8">
                 <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3"><Zap size={20} className="text-red-600"/> Lançamento Direto</h3>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-1">
                       <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 ml-1">Tipo</label>
                       <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-red-600">
                          <option value="PEÇA">PEÇA</option>
                          <option value="MÃO DE OBRA">SERVIÇO</option>
                       </select>
                    </div>
                    <div className="md:col-span-2">
                       <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 ml-1">Descrição do Item</label>
                       <input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-red-600" />
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 ml-1">Valor Unit.</label>
                       <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-red-600" />
                    </div>
                 </div>
                 <button onClick={handleAddItem} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"><Plus size={16} strokeWidth={3}/> Adicionar ao Orçamento</button>
              </div>

              <div className="flex-1 space-y-10 overflow-y-auto no-scrollbar pr-2">
                 {['PEÇA', 'MÃO DE OBRA'].map(cat => {
                   const catItems = (selectedOS?.items || []).filter(i => i.type === cat);
                   return (
                     <div key={cat} className="space-y-4">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-red-600">{cat === 'PEÇA' ? <Package size={14}/> : <Wrench size={14}/>}</div>
                          {cat === 'PEÇA' ? 'Componentes e Peças' : 'Serviços Prestados'}
                        </h4>
                        <div className="space-y-2">
                          {catItems.length > 0 ? catItems.map(item => (
                            <div key={item.id} className="bg-black/30 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                               <div className="flex-1">
                                  <p className="text-sm font-black uppercase text-white tracking-tight">{item.description}</p>
                                  <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1">Qtde: {item.quantity} • Unit: R$ {item.price.toFixed(2)}</p>
                               </div>
                               <div className="flex items-center gap-6">
                                  <p className="text-lg font-black text-zinc-300">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                  <button onClick={() => {
                                      if (selectedOS) {
                                        const updatedItems = selectedOS.items.filter(i => i.id !== item.id);
                                        const total = updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
                                        const updatedOS = { ...selectedOS, items: updatedItems, total };
                                        saveToDatabase(orders.map(o => o.id === selectedOS.id ? updatedOS : o));
                                        setSelectedOS(updatedOS);
                                      }
                                  }} className="p-2 text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                               </div>
                            </div>
                          )) : <p className="text-[10px] font-black uppercase text-zinc-800 italic ml-4">Sem lançamentos registrados</p>}
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
