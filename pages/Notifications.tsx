
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
    const savedUserStr = sessionStorage.getItem('crmplus_user');
    if (!savedUserStr) return;
    const user = JSON.parse(savedUserStr);
    
    // Carrega notificação isolada por ID do usuário
    const notifKey = `crmplus_notifications_${user.id}`;
    const all = JSON.parse(localStorage.getItem(notifKey) || '[]');
    setNotifications(all);
  };

  useEffect(() => {
    loadNotifs();
    window.addEventListener('storage', loadNotifs);
    return () => window.removeEventListener('storage', loadNotifs);
  }, [profile.id]);

  const markRead = (id: string) => {
    const user = JSON.parse(sessionStorage.getItem('crmplus_user') || '{}');
    const notifKey = `crmplus_notifications_${user.id}`;
    const all = JSON.parse(localStorage.getItem(notifKey) || '[]');
    const updated = all.map((n: any) => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(notifKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const deleteNotif = (id: string) => {
    const user = JSON.parse(sessionStorage.getItem('crmplus_user') || '{}');
    const notifKey = `crmplus_notifications_${user.id}`;
    const all = JSON.parse(localStorage.getItem(notifKey) || '[]');
    const updated = all.filter((n: any) => n.id !== id);
    localStorage.setItem(notifKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (moduleFilter !== 'TODOS' && n.moduleId !== moduleFilter.toLowerCase()) return false;
    return true;
  }).sort((a,b) => b.timestamp.localeCompare(a.timestamp));

  const getIcon = (type: string) => {
    switch(type) {
      case 'urgent': return <ShieldAlert className="text-red-500" />;
      case 'success': return <CheckCircle2 className="text-emerald-500" />;
      case 'warning': return <AlertCircle className="text-amber-500" />;
      default: return <Bell className="text-zinc-500" />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 hover:text-white transition-all"><ArrowLeft size={20} /></button>
           <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Central de <span className="text-red-600">Avisos</span></h1>
              <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest mt-1">{notifications.filter(n => !n.read).length} pendentes</p>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 w-fit">
        <button onClick={() => setFilter('all')} className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filter === 'all' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'}`}>Todas</button>
        <button onClick={() => setFilter('unread')} className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filter === 'unread' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'}`}>Não Lidas</button>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? filtered.map(n => (
          <div key={n.id} onClick={() => { if(!n.read) markRead(n.id); if(n.link) navigate(n.link); }} className={`bg-zinc-900 border p-6 rounded-2xl flex items-start gap-5 transition-all group cursor-pointer ${!n.read ? 'border-red-600/30' : 'border-zinc-800/50 opacity-60'}`}>
            <div className={`p-3 rounded-xl bg-black border border-zinc-800 shrink-0 ${!n.read ? 'text-red-600' : 'text-zinc-700'}`}>{getIcon(n.type)}</div>
            <div className="flex-1">
               <div className="flex justify-between items-center mb-1"><span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">{n.moduleId || 'Sistema'}</span><span className="text-[8px] font-bold text-zinc-700">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
               <h3 className="text-sm font-black uppercase text-white mb-1">{n.title}</h3>
               <p className="text-[11px] text-zinc-400 font-medium leading-relaxed line-clamp-2">{n.message}</p>
               <div className="flex items-center gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }} className="text-[9px] font-black uppercase text-zinc-700 hover:text-red-500">Apagar</button>
                  {!n.read && <button onClick={(e) => { e.stopPropagation(); markRead(n.id); }} className="text-[9px] font-black uppercase text-emerald-500">Lido</button>}
               </div>
            </div>
          </div>
        )) : (
          <div className="py-24 text-center opacity-20 border-2 border-dashed border-zinc-800 rounded-3xl">
             <Bell size={48} className="mx-auto mb-4" />
             <p className="text-xs font-black uppercase tracking-widest">Tudo em dia por aqui</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
