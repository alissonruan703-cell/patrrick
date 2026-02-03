
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, X, Trash2, Calendar, ArrowLeft, Zap, User, Car, 
  Package, Wrench, Share2, Check, AlertCircle, Clock, ChevronRight, 
  CheckCircle2, AlertTriangle, UserPlus, FileText, Save, Loader2, Users
} from 'lucide-react';
import { ServiceOrder, ServiceItem, UserProfile, Client, Notification } from '../types';

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

  // Pattern: Centralized History/Notification Triggers
  const registerModuleEvent = (action: string, details: string, clientId?: string, link?: string) => {
    const history = JSON.parse(localStorage.getItem('crmplus_history') || '[]');
    const notifications = JSON.parse(localStorage.getItem('crmplus_notifications') || '[]');
    
    const timestamp = new Date().toISOString();
    const eventId = Date.now().toString();

    // 1. Audit Log/History
    const newEvent = { id: eventId, timestamp, profileId: activeProfile?.id, profileName: activeProfile?.name, moduleId: 'oficina', action, details, clientId, link };
    localStorage.setItem('crmplus_history', JSON.stringify([newEvent, ...history]));

    // 2. Automated Notification
    const newNotif: Notification = { id: `notif-${eventId}`, profileId: 'admin', title: action.replace('_', ' '), message: details, type: 'info', read: false, timestamp, link, moduleId: 'oficina' };
    localStorage.setItem('crmplus_notifications', JSON.stringify([newNotif, ...notifications]));

    window.dispatchEvent(new Event('storage'));
  };

  const handleSaveOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOS.clientId || !newOS.vehicle || !newOS.plate) return;
    
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000)); // Simulate processing
    
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
    
    registerModuleEvent('NOVA_ENTRADA', `Veículo ${os.plate} registrado para ${os.clientName}.`, os.clientId, `/module/oficina?id=${os.id}`);
    
    setIsSaving(false);
    setShowToast(true);
    setTimeout(() => { setShowToast(false); setSelectedOS(os); setView('detalhes'); }, 1500);
  };

  const handleStatusChange = (newStatus: ServiceOrder['status']) => {
    if (!selectedOS) return;
    const updated = orders.map(o => o.id === selectedOS.id ? { ...o, status: newStatus } : o);
    localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updated));
    setOrders(updated);
    setSelectedOS({ ...selectedOS, status: newStatus });
    
    registerModuleEvent('MUDANÇA_STATUS', `O.S. ${selectedOS.id} agora em ${newStatus}.`, selectedOS.clientId, `/module/oficina?id=${selectedOS.id}`);
  };

  const filtered = orders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[100] bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-4 shadow-2xl animate-in slide-in-from-right-10">
          <CheckCircle2 size={20} /> Salvo com sucesso!
        </div>
      )}

      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-600/10 rounded-3xl text-red-600"><Wrench size={32} /></div>
          <div><h1 className="text-3xl font-black uppercase tracking-tighter">Oficina</h1><p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Gestão de Mecânica</p></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setView('lista'); setActiveTab('ativos'); }} className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-all ${activeTab === 'ativos' && view === 'lista' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500'}`}>Lista</button>
          <button onClick={() => setActiveTab('nova')} className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-all ${activeTab === 'nova' ? 'bg-white text-black' : 'bg-red-600 text-white shadow-lg'}`}>Novo +</button>
        </div>
      </div>

      {activeTab === 'nova' ? (
        <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
          <h2 className="text-2xl font-black uppercase mb-8">Nova O.S.</h2>
          <form onSubmit={handleSaveOS} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-600 mb-2 ml-1">Cliente</label>
              <select 
                required 
                value={newOS.clientId}
                onChange={e => {
                  const c = clients.find(cl => cl.id === e.target.value);
                  setNewOS({...newOS, clientId: e.target.value, clientName: c?.name || ''});
                }}
                className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600 outline-none"
              >
                <option value="">Escolher Cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Veículo" value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold focus:border-red-600" />
              <input required placeholder="Placa" value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-black tracking-widest uppercase focus:border-red-600" />
            </div>
            <textarea required rows={4} placeholder="Problema Relatado" value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-medium focus:border-red-600 resize-none" />
            <button 
              disabled={isSaving}
              type="submit" 
              className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isSaving ? 'Registrando...' : 'Abrir Protocolo'}
            </button>
          </form>
        </div>
      ) : view === 'lista' ? (
        <div className="space-y-8">
          <div className="relative group max-w-xl"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} /><input placeholder="Filtrar placa ou nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold focus:border-red-600 outline-none" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(os => (
              <div key={os.id} onClick={() => { setSelectedOS(os); setView('detalhes'); }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] group hover:border-red-600 transition-all cursor-pointer shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black font-mono text-zinc-600">#{os.id}</span>
                  <span className="bg-zinc-800 px-3 py-1 rounded-lg text-[9px] font-black uppercase">{os.status}</span>
                </div>
                <h3 className="text-xl font-black uppercase mb-2">{os.clientName}</h3>
                <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase text-[10px]"><Car size={14} /> {os.vehicle} | {os.plate}</div>
                <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center"><span className="font-black">R$ {os.total.toFixed(2)}</span><ChevronRight size={18} className="text-zinc-700" /></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] space-y-8">
              <button onClick={() => setView('lista')} className="text-[10px] font-black uppercase text-zinc-500 hover:text-white flex items-center gap-2 mb-4"><ArrowLeft size={14}/> Voltar</button>
              <h2 className="text-3xl font-black uppercase">{selectedOS?.plate}</h2>
              <p className="text-zinc-500 font-bold uppercase text-xs">{selectedOS?.vehicle}</p>
              <button onClick={() => navigate(`/clients/${selectedOS?.clientId}`)} className="w-full py-4 bg-black border border-zinc-800 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:border-red-600 transition-all"><Users size={16}/> Abrir Cliente</button>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] space-y-3">
              <p className="text-[9px] font-black uppercase text-zinc-600 mb-2">Fluxo Operacional</p>
              {['Orçamento', 'Execução', 'Pronto', 'Entregue'].map(st => (
                <button key={st} onClick={() => handleStatusChange(st as any)} className={`w-full py-3 rounded-lg text-[10px] font-black uppercase border transition-all ${selectedOS?.status === st ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-zinc-800 text-zinc-600'}`}>{st}</button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-[4rem] p-12 min-h-[500px]">
             <h3 className="text-2xl font-black uppercase mb-10 border-b border-zinc-800 pb-6 flex items-center gap-4"><FileText className="text-red-600" /> Detalhes</h3>
             <p className="text-lg font-medium text-zinc-300 italic mb-12">"{selectedOS?.description}"</p>
             <div className="p-20 text-center opacity-10"><Wrench size={120} className="mx-auto" /></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;
