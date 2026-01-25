
import React from 'react';
import { useParams } from 'react-router-dom';
import { Printer, Check, Plus, Box, Wrench } from 'lucide-react';

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

  const parts = os.items.filter((i: any) => i.type === 'PEÇA');
  const services = os.items.filter((i: any) => i.type === 'MÃO DE OBRA');
  const others = os.items.filter((i: any) => i.type === 'NOTA');

  const totalParts = parts.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0);
  const totalServices = services.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0);
  const totalOthers = others.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0);

  const TableSection = ({ title, icon, items, total }: any) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
           <div className="text-violet-500">{icon}</div>
           <h3 className="text-sm font-black text-white uppercase tracking-widest print:text-black">{title}</h3>
        </div>
        <div className="bg-[#0f1115] rounded-2xl border border-white/5 overflow-hidden print:border-slate-200">
           <table className="w-full">
             <thead className="bg-[#22272e] text-[8px] font-black text-slate-500 uppercase tracking-widest print:bg-slate-100 print:text-slate-600">
               <tr>
                 <th className="px-6 py-4 text-left">Item</th>
                 <th className="px-6 py-4 text-left">Marca</th>
                 <th className="px-6 py-4 text-center">Qtd</th>
                 <th className="px-6 py-4 text-right">Valor Unit.</th>
                 <th className="px-8 py-4 text-right">Subtotal</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5 print:divide-slate-200">
               {items.map((item: any, i: number) => (
                 <tr key={i} className="hover:bg-white/5 transition-colors print:text-black">
                   <td className="px-6 py-5 text-sm font-bold text-slate-200 print:text-black">{item.description}</td>
                   <td className="px-6 py-5 text-xs text-slate-500 print:text-slate-600">{item.brand || '-'}</td>
                   <td className="px-6 py-5 text-center text-sm font-bold">{item.quantity}</td>
                   <td className="px-6 py-5 text-right text-xs">R$ {item.price.toFixed(2)}</td>
                   <td className="px-8 py-5 text-right font-black text-white print:text-black">R$ {(item.price * item.quantity).toFixed(2)}</td>
                 </tr>
               ))}
             </tbody>
             <tfoot className="bg-white/5 print:bg-slate-50 border-t border-white/5 print:border-slate-200">
               <tr>
                 <td colSpan={4} className="px-8 py-4 text-right text-[9px] font-black uppercase text-slate-500">Total {title}</td>
                 <td className="px-8 py-4 text-right font-black text-white print:text-black">R$ {total.toFixed(2)}</td>
               </tr>
             </tfoot>
           </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f1115] p-4 lg:p-20 text-slate-200 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto bg-[#1a1d23] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden print:shadow-none print:border-none print:bg-white print:text-black">
        {/* Header Premium */}
        <div className="p-10 border-b border-white/5 bg-gradient-to-br from-[#22272e] to-[#1a1d23] print:bg-none print:border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-6">
                <div className="bg-violet-600 p-2 rounded-lg print:hidden"><Plus size={20} className="text-white" /></div>
                <span className="text-xl font-black text-white print:text-black">CRM<span className="text-violet-500">Plus+</span></span>
               </div>
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none print:text-black">Orçamento de Serviço <br/><span className="text-violet-500 text-2xl tracking-normal">Documento O.S. #{os.id}</span></h1>
               <div className="flex items-center gap-4 text-slate-400 font-bold text-xs">
                 <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest print:border-slate-200">Data de Emissão: {os.date}</span>
               </div>
            </div>
            <div className="text-right hidden md:block print:block">
               <div className="w-16 h-16 ml-auto mb-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center text-emerald-500 print:border-slate-200">
                 <Check size={32} strokeWidth={3} />
               </div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-slate-400 italic">Válido para Execução</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 print:gap-4 print:text-black">
          <div className="space-y-6">
            <div className="p-6 bg-[#0f1115] rounded-2xl border border-white/5 space-y-4 print:bg-slate-50 print:border-slate-200">
               <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-slate-500">Cliente</p>
                <p className="text-lg font-black text-white print:text-black">{os.client}</p>
               </div>
               <div className="h-px bg-white/5 print:bg-slate-200"></div>
               <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-slate-500">Veículo / Placa</p>
                <p className="text-lg font-black text-white print:text-black">{os.vehicle} - <span className="text-violet-500">{os.plate}</span></p>
               </div>
            </div>
          </div>

          <div className="p-6 bg-violet-600/5 border border-violet-500/20 rounded-2xl flex flex-col justify-center print:border-slate-200">
            <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-1">Defeito Reclamado</p>
            <p className="text-slate-300 font-medium italic text-base leading-relaxed print:text-slate-600">"{os.description}"</p>
          </div>
        </div>

        {/* Seções de Itens Separadas */}
        <div className="px-10 space-y-10 pb-10">
          <TableSection title="Peças e Componentes" icon={<Box size={20}/>} items={parts} total={totalParts} />
          <TableSection title="Mão de Obra e Serviços" icon={<Wrench size={20}/>} items={services} total={totalServices} />
          <TableSection title="Outros Itens / Taxas" icon={<Check size={20}/>} items={others} total={totalOthers} />

          {/* Observações Técnicas no Relatório */}
          {os.observation && (
            <div className="p-6 bg-[#0f1115] rounded-2xl border border-violet-500/20 space-y-3 print:bg-slate-50 print:border-slate-200">
               <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest print:text-slate-500">Observações Adicionais</p>
               <p className="text-slate-300 text-sm leading-relaxed print:text-slate-700 whitespace-pre-wrap">{os.observation}</p>
            </div>
          )}

          {/* Totalizador Geral */}
          <div className="bg-violet-600 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center shadow-2xl print:bg-slate-100 print:text-black print:border print:border-slate-300 print:rounded-none">
             <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-[10px] font-black text-violet-200 uppercase tracking-[0.3em] print:text-slate-500">Investimento Total Estimado</p>
                <p className="text-xs text-violet-300 font-medium print:text-slate-400">Sujeito a alterações conforme desmontagem</p>
             </div>
             <div className="text-4xl font-black text-white print:text-black">
                R$ {os.total.toFixed(2)}
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 print:hidden">
             <button onClick={() => window.print()} className="flex-1 py-4 bg-white text-black font-black rounded-xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-xl shadow-white/5">
                <Printer size={16} /> Imprimir / PDF
             </button>
             <div className="flex-1 py-4 bg-white/5 border border-white/10 text-slate-500 font-bold rounded-xl text-center text-[9px] tracking-widest flex items-center justify-center">
                Solução de Gestão CRMPlus+
             </div>
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-[10px] text-slate-600 uppercase tracking-widest font-black print:hidden">© 2025 Sistema CRMPlus+ - Excelência em Gestão</p>
    </div>
  );
};

export default PublicView;
