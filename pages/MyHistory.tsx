
import React, { useState, useEffect } from 'react';
import { ArrowLeft, History, Filter, Search, User, ExternalLink, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    <div className="p-8 max-w-4xl mx-auto pb-32">
      <div className="flex items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Histórico</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Auditoria de operações</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-10 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800">
         <div className="flex gap-2 p-1 bg-black rounded-2xl border border-zinc-800">
            <button onClick={() => setActiveHistory('profile')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeHistory === 'profile' ? 'bg-white text-black' : 'text-zinc-500'}`}>Meu Perfil</button>
            <button onClick={() => setActiveHistory('global')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeHistory === 'global' ? 'bg-white text-black' : 'text-zinc-500'}`}>Global</button>
         </div>
         <div className="flex items-center gap-4 ml-auto">
            <Filter size={16} className="text-zinc-700" />
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-zinc-400">
               <option>TODOS</option>
               <option>OFICINA</option>
               <option>ACCOUNT</option>
            </select>
         </div>
      </div>

      <div className="space-y-4">
        {filtered.map((ev: any) => (
          <div key={ev.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-start gap-6 hover:border-zinc-700 transition-all">
            <div className="p-3 bg-black border border-zinc-800 rounded-xl text-red-600"><History size={18} /></div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-black uppercase">{ev.action}</h4>
                <span className="text-[9px] font-bold text-zinc-600 uppercase">{new Date(ev.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mb-4">{ev.details}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="bg-zinc-800 px-3 py-1 rounded-full text-[9px] font-black uppercase text-zinc-400">{ev.moduleId}</span>
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-red-500"><User size={10} /> {ev.profileName}</span>
                </div>
                {ev.link && <button onClick={() => navigate(ev.link)} className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600 hover:underline">Abrir <ExternalLink size={12}/></button>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-24 text-center opacity-10 border-2 border-dashed border-zinc-800 rounded-[3rem]">
            <Clock size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Nenhum evento registrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHistory;
