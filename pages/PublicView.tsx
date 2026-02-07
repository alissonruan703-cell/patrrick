
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LogEntry } from '../types';

const PublicView: React.FC = () => {
  const { data } = useParams();
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [logo, setLogo] = useState('');
  
  const osDataFromUrl = useMemo(() => {
    try {
      const decoded = decodeURIComponent(escape(atob(data || '')));
      const raw = JSON.parse(decoded);
      return { 
        id: raw.i, 
        tenantId: raw.tid, 
        client: raw.n, vehicle: raw.v, plate: raw.p, description: raw.d, 
        total: raw.t, date: raw.dt, companyName: raw.cn || 'Oficina Automotiva',
        photos: raw.ph || [],
        items: (raw.it || []).map((item: any) => ({
          type: item.t === 'P' ? 'PEÇA' : 'MÃO DE OBRA',
          description: item.d, quantity: item.q, price: item.p
        }))
      };
    } catch (e) { return null; }
  }, [data]);

  useEffect(() => {
    const savedConfig = localStorage.getItem('crmplus_system_config');
    if (savedConfig) setLogo(JSON.parse(savedConfig).companyLogo || '');
  }, []);

  const handleClientAction = (newStatus: 'Execução' | 'Reprovado') => {
    if (!osDataFromUrl || !osDataFromUrl.tenantId) return;

    // Persistência na base de dados v2 correta
    const storageKey = `crmplus_oficina_v2_orders_${osDataFromUrl.tenantId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      const orders = JSON.parse(saved);
      const updatedOrders = orders.map((o: any) => o.id === osDataFromUrl.id ? { ...o, status: newStatus } : o);
      localStorage.setItem(storageKey, JSON.stringify(updatedOrders));
      
      // Notificação para o mecânico
      const notifKey = `crmplus_notifications_${osDataFromUrl.tenantId}`;
      const existingNotifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
      const newNotif = {
        id: Date.now().toString(),
        profileId: 'admin',
        title: `Orçamento ${newStatus === 'Execução' ? 'Aprovado' : 'Recusado'}`,
        message: `O cliente da OS ${osDataFromUrl.id.slice(-4)} tomou uma decisão via link.`,
        type: newStatus === 'Execução' ? 'success' : 'urgent',
        read: false,
        timestamp: new Date().toISOString(),
        link: `/module/oficina?id=${osDataFromUrl.id}`
      };
      localStorage.setItem(notifKey, JSON.stringify([newNotif, ...existingNotifs]));
      
      setCurrentStatus(newStatus === 'Execução' ? 'approved' : 'rejected');
      window.dispatchEvent(new Event('storage'));
    }
  };

  if (!osDataFromUrl) return <div className="min-h-screen flex items-center justify-center p-10 text-slate-500 font-black uppercase tracking-[0.3em]">Orçamento não disponível</div>;

  return (
    <div className="min-h-screen bg-black p-4 lg:p-12 text-slate-200">
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-1000">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] md:rounded-[4rem] shadow-2xl overflow-hidden">
          <div className="p-8 md:p-14 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-6 mb-4">
                {logo ? (
                  <img src={logo} className="h-12 md:h-16 w-auto object-contain" alt="Logo" />
                ) : (
                  <div className="bg-red-600 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-white text-xl">
                    {osDataFromUrl.companyName[0]}
                  </div>
                )}
                <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">{osDataFromUrl.companyName}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Orçamento <span className="text-red-600">Digital</span></h1>
              <div className="flex flex-wrap gap-3">
                <p className="bg-black/40 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border border-zinc-800"><Calendar size={14} className="text-red-500"/> {osDataFromUrl.date}</p>
                <p className="bg-black/40 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border border-zinc-800">O.S. {osDataFromUrl.id.slice(-4)}</p>
              </div>
            </div>
            <div className="bg-black/40 p-8 rounded-[2.5rem] border border-red-600/20 text-center min-w-[240px] shadow-inner">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Total Estimado</p>
               <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">R$ {osDataFromUrl.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="p-8 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            <div className="p-8 bg-black/40 rounded-[2rem] border border-zinc-800 space-y-6">
               <div className="space-y-1"><p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Proprietário</p><p className="text-lg font-black text-white uppercase">{osDataFromUrl.client}</p></div>
               <div className="space-y-1"><p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Veículo</p><p className="text-lg font-black text-white uppercase">{osDataFromUrl.vehicle} <span className="text-red-600 font-mono">[{osDataFromUrl.plate}]</span></p></div>
            </div>
            <div className="p-8 bg-red-600/5 border border-red-600/10 rounded-[2rem] flex flex-col justify-center space-y-4">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Diagnóstico Preliminar</p>
              <p className="text-zinc-400 italic text-sm leading-relaxed">"{osDataFromUrl.description || 'Nenhuma observação técnica adicional.'}"</p>
            </div>
          </div>

          <div className="px-8 md:px-14 pb-14 space-y-8">
            <div className="bg-black/40 rounded-[2rem] border border-zinc-800 overflow-hidden">
               <table className="w-full">
                 <thead className="bg-zinc-800/50 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                   <tr><th className="px-6 py-5 text-left">Item / Serviço</th><th className="px-6 py-5 text-center">Qtd</th><th className="px-6 py-5 text-right">Valor</th></tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800">
                   {osDataFromUrl.items.map((item: any, i: number) => (
                     <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                       <td className="px-6 py-5">
                          <p className="text-sm font-black text-white uppercase tracking-tight">{item.description}</p>
                          <p className="text-[9px] font-black text-zinc-600 uppercase mt-1">{item.type}</p>
                       </td>
                       <td className="px-6 py-5 text-center text-sm font-bold text-zinc-400 font-mono">x{item.quantity}</td>
                       <td className="px-6 py-5 text-right font-black text-white text-base">R$ {(item.price * item.quantity).toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>

            <div className="pt-10 flex flex-col sm:flex-row gap-6">
              {currentStatus === 'pending' ? (
                <>
                  <button onClick={() => handleClientAction('Reprovado')} className="flex-1 py-6 bg-zinc-800 text-zinc-400 font-black rounded-2xl uppercase text-[11px] tracking-widest hover:bg-zinc-700 transition-all">Recusar Orçamento</button>
                  <button onClick={() => handleClientAction('Execução')} className="flex-1 py-6 bg-red-600 text-white font-black rounded-2xl uppercase text-[11px] tracking-widest shadow-xl hover:bg-red-700 transition-all">Aprovar e Iniciar</button>
                </>
              ) : (
                <div className={`w-full py-10 text-center font-black rounded-[2.5rem] uppercase text-sm tracking-[0.2em] flex flex-col items-center gap-4 border-2 ${currentStatus === 'approved' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20' : 'bg-red-600/10 text-red-500 border-red-500/20'}`}>
                  {currentStatus === 'approved' ? (
                    <>
                      <CheckCircle2 size={48} className="animate-bounce" />
                      Orçamento Aprovado com Sucesso!
                      <p className="text-[10px] opacity-60 normal-case font-medium">Nossa equipe técnica já foi notificada e dará início aos trabalhos.</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={48} />
                      Orçamento Recusado.
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicView;
