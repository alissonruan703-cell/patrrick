
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Clock, AlertCircle, CheckCircle2, 
  Settings, MoreVertical, ArrowLeft, Zap, 
  User, Car, ShieldAlert, History, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { ServiceOrder, LogEntry } from '../types';

interface SmartNotification {
  id: string;
  osId?: string;
  type: 'urgent' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timeAgo: string;
  icon: React.ReactNode;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('crmplus_oficina_orders');
    const savedLogs = localStorage.getItem('crmplus_logs');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  const combinedNotifications = useMemo(() => {
    const notifications: SmartNotification[] = [];
    const now = new Date();

    // 1. Processar Ações de Clientes (Logs)
    logs.filter(l => l.userId === 'CLIENTE').forEach(log => {
      const logTime = new Date(log.timestamp);
      const diffMs = now.getTime() - logTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      let timeStr = `${diffMins}m atrás`;
      if (diffMins > 60) timeStr = `${Math.floor(diffMins/60)}h atrás`;
      if (diffMins > 1440) timeStr = `${Math.floor(diffMins/1440)}d atrás`;

      notifications.push({
        id: log.id,
        type: log.action === 'APROVADO' ? 'success' : 'urgent',
        title: log.action === 'APROVADO' ? 'Orçamento Aprovado' : 'Orçamento Negado',
        message: log.details,
        timeAgo: timeStr,
        icon: log.action === 'APROVADO' ? <ThumbsUp className="text-emerald-500" size={20} /> : <ThumbsDown className="text-red-500" size={20} />
      });
    });

    // 2. Processar Alertas de Tempo (Ordens)
    orders.forEach(os => {
      const createdAt = new Date(parseInt(os.id) || now.getTime());
      const hoursDiff = Math.abs(now.getTime() - createdAt.getTime()) / 36e5;

      if (os.status === 'Aberto' && hoursDiff > 2 && hoursDiff < 48) {
        notifications.push({
          id: `notif-aberto-${os.id}`,
          osId: os.id,
          type: 'urgent',
          title: `O.S. Parada`,
          message: `O veículo ${os.plate} aguarda diagnóstico há ${Math.floor(hoursDiff)}h.`,
          timeAgo: `há ${Math.floor(hoursDiff)}h`,
          icon: <ShieldAlert className="text-red-500" size={20} />
        });
      }

      if (os.status === 'Pronto') {
        notifications.push({
          id: `notif-pronto-${os.id}`,
          osId: os.id,
          type: 'success',
          title: `Veículo Pronto`,
          message: `O ${os.vehicle} [${os.plate}] aguarda retirada do cliente.`,
          timeAgo: `Pendente`,
          icon: <CheckCircle2 className="text-emerald-500" size={20} />
        });
      }
    });

    return notifications.sort((a, b) => b.id.localeCompare(a.id)).slice(0, 20);
  }, [orders, logs]);

  const handleNotifClick = (n: SmartNotification) => {
    if (n.osId) {
      navigate(`/oficina?id=${n.osId}`);
    } else {
      navigate('/logs');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 px-4 md:px-0">
      <div className="max-w-2xl mx-auto bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-slate-400" />
            </button>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">Central de Notificações</h1>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
            <Settings size={20} />
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {combinedNotifications.length > 0 ? (
            combinedNotifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => handleNotifClick(n)}
                className="px-8 py-6 flex items-start gap-5 hover:bg-white/[0.03] transition-all cursor-pointer group"
              >
                <div className="shrink-0 pt-1">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/40 border border-white/5 group-hover:scale-110 transition-transform`}>
                      {n.icon}
                   </div>
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {n.message}
                  </p>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest pt-1">
                    {n.timeAgo}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                   <button className="p-1.5 text-slate-700 hover:text-white transition-colors">
                      <MoreVertical size={18} />
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 text-center space-y-6 opacity-20">
               <Bell size={64} className="mx-auto" />
               <p className="text-sm font-black uppercase tracking-[0.3em]">Nenhuma atividade nova detectada</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-black/40 text-center">
           <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center justify-center gap-2">
              <History size={12}/> Monitoramento em tempo real ativado
           </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
