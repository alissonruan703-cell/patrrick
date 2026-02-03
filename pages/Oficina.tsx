
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, X, Trash2, Calendar, ArrowLeft, Zap, User, Car, 
  Package, Wrench, Share2, Check, AlertCircle, Clock, ChevronRight, 
  CheckCircle2, AlertTriangle, UserPlus, FileText, Save, Loader2, Users
} from 'lucide-react';
import { ServiceOrder, UserProfile, Client, Notification, HistoryEvent } from '../types';

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
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const [newOS, setNewOS] = useState<Partial<ServiceOrder>>({ 
    clientId: '', clientName: '', vehicle: '', plate: '', description: '', status: 'Aberto' 
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

  // Automated Integration Handler
  const triggerIntegrations = (action: string, details: string, clientId?: string, osId?: string) => {
    const timestamp = new Date().toISOString();
    const link = osId ? `/module/oficina?id=${osId}` : undefined;

    // 1. Audit Logs (Global & Profile)
    const history: HistoryEvent[] = JSON.parse(localStorage.getItem('crmplus_history') || '[]');
    const newEvent: HistoryEvent = {
      id: Date.now().toString(),
      timestamp,
      profileId: activeProfile?.id || 'sys',
      profileName: activeProfile?.name || 'Sistema',
      moduleId: 'oficina',
      action,
      details,
      clientId,
      link
    };
    localStorage.setItem('crmplus_history', JSON.stringify([newEvent, ...history]));

    // 2. Automated Notification
    const notifs: Notification[] = JSON.parse(localStorage.getItem('crmplus_notifications') || '[]');
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      profileId: 'admin', // Notify admins of OS activity
      title: action,
      message: details,
      type: action.includes('Concluída') ? 'success' : 'info',
      read: false,
      timestamp,
      link,
      moduleId: 'oficina'
    };
    localStorage.setItem('crmplus_notifications', JSON.stringify([newNotif, ...notifs]));
    
    window.dispatchEvent(new Event('storage'));
  };

  const handleSaveOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOS.clientId || !newOS.vehicle || !newOS.plate || isSaving) return;
    
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800)); // Simulated lag
    
    const os: ServiceOrder = {
      ...newOS as ServiceOrder,
      id: `OS-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      items: [],
      photos: [],
      total: 0,
      responsibleId: activeProfile?.id
    };

    const updated = [os, ...orders];
    localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updated));
    setOrders(updated);
    
    triggerIntegrations('O.S. Criada', `Novo veículo ${os.plate} registrado para ${os.clientName}.`, os.clientId, os.id);
    
    setIsSaving(false);
    setShowToast(true);
    setTimeout(() => { 
      setShowToast(false); 
      setSelectedOS(os); 
      setView('detalhes');
      setActiveTab('ativos');
    }, 1500);
  };

  const handleStatusChange = (newStatus: ServiceOrder['status']) => {
    if (!selectedOS) return;
    const updated = orders.map(o => o.id === selectedOS.id ? { ...o, status: newStatus } : o);
    localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updated));
    setOrders(updated);
    setSelectedOS({ ...selectedOS, status: newStatus });
    
    triggerIntegrations('Status Alterado', `O.S. ${selectedOS.id} mudou para: ${newStatus}`, selectedOS.clientId, selectedOS.id);
  };

  const filtered = orders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto pb-32">
      {/* Toast Feedback */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10">
          <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-4 shadow-2xl border border-emerald-500">
            <CheckCircle2 size={20} /> Salvo com sucesso!
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-white/[0.02] p-8 rounded-[3rem] border border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-600/20"><Wrench size={32} /></div>
          <div><h1 className="text-3xl font-black uppercase tracking-tighter">Oficina</h1><p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Controle Operacional</p></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setView('lista'); setActiveTab('ativos'); }} className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-all ${activeTab === 'ativos' && view === 'lista' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500'}`}>Lista</button>
          <button onClick={() => setActiveTab('nova')} className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-all ${activeTab === 'nova' ? 'bg-white text-black' : 'bg-red-600 text-white'}`}>Novo Atendimento</button>
        </div>
      </div>

      {activeTab === 'nova' ? (
        <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
          <h2 className="text-2xl font-black uppercase mb-8 border-b border-zinc-800 pb-6">Protocolo de Entrada</h2>
          <form onSubmit={handleSaveOS} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Vincular Cliente</label>
              <select 
                required 
                value={newOS.clientId}
                onChange={e => {
                  const c = clients.find(cl => cl.id === e.target.value);
                  setNewOS({...newOS, clientId: e.target.value, clientName: c?.name || ''});
                }}
                className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600 outline-none"
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <input required placeholder="Modelo do Veículo" value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} className="bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600 outline-none" />
               <input required placeholder="Placa" value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value})} className="bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-black tracking-widest uppercase focus:border-red-600 outline-none" />
            </div>
            <textarea required rows={4} placeholder="O que precisa ser feito?" value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-medium focus:border-red-600 resize-none outline-none" />
            <div className="pt-6 border-t border-zinc-800 flex gap-4">
              <button type="button" onClick={() => setActiveTab('ativos')} className="flex-1 font-black uppercase text-xs text-zinc-500 hover:text-white">Cancelar</button>
              <button 
                disabled={isSaving}
                type="submit" 
                className="flex-[2] bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? 'Processando...' : 'Confirmar Registro'}
              </button>
            </div>
          </form>
        </div>
      ) : view === 'lista' ? (
        <div className="space-y-8 animate-in fade-in">
          <div className="relative group max-w-xl">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
             <input placeholder="Busca por placa ou cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold focus:border-red-600 outline-none transition-all" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(os => (
              <div key={os.id} onClick={() => { setSelectedOS(os); setView('detalhes'); }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] group hover:border-red-600 transition-all cursor-pointer shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black font-mono text-zinc-700">#{os.id}</span>
                  <span className="bg-black/50 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-zinc-800">{os.status}</span>
                </div>
                <h3 className="text-xl font-black uppercase truncate group-hover:text-red-500">{os.clientName}</h3>
                <p className="text-[11px] font-bold text-zinc-500 uppercase mt-2">{os.vehicle} | <span className="font-mono text-white tracking-widest">{os.plate}</span></p>
                <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
                   <p className="text-lg font-black">R$ {os.total.toFixed(2)}</p>
                   <ChevronRight size={18} className="text-zinc-700 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-top-4">
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                 <button onClick={() => setView('lista')} className="text-[10px] font-black uppercase text-zinc-600 hover:text-white flex items-center gap-2 mb-8 transition-all"><ArrowLeft size={14}/> Voltar para Lista</button>
                 <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">{selectedOS?.plate}</h2>
                 <p className="text-zinc-500 font-bold uppercase text-xs mb-8">{selectedOS?.vehicle}</p>
                 <button onClick={() => navigate(`/clients/${selectedOS?.clientId}`)} className="w-full py-4 bg-black border border-zinc-800 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:border-red-600 transition-all"><Users size={16}/> Abrir Cadastro</button>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-4 shadow-xl">
                 <p className="text-[10px] font-black uppercase text-zinc-600 ml-1">Mudar Situação</p>
                 <div className="grid grid-cols-1 gap-2">
                    {['Orçamento', 'Execução', 'Pronto', 'Entregue'].map(st => (
                      <button key={st} onClick={() => handleStatusChange(st as any)} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase border transition-all ${selectedOS?.status === st ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-zinc-800 text-zinc-600'}`}>{st}</button>
                    ))}
                 </div>
              </div>
           </div>
           <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-[4rem] p-12 min-h-[600px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5"><Wrench size={120}/></div>
              <h3 className="text-2xl font-black uppercase mb-10 border-b border-zinc-800 pb-8 flex items-center gap-4"><FileText className="text-red-600" /> Relato do Problema</h3>
              <p className="text-xl font-medium text-zinc-300 italic leading-relaxed">"{selectedOS?.description}"</p>
              <div className="mt-20 py-20 border-2 border-dashed border-zinc-800 rounded-[3rem] text-center opacity-20">
                 <p className="text-sm font-black uppercase tracking-[0.4em]">Módulo de Lançamento de Itens em Breve</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;
