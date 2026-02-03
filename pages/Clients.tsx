
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Users, Search, Plus, User, Phone, Mail, ChevronRight, ArrowLeft, History, ExternalLink, Wrench, FileText, LayoutGrid, UserCircle
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
    const client: Client = { ...newC, id: `CLI-${Date.now()}`, createdAt: new Date().toISOString(), tags: [], customFields: {} };
    const updated = [client, ...clients];
    localStorage.setItem('crmplus_clients', JSON.stringify(updated));
    setClients(updated);
    setShowAdd(false);
    navigate(`/clients/${client.id}`);
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Clientes</h1>
        <button onClick={() => setShowAdd(true)} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Novo Cliente</button>
      </div>

      <div className="relative group max-w-xl mb-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
        <input placeholder="Pesquisar cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold focus:border-red-600 outline-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} onClick={() => navigate(`/clients/${c.id}`)} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-red-600 transition-all cursor-pointer shadow-xl">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-red-600 mb-6"><User size={32}/></div>
            <h3 className="text-lg font-black uppercase mb-4">{c.name}</h3>
            <p className="text-[10px] font-bold text-zinc-500 uppercase">{c.email}</p>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[3rem] w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-black uppercase mb-8">Novo Cadastro</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input required placeholder="Nome Completo" value={newC.name} onChange={e => setNewC({...newC, name: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold" />
              <input required type="email" placeholder="E-mail" value={newC.email} onChange={e => setNewC({...newC, email: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold" />
              <input required placeholder="Telefone" value={newC.phone} onChange={e => setNewC({...newC, phone: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-bold" />
              <div className="pt-6 flex gap-4"><button type="button" onClick={() => setShowAdd(false)} className="flex-1 font-black uppercase text-xs text-zinc-500">Voltar</button><button type="submit" className="flex-[2] bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Salvar</button></div>
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
    setHistory(allHistory.filter((h: any) => h.clientId === id));

    const allOrders = JSON.parse(localStorage.getItem('crmplus_oficina_orders') || '[]');
    setOrders(allOrders.filter((o: any) => o.clientId === id));
  }, [id]);

  if (!client) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in">
      <button onClick={() => navigate('/clients')} className="flex items-center gap-2 text-zinc-500 hover:text-white font-black uppercase text-[10px] mb-8"><ArrowLeft size={16}/> Voltar</button>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 p-10 rounded-[3.5rem] shadow-2xl space-y-6">
          <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center text-red-600 mb-4 shadow-inner"><UserCircle size={64}/></div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">{client.name}</h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{client.phone} • {client.email}</p>
        </div>
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-[4rem] p-10 shadow-2xl min-h-[500px]">
          <div className="flex gap-4 mb-10 border-b border-zinc-800 pb-8">
            {['timeline', 'oficina', 'orcamentos'].map(t => (
              <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-black text-zinc-500'}`}>{t}</button>
            ))}
          </div>
          {activeTab === 'timeline' ? (
            <div className="space-y-6">
              {history.map(ev => (
                <div key={ev.id} className="relative pl-8 border-l border-zinc-800 pb-6 group">
                  <div className="absolute left-[-6px] top-0 w-3 h-3 bg-red-600 rounded-full"></div>
                  <div className="bg-black/30 p-6 rounded-2xl group-hover:border-red-600 transition-all border border-transparent">
                    <p className="text-xs font-black uppercase text-zinc-600 mb-1">{new Date(ev.timestamp).toLocaleDateString()}</p>
                    <h4 className="text-sm font-black uppercase text-white mb-2">{ev.action}</h4>
                    <p className="text-xs text-zinc-500">{ev.details}</p>
                    {ev.link && <Link to={ev.link} className="mt-4 inline-flex items-center gap-2 text-red-600 text-[10px] font-black uppercase hover:underline">Ver Registro <ExternalLink size={12}/></Link>}
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'oficina' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orders.map(o => (
                <div key={o.id} onClick={() => navigate(`/module/oficina?id=${o.id}`)} className="bg-black/40 border border-zinc-800 p-6 rounded-3xl hover:border-red-600 cursor-pointer transition-all">
                  <p className="text-[9px] font-black text-zinc-700 uppercase mb-2">OS: {o.id}</p>
                  <p className="text-sm font-black text-white uppercase">{o.plate}</p>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase mt-2">{o.status}</p>
                </div>
              ))}
            </div>
          ) : <div className="text-center py-20 opacity-10"><FileText size={64} className="mx-auto" /></div>}
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
