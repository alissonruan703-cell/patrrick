
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Image as ImageIcon, AlertCircle, CheckCircle2, ThumbsUp, ThumbsDown } from 'lucide-react';

const PublicView: React.FC = () => {
  const { data } = useParams();
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
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

  const handleClientAction = (newStatus: 'Execução' | 'Reprovado') => {
    if (!osDataFromUrl || !osDataFromUrl.tenantId) return;

    const storageKey = `crmplus_oficina_v2_orders_${osDataFromUrl.tenantId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      const orders = JSON.parse(saved);
      const updatedOrders = orders.map((o: any) => o.id === osDataFromUrl.id ? { ...o, status: newStatus } : o);
      localStorage.setItem(storageKey, JSON.stringify(updatedOrders));
      
      // Notificação isolada para o mecânico específico
      const notifKey = `crmplus_notifications_${osDataFromUrl.tenantId}`;
      const existingNotifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
      const newNotif = {
        id: Date.now().toString(),
        profileId: 'admin',
        moduleId: 'oficina',
        title: `Orçamento ${newStatus === 'Execução' ? 'Aprovado' : 'Recusado'}`,
        message: `O cliente ${osDataFromUrl.client} respondeu ao orçamento da placa ${osDataFromUrl.plate}.`,
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

  if (!osDataFromUrl) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-600 font-black uppercase tracking-widest">Orçamento não localizado</div>;

  return (
    <div className="min-h-screen bg-black p-4 lg:p-12 text-zinc-200">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start gap-8 bg-zinc-900/50">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-red-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl">{osDataFromUrl.companyName[0]}</div>
                <span className="text-xl font-black text-white uppercase tracking-tighter">{osDataFromUrl.companyName}</span>
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Aprovação de <span className="text-red-600">Serviços</span></h1>
              <div className="flex gap-2">
                <p className="bg-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-zinc-800 inline-flex items-center gap-2"><Calendar size={12}/> {osDataFromUrl.date}</p>
                <p className="bg-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-zinc-800 inline-flex items-center gap-2">#{osDataFromUrl.id.slice(-4)}</p>
              </div>
            </div>
            <div className="bg-black p-6 rounded-3xl border border-red-600/20 text-center min-w-[200px]">
               <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Total</p>
               <p className="text-4xl font-black text-white">R$ {osDataFromUrl.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-black rounded-2xl border border-zinc-800 space-y-4">
               <div className="space-y-1"><p className="text-[9px] font-black text-zinc-600 uppercase">Cliente</p><p className="text-base font-black text-white uppercase">{osDataFromUrl.client}</p></div>
               <div className="space-y-1"><p className="text-[9px] font-black text-zinc-600 uppercase">Veículo</p><p className="text-base font-black text-white uppercase">{osDataFromUrl.vehicle} <span className="text-red-600 font-mono">[{osDataFromUrl.plate}]</span></p></div>
            </div>
            <div className="p-6 bg-red-600/5 border border-red-600/10 rounded-2xl flex flex-col justify-center">
              <p className="text-[9px] font-black text-red-600 uppercase mb-2">Relato Técnico</p>
              <p className="text-zinc-400 italic text-sm leading-relaxed">"{osDataFromUrl.description || 'Vistoria periódica preventiva.'}"</p>
            </div>
          </div>

          {osDataFromUrl.photos.length > 0 && (
            <div className="px-8 md:px-12 pb-8">
              <p className="text-[9px] font-black text-zinc-600 uppercase mb-4">Fotos do Veículo na Entrada</p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {osDataFromUrl.photos.map((ph, i) => (
                  <div key={i} className="shrink-0 w-32 h-32 rounded-xl overflow-hidden border border-zinc-800"><img src={ph} className="w-full h-full object-cover" /></div>
                ))}
              </div>
            </div>
          )}

          <div className="px-8 md:px-12 pb-12 space-y-6">
            <div className="bg-black rounded-2xl border border-zinc-800 overflow-hidden">
               <table className="w-full">
                 <thead className="bg-zinc-800/30 text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                   <tr><th className="px-6 py-4 text-left">Descrição</th><th className="px-6 py-4 text-center">Qtd</th><th className="px-6 py-4 text-right">Subtotal</th></tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800">
                   {osDataFromUrl.items.map((item: any, i: number) => (
                     <tr key={i} className="hover:bg-zinc-800/20">
                       <td className="px-6 py-4"><p className="text-xs font-black text-white uppercase">{item.description}</p><p className="text-[8px] font-black text-zinc-600 uppercase">{item.type}</p></td>
                       <td className="px-6 py-4 text-center text-xs font-bold text-zinc-500">x{item.quantity}</td>
                       <td className="px-6 py-4 text-right font-black text-white text-sm">R$ {(item.price * item.quantity).toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>

            <div className="pt-8">
              {currentStatus === 'pending' ? (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleClientAction('Reprovado')} className="py-5 bg-zinc-800 text-zinc-400 font-black rounded-xl uppercase text-[10px] tracking-widest hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"><ThumbsDown size={16}/> Recusar</button>
                  <button onClick={() => handleClientAction('Execução')} className="py-5 bg-red-600 text-white font-black rounded-xl uppercase text-[10px] tracking-widest shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"><ThumbsUp size={16}/> Aprovar Orçamento</button>
                </div>
              ) : (
                <div className={`w-full py-10 text-center font-black rounded-3xl uppercase text-xs tracking-[0.2em] flex flex-col items-center gap-3 border-2 ${currentStatus === 'approved' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20' : 'bg-red-600/10 text-red-500 border-red-500/20'}`}>
                  {currentStatus === 'approved' ? <CheckCircle2 size={40} className="mb-2" /> : <AlertCircle size={40} className="mb-2" />}
                  {currentStatus === 'approved' ? 'Orçamento Aprovado com Sucesso!' : 'Orçamento Reprovado.'}
                  <p className="text-[9px] opacity-60 normal-case font-medium">Você já pode fechar esta página.</p>
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
