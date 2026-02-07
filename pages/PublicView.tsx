
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle2, ThumbsUp, ThumbsDown, Camera, MessageSquare } from 'lucide-react';

const PublicView: React.FC = () => {
  const { data } = useParams();
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  const osData = useMemo(() => {
    try {
      const decoded = decodeURIComponent(escape(atob(data || '')));
      const raw = JSON.parse(decoded);
      // Mapeia chaves curtas para nomes legíveis
      return { 
        id: raw.i, 
        tenantId: raw.tid, 
        client: raw.n, vehicle: raw.v, plate: raw.p, description: raw.d, 
        budgetNotes: raw.bn || '',
        total: raw.t, 
        companyName: raw.cn || 'Oficina Automotiva',
        photos: (raw.ph || []).map((p: any) => ({ url: p.u, obs: p.o })),
        items: (raw.it || []).map((item: any) => ({
          description: item.d, quantity: item.q, price: item.p
        }))
      };
    } catch (e) { return null; }
  }, [data]);

  const handleClientAction = (newStatus: 'Execução' | 'Reprovado') => {
    if (!osData || !osData.tenantId) return;

    const storageKey = `crmplus_oficina_v2_orders_${osData.tenantId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      const orders = JSON.parse(saved);
      const updatedOrders = orders.map((o: any) => o.id === osData.id ? { ...o, status: newStatus } : o);
      localStorage.setItem(storageKey, JSON.stringify(updatedOrders));
      
      const notifKey = `crmplus_notifications_${osData.tenantId}`;
      const existingNotifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
      const newNotif = {
        id: Date.now().toString(),
        profileId: 'admin',
        moduleId: 'oficina',
        title: `Orçamento ${newStatus === 'Execução' ? 'Aprovado' : 'Recusado'}`,
        message: `O cliente ${osData.client} respondeu via link para a placa ${osData.plate}.`,
        type: newStatus === 'Execução' ? 'success' : 'urgent',
        read: false,
        timestamp: new Date().toISOString(),
        link: `/module/oficina?id=${osData.id}`
      };
      localStorage.setItem(notifKey, JSON.stringify([newNotif, ...existingNotifs]));
      
      setCurrentStatus(newStatus === 'Execução' ? 'approved' : 'rejected');
      window.dispatchEvent(new Event('storage'));
    }
  };

  if (!osData) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-600 font-black uppercase tracking-widest">Orçamento não localizado ou link expirado.</div>;

  return (
    <div className="min-h-screen bg-black p-4 lg:p-12 text-zinc-200">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start gap-8 bg-zinc-900/50 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><CheckCircle2 size={120}/></div>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="bg-red-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl">{osData.companyName[0]}</div>
                <span className="text-xl font-black text-white uppercase tracking-tighter">{osData.companyName}</span>
              </div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Orçamento <span className="text-red-600">Digital</span></h1>
              <div className="flex gap-2">
                <p className="bg-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-zinc-800 inline-flex items-center gap-2"><Calendar size={12}/> {new Date().toLocaleDateString('pt-BR')}</p>
                <p className="bg-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-zinc-800 inline-flex items-center gap-2">O.S. #{osData.id.slice(-4)}</p>
              </div>
            </div>
            <div className="bg-black p-8 rounded-3xl border border-red-600/20 text-center min-w-[200px] shadow-inner">
               <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Valor Final Estimado</p>
               <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">R$ {osData.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Info */}
          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-black rounded-2xl border border-zinc-800 space-y-4 shadow-inner">
               <div className="space-y-1"><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Responsável</p><p className="text-lg font-black text-white uppercase">{osData.client}</p></div>
               <div className="space-y-1"><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Veículo</p><p className="text-lg font-black text-white uppercase">{osData.vehicle} <span className="text-red-600 font-mono">[{osData.plate}]</span></p></div>
            </div>
            <div className="p-6 bg-red-600/5 border border-red-600/10 rounded-2xl flex flex-col justify-center space-y-4">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2"><AlertCircle size={12}/> Laudo do Mecânico</p>
                <p className="text-zinc-400 italic text-sm leading-relaxed">"{osData.description}"</p>
              </div>
              {osData.budgetNotes && (
                <div className="space-y-1 pt-4 border-t border-red-600/10">
                  <p className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2"><MessageSquare size={12}/> Observações Comerciais</p>
                  <p className="text-zinc-400 text-xs leading-relaxed">{osData.budgetNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Galeria */}
          {osData.photos.length > 0 && (
            <div className="px-8 md:px-12 pb-8">
              <p className="text-[9px] font-black text-zinc-600 uppercase mb-4 flex items-center gap-2"><Camera size={12}/> Galeria de Evidências</p>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {osData.photos.map((ph, i) => (
                  <div key={i} className="shrink-0 w-48 bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-xl group">
                    <img src={ph.url} className="w-full aspect-square object-cover" />
                    <div className="p-3 bg-zinc-900">
                      <p className="text-[8px] text-zinc-400 italic line-clamp-2">"{ph.obs || 'Registro sem descrição.'}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabela */}
          <div className="px-8 md:px-12 pb-12 space-y-8">
            <div className="bg-black rounded-[2rem] border border-zinc-800 overflow-hidden shadow-inner">
               <table className="w-full">
                 <thead className="bg-zinc-800/30 text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                   <tr><th className="px-8 py-5 text-left">Item / Serviço</th><th className="px-8 py-5 text-center">Qtd</th><th className="px-8 py-5 text-right">Subtotal</th></tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800">
                   {osData.items.map((item: any, i: number) => (
                     <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-5"><p className="text-sm font-black text-white uppercase tracking-tight">{item.description}</p></td>
                       <td className="px-8 py-5 text-center text-sm font-bold text-zinc-500">x{item.quantity}</td>
                       <td className="px-8 py-5 text-right font-black text-white text-base">R$ {(item.price * item.quantity).toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>

            <div className="pt-8">
              {currentStatus === 'pending' ? (
                <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => handleClientAction('Reprovado')} className="py-6 bg-zinc-800 text-zinc-400 font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-700 transition-all flex items-center justify-center gap-3"><ThumbsDown size={18}/> Rejeitar</button>
                  <button onClick={() => handleClientAction('Execução')} className="py-6 bg-red-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3"><ThumbsUp size={18}/> Aprovar Orçamento</button>
                </div>
              ) : (
                <div className={`w-full py-12 text-center font-black rounded-[2.5rem] uppercase text-sm tracking-[0.2em] flex flex-col items-center gap-4 border-2 ${currentStatus === 'approved' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20' : 'bg-red-600/10 text-red-500 border-red-500/20'}`}>
                  {currentStatus === 'approved' ? <CheckCircle2 size={48} className="mb-2 animate-bounce" /> : <AlertCircle size={48} className="mb-2" />}
                  {currentStatus === 'approved' ? 'Orçamento Aprovado com Sucesso!' : 'Orçamento Reprovado.'}
                  <p className="text-[10px] opacity-60 normal-case font-medium">Nossa equipe técnica foi notificada.</p>
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
