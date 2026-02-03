
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History, Filter, Search, User, ExternalLink, Clock, Calendar } from 'lucide-react';
import { HistoryEvent } from '../types';

const MyHistory: React.FC<{ profile: any }> = ({ profile }) => {
  const navigate = useNavigate();
  const [activeHistory, setActiveHistory] = useState<'profile' | 'global'>('profile');
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [moduleFilter, setModuleFilter] = useState('TODOS');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('crmplus_history') || '[]');
    setEvents(saved);
  }, []);

  const filtered = events.filter(ev => {
    const isModuleMatch = moduleFilter === 'TODOS' || ev.moduleId.toUpperCase() === moduleFilter;
    const isProfileMatch = activeHistory === 'profile' ? ev.profileId === profile.id : true;
    return isModuleMatch && isProfileMatch;
  }).sort((a,b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-white/[0.02] p-8 rounded-[3rem] border border-zinc-800">
        <div className="flex items-center gap-4">
           <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-3xl text-red-600 shadow-xl"><History size={32}/></div>
           <div><h1 className="text-3xl font-black uppercase tracking-tighter">Histórico de <span className="text-red-600">Ações</span></h1><p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Auditoria Completa</p></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-10 bg-zinc-900/30 p-4 rounded-[2rem] border border-zinc-800 backdrop-blur-md">
         <div className="flex gap-2 p-1 bg-black rounded-2xl border border-zinc-800">
            <button onClick={() => setActiveHistory('profile')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeHistory === 'profile' ? 'bg-white text-black shadow-lg' : 'text-zinc-600 hover:text-white'}`}>Meu Perfil</button>
            <button onClick={() => setActiveHistory('global')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeHistory === 'global' ? 'bg-white text-black shadow-lg' : 'text-zinc-600 hover:text-white'}`}>Empresa</button>
         </div>
         <div className="flex items-center gap-4 ml-auto">
            <Filter size={16} className="text-zinc-700" />
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="bg-black border border-zinc-800 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 focus:border-red-600 appearance-none cursor-pointer min-w-[140px]">
               <option>TODOS</option>
               <option>OFICINA</option>
               <option>ACCOUNT</option>
            </select>
         </div>
      </div>

      <div className="space-y-4">
        {filtered.map((ev) => (
          <div key={ev.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] flex items-start gap-8 hover:border-red-600/30 transition-all shadow-xl group">
            <div className="p-4 bg-black border border-zinc-800 rounded-2xl text-red-600 group-hover:scale-110 transition-transform"><Clock size={20} /></div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-black uppercase text-white tracking-tight">{ev.action}</h4>
                <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> {new Date(ev.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-6">{ev.details}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <span className="bg-zinc-800 px-3 py-1 rounded-lg text-[9px] font-black uppercase text-zinc-500 border border-zinc-800">{ev.moduleId}</span>
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase text-red-500"><User size={12} /> {ev.profileName}</span>
                </div>
                {ev.link && <button onClick={() => navigate(ev.link!)} className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600 hover:underline">Abrir Registro <ExternalLink size={14}/></button>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-32 text-center opacity-10 border-2 border-dashed border-zinc-800 rounded-[4rem]">
            <History size={64} className="mx-auto mb-6" />
            <p className="text-sm font-black uppercase tracking-[0.4em]">Nenhum registro encontrado para o filtro atual</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHistory;
