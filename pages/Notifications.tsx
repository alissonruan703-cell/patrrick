
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Clock, AlertCircle, CheckCircle2, ArrowLeft, Trash2, Check, Filter, ShieldAlert, Zap
} from 'lucide-react';
import { Notification, UserProfile } from '../types';

const NotificationsPage: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('TODOS');

  const loadNotifs = () => {
    const all = JSON.parse(localStorage.getItem('crmplus_notifications') || '[]');
    setNotifications(all.filter((n: any) => n.profileId === profile.id || n.profileId === 'admin'));
  };

  useEffect(() => {
    loadNotifs();
    window.addEventListener('storage', loadNotifs);
    return () => window.removeEventListener('storage', loadNotifs);
  }, [profile.id]);

  const markRead = (id: string) => {
    const all = JSON.parse(localStorage.getItem('crmplus_notifications') || '[]');
    const updated = all.map((n: any) => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('crmplus_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const deleteNotif = (id: string) => {
    const all = JSON.parse(localStorage.getItem('crmplus_notifications') || '[]');
    const updated = all.filter((n: any) => n.id !== id);
    localStorage.setItem('crmplus_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const markAllRead = () => {
    const all = JSON.parse(localStorage.getItem('crmplus_notifications') || '[]');
    const updated = all.map((n: any) => 
      (n.profileId === profile.id || n.profileId === 'admin') ? { ...n, read: true } : n
    );
    localStorage.setItem('crmplus_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (moduleFilter !== 'TODOS' && n.moduleId !== moduleFilter.toLowerCase()) return false;
    return true;
  }).sort((a,b) => b.timestamp.localeCompare(a.timestamp));

  const getIcon = (type: string) => {
    switch(type) {
      case 'urgent': return <ShieldAlert className="text-red-600" />;
      case 'success': return <CheckCircle2 className="text-emerald-500" />;
      case 'warning': return <AlertCircle className="text-amber-500" />;
      default: return <Bell className="text-zinc-500" />;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate(-1)} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 hover:text-white transition-all shadow-xl"><ArrowLeft size={20} /></button>
           <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Central de <span className="text-red-600">Avisos</span></h1>
              <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">{profile.name} • {notifications.filter(n => !n.read).length} pendentes</p>
           </div>
        </div>
        <button onClick={markAllRead} className="px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-red-600 transition-all flex items-center gap-3 shadow-xl"><Check size={18} /> Marcar como Lido</button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-10 bg-zinc-900/30 p-4 rounded-[2rem] border border-zinc-800 backdrop-blur-md">
         <div className="flex gap-2 p-1 bg-black rounded-[1.5rem] border border-zinc-800">
            <button onClick={() => setFilter('all')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-red-600 text-white' : 'text-zinc-600 hover:text-white'}`}>Todas</button>
            <button onClick={() => setFilter('unread')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-red-600 text-white' : 'text-zinc-600 hover:text-white'}`}>Não Lidas</button>
         </div>
         <div className="flex items-center gap-4 ml-auto">
            <Filter size={16} className="text-zinc-700" />
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="bg-black border border-zinc-800 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest outline-none text-zinc-500 focus:border-red-600 transition-all appearance-none cursor-pointer min-w-[140px]">
               <option>TODOS</option>
               <option>OFICINA</option>
               <option>CONTA</option>
            </select>
         </div>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map(n => (
          <div key={n.id} onClick={() => { if(!n.read) markRead(n.id); if(n.link) navigate(n.link); }} className={`bg-zinc-900 border p-10 rounded-[3rem] flex items-start gap-8 transition-all group cursor-pointer shadow-2xl relative overflow-hidden ${!n.read ? 'border-red-600/30 bg-red-600/5' : 'border-zinc-800'}`}>
            {!n.read && <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600"></div>}
            <div className={`p-5 rounded-[2rem] bg-black border border-zinc-800 group-hover:scale-110 transition-transform ${!n.read ? 'text-red-600' : 'text-zinc-700'}`}>{getIcon(n.type)}</div>
            <div className="flex-1">
               <div className="flex justify-between items-start mb-3"><span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{n.moduleId || 'Sistema'}</span><span className="text-[10px] font-bold text-zinc-700">{new Date(n.timestamp).toLocaleString()}</span></div>
               <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-red-500 transition-colors">{n.title}</h3>
               <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-8">{n.message}</p>
               <div className="flex items-center gap-6">
                  <button onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }} className="text-[10px] font-black uppercase text-zinc-700 hover:text-red-500 flex items-center gap-2 transition-all"><Trash2 size={14}/> Apagar</button>
                  {!n.read && <button onClick={(e) => { e.stopPropagation(); markRead(n.id); }} className="text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-400 flex items-center gap-2 transition-all"><CheckCircle2 size={14}/> Marcar Lido</button>}
               </div>
            </div>
          </div>
        )) : (
          <div className="py-32 text-center opacity-20 border-2 border-dashed border-zinc-800 rounded-[4rem]">
             <Bell size={64} className="mx-auto mb-6" />
             <p className="text-sm font-black uppercase tracking-[0.4em]">Silêncio absoluto por aqui</p>
          </div>
        )}
      </div>

      <div className="mt-16 p-8 bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] flex items-center gap-6">
         <div className="p-4 bg-black rounded-2xl text-red-600"><Zap size={24}/></div>
         <p className="text-[11px] text-zinc-500 leading-relaxed uppercase font-bold tracking-tight">Notificações automáticas ajudam você a não perder prazos e eventos críticos do seu ecossistema. Revise-as diariamente.</p>
      </div>
    </div>
  );
};

export default NotificationsPage;
