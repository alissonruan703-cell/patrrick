
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, CheckCircle2, ThumbsUp, ThumbsDown, Package, Clock, ShieldCheck } from 'lucide-react';

const PublicView: React.FC = () => {
  const { data } = useParams();
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  const budget = useMemo(() => {
    try {
      const decoded = decodeURIComponent(escape(atob(data || '')));
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }, [data]);

  if (!budget) return <div className="min-h-screen bg-black flex items-center justify-center p-10 text-zinc-600 font-black text-center">Link de Orçamento Inválido ou Expirado.</div>;

  return (
    <div className="min-h-screen bg-black text-zinc-200 p-4 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12 border-b border-zinc-800 bg-zinc-900/50 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">{budget.c} <span className="text-red-600">Pro</span></h1>
              <div className="flex gap-2">
                <span className="bg-black border border-zinc-800 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> O.S. #{budget.i.slice(-4)}</span>
                <span className="bg-black border border-zinc-800 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> {new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div className="bg-black p-8 rounded-3xl border border-red-600/20 text-center min-w-[220px]">
               <p className="text-[9px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Valor Total</p>
               <p className="text-5xl font-black text-white tracking-tighter leading-none">R$ {budget.t.toFixed(2)}</p>
            </div>
          </div>

          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black border border-zinc-800 p-6 rounded-2xl space-y-4">
               <div className="space-y-1"><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Responsável</p><p className="text-lg font-black text-white uppercase">{budget.n}</p></div>
               <div className="space-y-1"><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Veículo</p><p className="text-lg font-black text-white uppercase">{budget.v} <span className="text-red-600 font-mono">[{budget.p}]</span></p></div>
            </div>
            <div className="bg-red-600/5 border border-red-600/10 p-6 rounded-2xl flex items-center gap-4">
               <p className="text-zinc-400 italic text-sm leading-relaxed max-w-xs">"{budget.d}"</p>
            </div>
          </div>

          <div className="px-8 md:px-12 pb-12 space-y-8">
            <div className="bg-black rounded-3xl border border-zinc-800 overflow-hidden">
               <table className="w-full">
                 <thead className="bg-zinc-800/30 text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                   <tr><th className="px-8 py-5 text-left">Item/Serviço</th><th className="px-8 py-5 text-center">Qtd</th><th className="px-8 py-5 text-right">Subtotal</th></tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800">
                   {budget.it?.map((item: any, i: number) => (
                     <tr key={i} className="hover:bg-white/5 transition-colors">
                       <td className="px-8 py-5 text-xs font-black text-white uppercase">{item.d}</td>
                       <td className="px-8 py-5 text-center text-xs font-bold text-zinc-500">x{item.q}</td>
                       <td className="px-8 py-5 text-right font-black text-white">R$ {(item.p * item.q).toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>

            <div className="pt-8">
              {currentStatus === 'pending' ? (
                <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => setCurrentStatus('rejected')} className="py-6 bg-zinc-800 text-zinc-500 font-black rounded-3xl uppercase text-[10px] tracking-widest hover:bg-red-600/10 hover:text-red-500 transition-all">Rejeitar</button>
                  <button onClick={() => setCurrentStatus('approved')} className="py-6 bg-emerald-600 text-white font-black rounded-3xl uppercase text-[10px] tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all">Aprovar Orçamento</button>
                </div>
              ) : (
                <div className={`py-12 text-center rounded-[3rem] border-2 flex flex-col items-center gap-4 ${currentStatus === 'approved' ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-500' : 'bg-red-600/10 border-red-500/20 text-red-500'}`}>
                  {currentStatus === 'approved' ? <CheckCircle2 size={48} className="animate-bounce"/> : <ThumbsDown size={48}/>}
                  <h3 className="text-xl font-black uppercase tracking-tighter">{currentStatus === 'approved' ? 'Orçamento Aprovado!' : 'Orçamento Rejeitado.'}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">A oficina foi notificada. Aguarde o contato.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 text-zinc-800 font-black text-[9px] uppercase tracking-widest">
           <ShieldCheck size={14}/> Plataforma Segura CRMPLUS+
        </div>
      </div>
    </div>
  );
};

export default PublicView;
