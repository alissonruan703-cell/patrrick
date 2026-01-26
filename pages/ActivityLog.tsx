
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, Download, Filter, Activity, User, ShieldAlert, FileText, ChevronRight, History } from 'lucide-react';
import { LogEntry } from '../types';

const ActivityLog: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSystem, setFilterSystem] = useState('TODOS');
  const [filterDate, setFilterDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const profileRaw = sessionStorage.getItem('crmplus_active_profile');
    const profile = profileRaw ? JSON.parse(profileRaw) : {};
    
    if (!profile.actions?.includes('view_logs')) {
      navigate('/');
      return;
    }

    const saved = localStorage.getItem('crmplus_logs');
    if (saved) {
      setLogs(JSON.parse(saved));
    }
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = 
        l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSystem = filterSystem === 'TODOS' || l.system === filterSystem;
      
      let matchesDate = true;
      if (filterDate) {
        // Assume timestamp format 'DD/MM/YYYY, HH:MM:SS'
        const logDateStr = l.timestamp.split(',')[0].trim(); // 'DD/MM/YYYY'
        const filterDateFormatted = filterDate.split('-').reverse().join('/'); // 'YYYY-MM-DD' -> 'DD/MM/YYYY'
        if (logDateStr !== filterDateFormatted) matchesDate = false;
      }

      return matchesSearch && matchesSystem && matchesDate;
    }).sort((a, b) => {
      // Ordenação decrescente por timestamp (IDs baseados em timestamp funcionam bem aqui)
      return b.id.localeCompare(a.id);
    });
  }, [logs, searchTerm, filterSystem, filterDate]);

  const systems = ['TODOS', 'AUTENTICACAO', 'OFICINA', 'PERFIS', 'CONFIG', 'ORCAMENTO'];

  const exportCSV = () => {
    const header = "Data/Hora,Usuario,Sistema,Acao,Detalhes\n";
    const body = filteredLogs.map(l => 
      `"${l.timestamp}","${l.userName}","${l.system}","${l.action}","${l.details}"`
    ).join('\n');
    
    const blob = new Blob(["\ufeff" + header + body], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `auditoria_sistema_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
           <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group">
             <ArrowLeft size={16} className="group-hover:-translate-x-1" /> Painel Principal
           </button>
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
             Auditoria <span className="text-violet-500">Master</span> <History className="text-violet-500" size={32} />
           </h1>
           <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[9px] bg-white/5 px-3 py-1 rounded w-fit">Rastreabilidade Total do Ecossistema</p>
        </div>
        <button 
          onClick={exportCSV}
          className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
        >
          <Download size={18} /> Extrair Relatório CSV
        </button>
      </div>

      <div className="bg-[#1a1d23] p-6 sm:p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
           <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-500 transition-colors" size={18} />
              <input 
                placeholder="Pesquisar por usuário, ação ou detalhe específico..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-bold text-xs outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Sistema</label>
                 <select 
                    value={filterSystem} 
                    onChange={e => setFilterSystem(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-6 text-white font-bold text-xs uppercase outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer min-w-[150px]"
                 >
                    {systems.map(s => <option key={s} value={s} className="bg-[#1a1d23]">{s}</option>)}
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Data Exata</label>
                 <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input 
                      type="date" 
                      value={filterDate} 
                      onChange={e => setFilterDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-6 text-white font-bold text-xs uppercase outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                 </div>
              </div>
              <div className="flex items-end">
                 <button 
                  onClick={() => { setSearchTerm(''); setFilterSystem('TODOS'); setFilterDate(''); }}
                  className="px-6 py-3.5 bg-white/5 text-slate-500 rounded-xl font-black uppercase text-[9px] tracking-widest border border-white/5 hover:text-white transition-all"
                 >
                   Limpar
                 </button>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-black/20">
           <table className="w-full text-left">
              <thead className="bg-black/40 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                 <tr>
                    <th className="px-8 py-6">Data & Hora</th>
                    <th className="px-8 py-6">Responsável</th>
                    <th className="px-8 py-6">Módulo</th>
                    <th className="px-8 py-6">Evento</th>
                    <th className="px-8 py-6">Detalhes da Operação</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                 {filteredLogs.map(l => (
                   <tr key={l.id} className="hover:bg-white/[0.02] transition-all group">
                      <td className="px-8 py-5 text-slate-500 font-mono text-[10px] whitespace-nowrap">{l.timestamp}</td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform"><User size={16}/></div>
                            <span className="font-black text-white uppercase tracking-tight">{l.userName}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <span className="bg-white/5 px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-white/5">{l.system}</span>
                      </td>
                      <td className="px-8 py-5">
                         <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                           l.action.includes('ERRO') || l.action === 'DELETE' || l.action === 'REPROVADO'
                             ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                             : l.action === 'LOGIN' || l.action === 'APROVADO'
                             ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                             : 'bg-violet-500/10 border-violet-500/20 text-violet-500'
                         }`}>
                           {l.action}
                         </span>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400 font-medium line-clamp-1">{l.details}</span>
                            <ChevronRight size={14} className="text-slate-800 group-hover:text-violet-500 transition-colors" />
                         </div>
                      </td>
                   </tr>
                 ))}
                 {filteredLogs.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center gap-6 opacity-30">
                           <ShieldAlert size={64} />
                           <p className="text-sm font-black uppercase tracking-[0.4em]">Nenhum registro de atividade encontrado</p>
                        </div>
                     </td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
        
        <div className="pt-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
           <span>Mostrando {filteredLogs.length} de {logs.length} entradas</span>
           <span className="flex items-center gap-2">Monitoramento Ativo <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/></span>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
