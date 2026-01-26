
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Search, X, Send, Trash2,
  ImagePlus, Trash, Filter, Calendar, FileText, ArrowLeft, ChevronDown, Zap
} from 'lucide-react';
import { ServiceOrder, ServiceItem, SystemConfig, UserProfile, LogEntry } from '../types';

type OficinaTab = 'ativos' | 'historico' | 'nova';

const Oficina: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OficinaTab>('ativos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [view, setView] = useState<'lista' | 'detalhes'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  const addLog = (action: string, details: string) => {
    if (!activeProfile) return;
    const logs = JSON.parse(localStorage.getItem('crmplus_logs') || '[]');
    const newLog: LogEntry = { id: Date.now().toString(), timestamp: new Date().toLocaleString(), userId: activeProfile.id, userName: activeProfile.name, action, details, system: 'OFICINA' };
    localStorage.setItem('crmplus_logs', JSON.stringify([newLog, ...logs].slice(0, 1000)));
  };

  const loadData = () => {
    const savedOrders = localStorage.getItem('crmplus_oficina_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    const savedProfile = sessionStorage.getItem('crmplus_active_profile');
    if (savedProfile) setActiveProfile(JSON.parse(savedProfile));
  };

  useEffect(() => { loadData(); }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.plate.toLowerCase().includes(searchTerm.toLowerCase());
      const isHistory = o.status === 'Entregue' || o.status === 'Reprovado';
      if (statusFilter !== 'Todos' && o.status !== statusFilter) return false;
      if (activeTab === 'ativos') { if (isHistory) return false; } else { if (!isHistory) return false; }
      return matchesSearch;
    });
  }, [orders, searchTerm, activeTab, statusFilter]);

  const getStatusClasses = (status: ServiceOrder['status']) => {
    switch(status) {
      case 'Orçamento': return 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 'Execução': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]';
      case 'Pronto': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'Reprovado': return 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'Entregue': return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      default: return 'bg-violet-500/20 text-violet-400 border-violet-500/40';
    }
  };

  return (
    <div className="pt-24 px-6 lg:px-12 max-w-screen-2xl mx-auto space-y-10 animate-in fade-in duration-700 text-[13px] pb-10 bg-[#050505] min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-8 bg-white/[0.02] backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full"></div>
        <div className="space-y-6 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">OFICINA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">PRO+</span></h1>
          <div className="flex items-center gap-3 py-1">
             <button onClick={() => { setActiveTab('ativos'); setView('lista'); }} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all text-[10px] ${activeTab === 'ativos' ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(0,240,255,0.4)]' : 'text-slate-300 hover:bg-white/10'}`}>Operacional</button>
             <button onClick={() => { setActiveTab('historico'); setView('lista'); }} className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all text-[10px] ${activeTab === 'historico' ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(0,240,255,0.4)]' : 'text-slate-300 hover:bg-white/10'}`}>Histórico</button>
          </div>
        </div>
        <button onClick={() => setActiveTab('nova')} className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:brightness-125 hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(0,240,255,0.25)] relative z-10"><Plus size={18} strokeWidth={4} /> Nova O.S.</button>
      </div>

      <div className="relative z-10 group max-w-xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors" size={20} />
        <input 
          placeholder="Pesquisar por cliente ou placa..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-md transition-all"
        />
      </div>

      {view === 'lista' && activeTab !== 'nova' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
          {filteredOrders.map(o => (
            <div key={o.id} className="p-8 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-md transition-all flex flex-col justify-between min-h-[260px] shadow-xl hover:border-cyan-500/40 group hover:shadow-[0_0_40px_rgba(0,240,255,0.1)]">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-cyan-400 font-mono bg-cyan-400/10 px-3 py-1.5 rounded-xl border border-cyan-400/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]">#{o.id}</span>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusClasses(o.status)}`}>{o.status}</div>
                </div>
                <div onClick={() => { setSelectedOS(o); setView('detalhes'); }} className="cursor-pointer space-y-3">
                  <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight truncate">{o.clientName}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">{o.vehicle}</span>
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                    <span className="text-[11px] font-black text-cyan-400 font-mono tracking-widest neon-text-cyan">{o.plate}</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Calendar size={12} className="text-cyan-400" /> {o.createdAt}</span>
                <span className="text-white font-black text-base shadow-[0_0_15px_rgba(255,255,255,0.1)]">R$ {o.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="col-span-full py-32 text-center space-y-4 opacity-40">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto"><Search size={32} className="text-slate-300"/></div>
               <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-[10px]">Nenhuma O.S. encontrada</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Oficina;
