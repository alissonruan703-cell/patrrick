
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Clock, AlertCircle, CheckCircle2, 
  Settings, MoreVertical, ArrowLeft, Zap, 
  User, Car, ShieldAlert, History
} from 'lucide-react';
import { ServiceOrder } from '../types';

interface SmartNotification {
  id: string;
  osId: string;
  type: 'urgent' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timeAgo: string;
  icon: React.ReactNode;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('crmplus_oficina_orders');
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  const smartNotifications = useMemo(() => {
    const notifications: SmartNotification[] = [];
    const now = new Date();

    orders.forEach(os => {
      const createdAt = new Date(parseInt(os.id) || now.getTime());
      const hoursDiff = Math.abs(now.getTime() - createdAt.getTime()) / 36e5;

      // Só alerta "Aberto" se tiver mais de 2 horas e menos de 24 horas (prioridade do dia)
      if (os.status === 'Aberto' && hoursDiff > 2 && hoursDiff < 24) {
        notifications.push({
          id: `notif-aberto-${os.id}`,
          osId: os.id,
          type: 'urgent',
          title: `Diagnóstico em atraso`,
          message: `${os.clientName} aguarda início há mais de ${Math.floor(hoursDiff)} horas.`,
          timeAgo: `há ${Math.floor(hoursDiff)} horas`,
          icon: <ShieldAlert className="text-red-500" size={20} />
        });
      }

      // Alerta Orçamento entre 4h e 48h
      if (os.status === 'Orçamento' && hoursDiff > 4 && hoursDiff < 48) {
        notifications.push({
          id: `notif-orc-${os.id}`,
          osId: os.id,
          type: 'warning',
          title: `Aprovação Pendente`,
          message: `O orçamento de ${os.clientName} no valor de R$ ${os.total.toFixed(2)} aguarda retorno.`,
          timeAgo: `há ${Math.floor(hoursDiff)} horas`,
          icon: <Clock className="text-amber-500" size={20} />
        });
      }

      if (os.status === 'Pronto') {
        notifications.push({
          id: `notif-pronto-${os.id}`,
          osId: os.id,
          type: 'success',
          title: `Veículo finalizado`,
          message: `O ${os.vehicle} [${os.plate}] está pronto para retirada.`,
          timeAgo: `agora`,
          icon: <CheckCircle2 className="text-emerald-500" size={20} />
        });
      }
    });

    // Ordenar e limitar aos 15 alertas mais relevantes/recentes
    return notifications
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 15);
  }, [orders]);

  const handleNotifClick = (osId: string) => {
    // Redireciona para oficina passando o ID para auto-abrir
    navigate(`/oficina?id=${osId}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 px-4 md:px-0">
      <div className="max-w-2xl mx-auto bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        
        {/* Header no estilo YouTube */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-slate-400" />
            </button>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">Notificações</h1>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
            <Settings size={20} />
          </button>
        </div>

        {/* Lista de Notificações */}
        <div className="divide-y divide-white/5">
          {smartNotifications.length > 0 ? (
            smartNotifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => handleNotifClick(n.osId)}
                className="px-8 py-6 flex items-start gap-5 hover:bg-white/[0.03] transition-all cursor-pointer group"
              >
                {/* Ícone Lateral / Avatar */}
                <div className="shrink-0 pt-1">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/40 border border-white/5 group-hover:scale-110 transition-transform`}>
                      {n.icon}
                   </div>
                </div>

                {/* Conteúdo */}
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

                {/* Thumbnail Simulado ou Ações */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                   <button className="p-1.5 text-slate-700 hover:text-white transition-colors">
                      <MoreVertical size={18} />
                   </button>
                   <div className="w-16 h-10 bg-black/60 rounded-lg border border-white/5 overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Car size={14} className="text-slate-500" />
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 text-center space-y-6 opacity-20">
               <Bell size={64} className="mx-auto" />
               <p className="text-sm font-black uppercase tracking-[0.3em]">Nenhum alerta relevante no momento</p>
            </div>
          )}
        </div>

        {/* Rodapé da lista */}
        <div className="p-6 bg-black/40 text-center">
           <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center justify-center gap-2">
              <History size={12}/> Histórico de monitoramento inteligente
           </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
