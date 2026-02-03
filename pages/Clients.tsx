
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Users, Search, Plus, User, Phone, Mail, ChevronRight, ArrowLeft, History, ExternalLink, Wrench, FileText, LayoutGrid, UserCircle, Clock
} from 'lucide-react';
import { Client, HistoryEvent, ServiceOrder } from '../types';

const ClientsList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newC, setNewC] = useState({ name: '', email: '', phone: '', document: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('crmplus_clients') || '[]');
    setClients(saved);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const client: Client = { 
      ...newC, 
      id: `CLI-${Date.now()}`, 
      createdAt: new Date().toISOString(), 
      tags: [], 
      customFields: {} 
    };
    const updated = [client, ...clients];
    localStorage.setItem('crmplus_clients', JSON.stringify(updated));
    setClients(updated);
    setShowAdd(false);
    navigate(`/clients/${client.id}`);
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
           <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-3xl text-white shadow-2xl"><Users size={32}/></div>
           <h1 className="text-3xl font-black uppercase tracking-tighter">Clientes <span className="text-red-600">Unificados</span></h1>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all">Novo Cliente +</button>
      </div>

      <div className="relative group max-w-xl mb-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
        <input placeholder="Pesquisar por nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold focus:border-red-600 outline-none transition-all" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} onClick={() => navigate(`/clients/${c.id}`)} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-red-600 group transition-all cursor-pointer shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5"><User size={64}/></div>
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform"><User size={32}/></div>
            <h3 className="text-xl font-black uppercase mb-4 tracking-tight group-hover:text-red-500">{c.name}</h3>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{c.email}</p>
            <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center"><span className="text-[10px] font-black text-zinc-500">{c.phone}</span><ChevronRight size={18} className="text-zinc-700"/></div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[3.5rem] w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-black uppercase mb-8 border-b border-zinc-800 pb-6">Novo Cadastro</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input required placeholder="Nome Completo" value={newC.name} onChange={e => setNewC({...newC, name: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
              <input required type="email" placeholder="E-mail de Contato" value={newC.email} onChange={e => setNewC({...newC, email: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
              <input required placeholder="WhatsApp" value={newC.phone} onChange={e => setNewC({...newC, phone: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-red-600 outline-none" />
              <div className="pt-6 flex gap-4">
                 <button type="button" onClick={() => setShowAdd(false)} className="flex-1 font-black uppercase text-xs text-zinc-600 hover:text-white transition-colors">Voltar</button>
                 <button type="submit" className="flex-[2] bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all">Salvar Cadastro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'oficina' | 'orcamentos'>('timeline');
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  useEffect(() => {
    const clients = JSON.parse(localStorage.getItem('crmplus_clients') || '[]');
    const found = clients.find((c: any) => c.id === id);
    setClient(found);
    
    const allHistory = JSON.parse(localStorage.getItem('crmplus_history') || '[]');
    setHistory(allHistory.filter((h: any) => h.clientId === id).sort((a,b) => b.timestamp.localeCompare(a.timestamp)));

    const allOrders = JSON.parse(localStorage.getItem('crmplus_oficina_orders') || '[]');
    setOrders(allOrders.filter((o: any) => o.clientId === id));
  }, [id]);

  if (!client) return (
    <div className="p-32 text-center opacity-10 space-y-4">
       <Users size={64} className="mx-auto" />
       <p className="font-black uppercase tracking-[0.4em]">Registro não encontrado</p>
       <button onClick={() => navigate('/clients')} className="underline">Voltar para Clientes</button>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-top-2 duration-500 pb-32">
      <button onClick={() => navigate('/clients')} className="flex items-center gap-2 text-zinc-500 hover:text-white font-black uppercase text-[10px] tracking-widest mb-10 transition-all"><ArrowLeft size={16}/> Base de Clientes</button>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 p-10 rounded-[3.5rem] shadow-2xl space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><UserCircle size={120}/></div>
          <div className="relative z-10">
             <div className="w-24 h-24 bg-black rounded-[2.5rem] flex items-center justify-center text-red-600 mb-8 shadow-inner"><UserCircle size={64}/></div>
             <h1 className="text-4xl font-black uppercase tracking-tighter leading-tight">{client.name}</h1>
             <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-4">WhatsApp</p>
             <p className="text-lg font-black text-white">{client.phone}</p>
             <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-6">E-mail</p>
             <p className="text-lg font-black text-white truncate">{client.email}</p>
          </div>
          <div className="pt-8 border-t border-zinc-800 space-y-4">
             <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Informações de Registro</p>
             <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-zinc-500 uppercase">ID Interno</span><span className="text-[10px] font-black text-white">{client.id}</span></div>
             <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-zinc-500 uppercase">Desde</span><span className="text-[10px] font-black text-white">{new Date(client.createdAt).toLocaleDateString()}</span></div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-[4rem] p-12 shadow-2xl min-h-[700px] flex flex-col">
          <div className="flex flex-wrap gap-3 mb-12 border-b border-zinc-800 pb-8">
            {[
              { id: 'timeline', icon: <History size={16}/>, label: 'Linha do Tempo' },
              { id: 'oficina', icon: <Wrench size={16}/>, label: 'Oficina' },
              { id: 'orcamentos', icon: <FileText size={16}/>, label: 'Orçamentos' }
            ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id as any)} 
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === t.id ? 'bg-red-600 text-white shadow-xl' : 'bg-black text-zinc-500 hover:text-white border border-zinc-800'}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1">
            {activeTab === 'timeline' ? (
              <div className="space-y-8">
                {history.length > 0 ? history.map(ev => (
                  <div key={ev.id} className="relative pl-10 border-l-2 border-zinc-800 pb-10 group last:pb-0">
                    <div className="absolute left-[-11px] top-0 w-5 h-5 bg-zinc-900 border-4 border-red-600 rounded-full transition-transform group-hover:scale-125 shadow-xl"></div>
                    <div className="bg-black/30 p-8 rounded-[2.5rem] group-hover:border-red-600/30 transition-all border border-transparent shadow-inner">
                      <div className="flex justify-between items-start mb-4">
                         <span className="text-[10px] font-black uppercase text-zinc-700 tracking-widest flex items-center gap-2"><Clock size={12}/> {new Date(ev.timestamp).toLocaleString()}</span>
                         <span className="bg-zinc-900 px-3 py-1 rounded-lg text-[9px] font-black uppercase text-zinc-500 border border-zinc-800">{ev.moduleId}</span>
                      </div>
                      <h4 className="text-lg font-black uppercase text-white mb-2 tracking-tight">{ev.action}</h4>
                      <p className="text-sm text-zinc-500 font-medium leading-relaxed">{ev.details}</p>
                      {ev.link && (
                        <Link to={ev.link} className="mt-8 inline-flex items-center gap-3 bg-white/[0.03] px-6 py-3 rounded-xl text-red-600 text-[10px] font-black uppercase hover:bg-white/[0.06] transition-all border border-zinc-800 group/btn">
                          Abrir Registro <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="py-32 text-center opacity-10 space-y-6">
                     <History size={64} className="mx-auto" />
                     <p className="text-sm font-black uppercase tracking-[0.4em]">Nenhuma atividade para exibir</p>
                  </div>
                )}
              </div>
            ) : activeTab === 'oficina' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {orders.length > 0 ? orders.map(o => (
                  <div key={o.id} onClick={() => navigate(`/module/oficina?id=${o.id}`)} className="bg-black/40 border border-zinc-800 p-8 rounded-[3rem] hover:border-red-600 cursor-pointer transition-all shadow-xl group">
                    <div className="flex justify-between items-start mb-6">
                       <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">O.S. #{o.id}</span>
                       <span className="bg-zinc-900 px-2 py-1 rounded text-[8px] font-black uppercase text-zinc-500">{o.status}</span>
                    </div>
                    <p className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{o.plate}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{o.vehicle}</p>
                    <div className="mt-8 flex justify-between items-center"><span className="text-lg font-black text-red-500">R$ {o.total.toFixed(2)}</span><ChevronRight size={18} className="text-zinc-800 group-hover:text-red-600"/></div>
                  </div>
                )) : (
                  <div className="col-span-full py-32 text-center opacity-10 space-y-6">
                     <Wrench size={64} className="mx-auto" />
                     <p className="text-sm font-black uppercase tracking-[0.4em]">Nenhuma O.S. encontrada</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-32 text-center opacity-10 space-y-6">
                 <FileText size={64} className="mx-auto" />
                 <p className="text-sm font-black uppercase tracking-[0.4em]">Aguardando dados de Orçamentos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Clients = () => (
  <Routes>
    <Route path="/" element={<ClientsList />} />
    <Route path="/:id" element={<ClientDetails />} />
  </Routes>
);

export default Clients;
