
import React from 'react';
import { useParams } from 'react-router-dom';
import { Printer, Check, Plus } from 'lucide-react';

const PublicView: React.FC = () => {
  const { data } = useParams();
  
  const os = React.useMemo(() => {
    try {
      const decoded = decodeURIComponent(escape(atob(data || '')));
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }, [data]);

  if (!os) return <div className="p-20 text-center text-slate-500 font-black uppercase tracking-widest">Link expirado ou inválido.</div>;

  return (
    <div className="min-h-screen bg-[#0f1115] p-6 lg:p-20 text-slate-200">
      <div className="max-w-4xl mx-auto bg-[#1a1d23] rounded-[3rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Header Premium */}
        <div className="p-12 border-b border-white/5 bg-gradient-to-br from-[#22272e] to-[#1a1d23]">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-8">
                <div className="bg-violet-600 p-2 rounded-lg shadow-lg shadow-violet-600/20"><Plus size={24} className="text-white" /></div>
                <span className="text-2xl font-black text-white">CRM<span className="text-violet-500">Plus+</span></span>
               </div>
               <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Orçamento <br/><span className="text-violet-500 text-3xl tracking-normal">Aprovado para Execução</span></h1>
               <div className="flex items-center gap-4 text-slate-400 font-bold">
                 <span className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5 uppercase text-[10px] tracking-widest">O.S. #{os.id}</span>
                 <span className="text-xs">{os.date}</span>
               </div>
            </div>
            <div className="text-right hidden md:block">
               <div className="w-24 h-24 ml-auto mb-4 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-center text-violet-500">
                 <Check size={48} strokeWidth={3} />
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">Status do Documento<br/><span className="text-emerald-500">Confirmado</span></p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="p-8 bg-[#0f1115] rounded-[2rem] border border-white/5 space-y-4 shadow-inner">
               <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Proprietário</p>
                <p className="text-xl font-black text-white leading-tight">{os.client}</p>
               </div>
               <div className="h-px bg-white/5"></div>
               <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Veículo Identificado</p>
                <p className="text-xl font-black text-white">{os.vehicle}</p>
                <p className="text-sm font-mono font-bold text-violet-500 tracking-tighter bg-violet-500/5 inline-block px-3 py-1 rounded-lg border border-violet-500/20">{os.plate}</p>
               </div>
            </div>
          </div>

          <div className="p-8 bg-violet-600/5 border border-violet-500/20 rounded-[2rem] flex flex-col justify-center">
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">Relato Técnico</p>
            <p className="text-slate-300 font-medium italic text-lg leading-relaxed">"{os.description}"</p>
          </div>
        </div>

        {/* Itens */}
        <div className="px-12 pb-12">
          <div className="bg-[#0f1115] rounded-[2rem] border border-white/5 overflow-hidden shadow-inner">
             <table className="w-full">
               <thead className="bg-[#22272e] text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <tr>
                   <th className="px-8 py-5 text-left">Item / Serviço</th>
                   <th className="px-8 py-5 text-right">Valor Final</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {os.items.map((item: any, i: number) => (
                   <tr key={i} className="hover:bg-white/5 transition-colors">
                     <td className="px-8 py-6 text-sm font-bold text-slate-200">{item.description}</td>
                     <td className="px-8 py-6 text-right font-black text-white">R$ {item.price.toFixed(2)}</td>
                   </tr>
                 ))}
               </tbody>
               <tfoot>
                 <tr className="bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 border-t border-white/10">
                   <td className="px-8 py-10 text-right font-black uppercase tracking-widest text-slate-400">Total do Investimento</td>
                   <td className="px-8 py-10 text-right text-4xl font-black text-white">R$ {os.total.toFixed(2)}</td>
                 </tr>
               </tfoot>
             </table>
          </div>

          <div className="mt-12 flex flex-col md:flex-row gap-6">
             <button onClick={() => window.print()} className="flex-1 py-5 bg-white text-black font-black rounded-3xl uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-xl shadow-white/5">
                <Printer size={18} /> Imprimir Comprovante
             </button>
             <div className="flex-1 py-5 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-3xl text-center text-xs tracking-widest flex items-center justify-center">
                Visualizando via CRMPlus+
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicView;