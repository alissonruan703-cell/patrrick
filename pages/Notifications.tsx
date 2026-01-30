
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, AlertCircle, CheckCircle2, Settings, MoreVertical, ArrowLeft, Zap, User, Car, ShieldAlert, History, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { ServiceOrder, LogEntry } from '../types';

interface SmartNotification { id: string; osId?: string; type: 'urgent' | 'warning' | 'success' | 'info'; title: string; message: string; timeAgo: string; icon: React.ReactNode; }

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('crmplus_oficina_orders');
    const savedLogs = localStorage.getItem('crmplus_logs');
    const dismissedRaw = localStorage.getItem('crmplus_dismissed_notifications');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (dismissedRaw) setDismissedIds(JSON.parse(dismissedRaw));
  }, []);

  const handleDismiss = (id: string) => {
    const current = JSON.parse(localStorage.getItem('crmplus_dismissed_notifications') || '[]');
    if (!current.includes(id)) { const updated = [...current, id]; localStorage.setItem('crmplus_dismissed_notifications', JSON.stringify(updated)); setDismissedIds(updated); window.dispatchEvent(new Event('storage')); }
  };

  const combinedNotifications = useMemo(() => {
    const notifications: SmartNotification[] = [];
    const now = new Date();
    logs.filter(l => l.userId === 'CLIENTE' && !dismissedIds.includes(l.id)).forEach(log => {
      notifications.push({ id: log.id, type: log.action === 'APROVADO' ? 'success' : 'urgent', title: log.action === 'APROVADO' ? 'Orçamento Aprovado' : 'Orçamento Negado', message: log.details, timeAgo: 'Recente', icon: log.action === 'APROVADO' ? <ThumbsUp className="text-emerald-500" size={20} /> : <ThumbsDown className="text-red-500" size={20} /> });
    });
    orders.forEach(os => {
      const readyId = `notif-pronto-${os.id}`;
      if (os.status === 'Pronto' && !dismissedIds.includes(readyId)) { notifications.push({ id: readyId, osId: os.id, type: 'success', title: `Veículo Pronto`, message: `O ${os.vehicle} [${os.plate}] aguarda retirada do cliente.`, timeAgo: `Pendente`, icon: <CheckCircle2 className="text-emerald-500" size={20} /> }); }
    });
    return notifications;
  }, [orders, logs, dismissedIds]);

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 px-4 md:px-0">
      <div className="max-w-2xl mx-auto bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between"><div className="flex items-center gap-4"><button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full"><ArrowLeft size={20} className="text-slate-400" /></button><h1 className="text-xl font-black text-white uppercase tracking-tight">Notificações</h1></div></div>
        <div className="divide-y divide-white/5">
          {combinedNotifications.length > 0 ? (
            combinedNotifications.map((n) => (
              <div key={n.id} className="px-8 py-6 flex items-start gap-5 hover:bg-white/[0.03] group cursor-pointer" onClick={() => navigate(n.osId ? `/oficina?id=${n.osId}` : '/logs')}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-black/40 border border-white/5">{n.icon}</div>
                <div className="flex-1 space-y-1"><p className="text-sm font-black text-white uppercase">{n.title}</p><p className="text-xs text-slate-400 font-medium">{n.message}</p></div>
                <button onClick={(e) => { e.stopPropagation(); handleDismiss(n.id); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-red-500"><X size={18} /></button>
              </div>
            ))
          ) : (
            <div className="py-32 text-center space-y-6 opacity-20"><Bell size={64} className="mx-auto" /><p className="text-sm font-black uppercase tracking-[0.3em]">Nenhuma nova notificação</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
