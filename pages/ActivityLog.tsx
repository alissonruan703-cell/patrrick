
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

  useEffect(() => {
    const profileRaw = sessionStorage.getItem('crmplus_active_profile');
    const profile = profileRaw ? JSON.parse(profileRaw) : {};
    if (!profile.actions?.includes('view_logs')) { navigate('/'); return; }
    const saved = localStorage.getItem('crmplus_logs');
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || l.action.toLowerCase().includes(searchTerm.toLowerCase()) || l.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSystem = filterSystem === 'TODOS' || l.system === filterSystem;
      let matchesDate = true;
      if (filterDate) {
        const logDateStr = l.timestamp.split(',')[0].trim();
        const filterDateFormatted = filterDate.split('-').reverse().join('/');
        if (logDateStr !== filterDateFormatted) matchesDate = false;
      }
      return matchesSearch && matchesSystem && matchesDate;
    }).sort((a, b) => b.id.localeCompare(a.id));
  }, [logs, searchTerm, filterSystem, filterDate]);

  const systems = ['TODOS', 'AUTENTICACAO', 'OFICINA', 'PERFIS', 'CONFIG', 'ORCAMENTO'];
  const exportCSV = () => {
    const header = "Data/Hora,Usuario,Sistema,Acao,Detalhes\n";
    const body = filteredLogs.map(l => `"${l.timestamp}","${l.userName}","${l.system}","${l.action}","${l.details}"`).join('\n');
    const blob = new Blob(["\ufeff" + header + body], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `auditoria_sistema_${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
  };

  return (
    <div className="pt-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
           <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group">
             <ArrowLeft size={16} className="group-hover:-translate-x-1" /> Painel Principal
           </button>
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">Auditoria <span className="text-violet-500">Master</span> <History className="text-violet-500" size={32} /></h1>
           <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[9px] bg-white/5 px-3 py-1 rounded w-fit">Rastreabilidade Total do Ecossistema</p>
        </div>
        <button onClick={exportCSV} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-emerald-500 transition-all shadow-xl">
          <Download size={18} /> Extrair Relatório CSV
        </button>
      </div>
      <div className="bg-[#1a1d23] p-6 sm:p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
           <div className="flex-1 relative group"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} /><input placeholder="Pesquisar por usuário, ação..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-xs outline-none" /></div>
           <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase ml-1">Sistema</label><select value={filterSystem} onChange={e => setFilterSystem(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-6 text-white text-xs uppercase">{systems.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase ml-1">Data</label><input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-6 text-white text-xs uppercase" /></div>
           </div>
        </div>
        <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-black/20">
           <table className="w-full text-left">
              <thead className="bg-black/40 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                 <tr><th className="px-8 py-6">Data & Hora</th><th className="px-8 py-6">Responsável</th><th className="px-8 py-6">Módulo</th><th className="px-8 py-6">Evento</th><th className="px-8 py-6">Detalhes</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                 {filteredLogs.map(l => (
                   <tr key={l.id} className="hover:bg-white/[0.02] transition-all">
                      <td className="px-8 py-5 text-slate-500 font-mono text-[10px]">{l.timestamp}</td>
                      <td className="px-8 py-5"><div className="flex items-center gap-3"><span className="font-black text-white uppercase">{l.userName}</span></div></td>
                      <td className="px-8 py-5"><span className="bg-white/5 px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-500 uppercase">{l.system}</span></td>
                      <td className="px-8 py-5"><span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${l.action.includes('ERRO') || l.action === 'DELETE' ? 'text-red-500' : 'text-emerald-500'}`}>{l.action}</span></td>
                      <td className="px-8 py-5"><span className="text-slate-400 font-medium">{l.details}</span></td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
