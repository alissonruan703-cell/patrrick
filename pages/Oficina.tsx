
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, X, Trash2, Calendar, ArrowLeft, Zap, User, Car, Phone, Hash, ClipboardList, Package, Wrench, DollarSign, Share2, Check, AlertCircle, Clock, Bell, ChevronRight, CheckCircle2, Image as ImageIcon, Camera, AlertTriangle, UserPlus, FileText } from 'lucide-react';
import { ServiceOrder, ServiceItem, UserProfile, LogEntry, SystemConfig } from '../types';

type OficinaTab = 'ativos' | 'historico' | 'nova';

const Oficina: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<OficinaTab>('ativos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [config, setConfig] = useState<SystemConfig>({ companyName: 'CRMPLUS', companyLogo: '' });
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [osToDelete, setOsToDelete] = useState<string | null>(null);
  const [newOS, setNewOS] = useState<Partial<ServiceOrder>>({ clientName: '', phone: '', vehicle: '', plate: '', description: '', items: [], status: 'Aberto' });
  const [newItem, setNewItem] = useState<Partial<ServiceItem>>({ type: 'PEÇA', description: '', brand: '', quantity: 1, price: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasPermission = (permission: string) => activeProfile?.actions?.includes(permission) || false;
  const getStatusColorClasses = (status: string) => {
    switch (status) {
      case 'Orçamento': return 'bg-yellow-500/5 border-yellow-500/20 text-yellow-200/70';
      case 'Execução': return 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200/70';
      case 'Reprovado': return 'bg-red-500/5 border-red-500/20 text-red-200/70';
      case 'Pronto': return 'bg-cyan-500/5 border-cyan-500/20 text-cyan-200/70';
      case 'Entregue': return 'bg-blue-500/5 border-blue-500/20 text-blue-200/70';
      default: return 'bg-white/[0.02] border-white/10 text-slate-300';
    }
  };

  const loadData = () => {
    const savedOrders = localStorage.getItem('crmplus_oficina_orders');
    const parsedOrders = savedOrders ? JSON.parse(savedOrders) : [];
    setOrders(parsedOrders);
    const savedConfig = localStorage.getItem('crmplus_system_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    const savedProfile = sessionStorage.getItem('crmplus_active_profile');
    if (savedProfile) setActiveProfile(JSON.parse(savedProfile));
    const osIdFromUrl = searchParams.get('id');
    if (osIdFromUrl) { const found = parsedOrders.find((o: any) => String(o.id) === String(osIdFromUrl)); if (found) { setSelectedOS(found); setView('detalhes'); setSearchParams({}, { replace: true }); } }
  };

  useEffect(() => { loadData(); window.addEventListener('storage', loadData); return () => window.removeEventListener('storage', loadData); }, [searchParams]);

  const saveOrders = (updated: ServiceOrder[]) => { setOrders(updated); localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updated)); window.dispatchEvent(new Event('storage')); };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('create_os')) { setFormError("Sem permissão."); return; }
    if (!newOS.clientName || !newOS.vehicle || !newOS.plate) { setFormError("Campos obrigatórios."); return; }
    const os: ServiceOrder = { ...newOS as ServiceOrder, id: Date.now().toString(), createdAt: new Date().toLocaleDateString('pt-BR'), items: [], photos: [], total: 0, status: 'Aberto' };
    saveOrders([os, ...orders]);
    setNewOS({ clientName: '', phone: '', vehicle: '', plate: '', description: '', items: [], status: 'Aberto' });
    setActiveTab('ativos'); setView('lista');
  };

  const handleUpdateStatus = (id: string, newStatus: ServiceOrder['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    saveOrders(updated);
    if (selectedOS?.id === id) setSelectedOS({ ...selectedOS, status: newStatus });
  };

  const handleAddItem = () => {
    if (!selectedOS) return;
    const item: ServiceItem = { ...newItem as ServiceItem, id: Date.now().toString(), timestamp: new Date().toISOString() };
    const updatedItems = [...(selectedOS.items || []), item];
    const updatedOS = { ...selectedOS, items: updatedItems, total: updatedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) };
    saveOrders(orders.map(o => o.id === selectedOS.id ? updatedOS : o));
    setSelectedOS(updatedOS);
  };

  const copyLink = (os: ServiceOrder) => {
    const payload = { i: os.id, n: os.clientName, v: os.vehicle, p: os.plate, d: os.description, t: os.total, dt: os.createdAt, cn: config.companyName, ph: os.photos || [], it: (os.items || []).map(i => ({ t: i.type[0], d: i.description, q: i.quantity, p: i.price })) };
    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#/v/${base64}`);
    setCopyFeedback(true); setTimeout(() => setCopyFeedback(false), 2000);
  };

  const filteredOrders = useMemo(() => orders.filter(o => {
    const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.plate.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter !== 'Todos' && o.status !== statusFilter) return false;
    if (activeTab === 'ativos' && (o.status === 'Entregue' || o.status === 'Reprovado')) return false;
    if (activeTab === 'historico' && (o.status !== 'Entregue' && o.status !== 'Reprovado')) return false;
    return matchesSearch;
  }), [orders, searchTerm, activeTab, statusFilter]);

  return (
    <div className="pt-24 px-6 lg:px-12 max-w-screen-2xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-8 bg-white/[0.02] p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-5">
             <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30 text-cyan-400"><Wrench size={24} /></div>
             <div><h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-1">{config.companyName}</h2><h1 className="text-3xl font-black text-white uppercase tracking-tighter">OFICINA <span className="text-cyan-400">PRO+</span></h1></div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => { setActiveTab('ativos'); setView('lista'); setSelectedOS(null); }} className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] ${activeTab === 'ativos' && !selectedOS ? 'bg-cyan-500 text-black' : 'text-slate-300 hover:bg-white/10'}`}>Operacional</button>
             <button onClick={() => { setActiveTab('historico'); setView('lista'); setSelectedOS(null); }} className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] ${activeTab === 'historico' ? 'bg-cyan-500 text-black' : 'text-slate-300 hover:bg-white/10'}`}>Histórico</button>
          </div>
        </div>
        <button onClick={() => { setView('lista'); setActiveTab('nova'); setSelectedOS(null); }} className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase shadow-xl flex items-center gap-3"><Plus size={18} strokeWidth={4} /> Nova O.S.</button>
      </div>

      {activeTab === 'nova' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
          <button onClick={() => setActiveTab('ativos')} className="flex items-center gap-3 text-slate-500 hover:text-white text-[11px] font-black uppercase"><ArrowLeft size={18} /> Cancelar</button>
          <form onSubmit={handleCreateOS} className="bg-white/[0.02] border border-white/10 p-10 rounded-[3.5rem] space-y-10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input required value={newOS.clientName} onChange={e => setNewOS({...newOS, clientName: e.target.value})} placeholder="Nome do Cliente" className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none" />
              <input required value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})} placeholder="Veículo" className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none" />
              <input required value={newOS.plate} onChange={e => setNewOS({...newOS, plate: e.target.value})} placeholder="Placa" className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none" />
              <input value={newOS.phone} onChange={e => setNewOS({...newOS, phone: e.target.value})} placeholder="Telefone" className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none" />
            </div>
            <button type="submit" className="w-full py-6 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-black rounded-[2rem] uppercase shadow-xl">Gerar O.S.</button>
          </form>
        </div>
      )}

      {view === 'lista' && activeTab !== 'nova' && !selectedOS && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredOrders.map(o => (
            <div key={o.id} onClick={() => { setSelectedOS(o); setView('detalhes'); }} className={`p-8 rounded-[2.5rem] border flex flex-col justify-between min-h-[250px] shadow-xl hover:border-cyan-500/40 cursor-pointer relative group/card transition-all duration-500 ${getStatusColorClasses(o.status)}`}>
              <div className="space-y-6">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black font-mono">#{o.id.slice(-4)}</span><span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase bg-black/20">{o.status}</span></div>
                <h3 className="text-xl font-black uppercase truncate">{o.clientName}</h3>
                <p className="text-[11px] font-bold uppercase">{o.vehicle} | {o.plate}</p>
              </div>
              <div className="pt-6 border-t border-white/10 flex items-center justify-between font-black"><span>R$ {o.total.toFixed(2)}</span></div>
            </div>
          ))}
        </div>
      )}

      {view === 'detalhes' && selectedOS && (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in">
          <div className="flex justify-between items-center">
             <button onClick={() => { setView('lista'); setSelectedOS(null); }} className="flex items-center gap-3 text-slate-500 hover:text-white text-[11px] font-black uppercase"><ArrowLeft size={18} /> Voltar</button>
             <button onClick={() => copyLink(selectedOS)} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:text-cyan-400 transition-all shadow-xl">{copyFeedback ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18}/>} Link Cliente</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-8">
              <div className={`border p-10 rounded-[3.5rem] space-y-8 shadow-2xl transition-all duration-500 ${getStatusColorClasses(selectedOS.status)}`}>
                 <div className="flex justify-between items-start"><h2 className="text-4xl font-black uppercase">#{selectedOS.id.slice(-4)}</h2><span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase bg-black/20">{selectedOS.status}</span></div>
                 <div className="space-y-4"><div><p className="text-[10px] font-black opacity-50 uppercase">Cliente</p><p className="text-xl font-black">{selectedOS.clientName}</p></div><div><p className="text-[10px] font-black opacity-50 uppercase">Veículo</p><p className="text-xl font-black uppercase">{selectedOS.vehicle}</p></div></div>
              </div>
              <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3.5rem] space-y-6">
                 <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Mudar Status</h4>
                 <div className="grid grid-cols-2 gap-3">
                   {['Aberto', 'Orçamento', 'Execução', 'Pronto', 'Entregue', 'Reprovado'].map(st => (
                     <button key={st} onClick={() => handleUpdateStatus(selectedOS.id, st as any)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${selectedOS.status === st ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg' : 'bg-black/40 border-white/5 text-slate-500'}`}>{st}</button>
                   ))}
                 </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3.5rem] space-y-12 shadow-2xl">
                <div className="flex justify-between items-center"><h3 className="text-3xl font-black text-white uppercase">Orçamento</h3><div className="text-right bg-black/40 px-8 py-5 rounded-[2rem] border border-white/5"><p className="text-5xl font-black text-white">R$ {selectedOS.total.toFixed(2)}</p></div></div>
                <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Descrição" className="md:col-span-2 w-full bg-black border border-white/10 p-3 rounded-xl text-white font-bold text-xs" />
                    <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} placeholder="Preço" className="w-full bg-black border border-white/10 p-3 rounded-xl text-white font-bold text-xs" />
                    <button onClick={handleAddItem} className="w-full py-3 bg-cyan-500 text-black font-black rounded-xl uppercase text-[10px]">Lançar</button>
                  </div>
                </div>
                <div className="overflow-hidden border border-white/5 rounded-3xl">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[9px] font-black text-slate-500 uppercase"><tr><th className="px-8 py-5">Descrição</th><th className="px-8 py-5 text-right">Subtotal</th></tr></thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedOS.items.map(item => (<tr key={item.id} className="hover:bg-white/[0.02] text-sm font-bold text-white"><td className="px-8 py-5">{item.description}</td><td className="px-8 py-5 text-right">R$ {(item.price * item.quantity).toFixed(2)}</td></tr>))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;
