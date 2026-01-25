
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, Check, Box, Wrench, ThumbsUp, ThumbsDown } from 'lucide-react';

const PublicView: React.FC = () => {
  const { data } = useParams();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [logo, setLogo] = useState('');
  
  const os = React.useMemo(() => {
    try {
      const decoded = decodeURIComponent(escape(atob(data || '')));
      const raw = JSON.parse(decoded);
      
      return {
        id: raw.i,
        client: raw.n,
        vehicle: raw.v,
        plate: raw.p,
        description: raw.d,
        observation: raw.o,
        total: raw.t,
        date: raw.dt,
        companyName: raw.cn || 'CRMPLUS'
      };
    } catch (e) {
      return null;
    }
  }, [data]);

  useEffect(() => {
    const savedConfig = localStorage.getItem('crmplus_system_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setLogo(parsed.companyLogo || '');
    }
  }, []);

  const items = React.useMemo(() => {
     if (!data) return [];
     try {
       const decoded = decodeURIComponent(escape(atob(data)));
       const raw = JSON.parse(decoded);
       return (raw.it || []).map((item: any) => ({
          type: item.t === 'P' ? 'PEÇA' : item.t === 'M' ? 'MÃO DE OBRA' : 'NOTA',
          description: item.d,
          brand: item.b,
          quantity: item.q,
          price: item.p
        }));
     } catch(e) { return []; }
  }, [data]);

  const handleClientAction = (newStatus: 'Execução' | 'Reprovado') => {
    if (!os) return;
    setStatus(newStatus === 'Execução' ? 'approved' : 'rejected');
    
    const saved = localStorage.getItem('crmplus_oficina_orders');
    if (saved) {
      const orders = JSON.parse(saved);
      const updatedOrders = orders.map((order: any) => 
        String(order.id) === String(os.id) ? { ...order, status: newStatus } : order
      );
      localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updatedOrders));
      
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('crmplus_update'));
    }
  };

  if (!os) return <div className="p-20 text-center text-slate-500 font-black uppercase tracking-widest">Link expirado ou inválido.</div>;

  const parts = items.filter((i: any) => i.type === 'PEÇA');
  const services = items.filter((i: any) => i.type === 'MÃO DE OBRA');
  const others = items.filter((i: any) => i.type === 'NOTA');

  const TableSection = ({ title, icon, items }: any) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
           <div className="text-violet-500">{icon}</div>
           <h3 className="text-[11px] font-black text-white uppercase tracking-widest print:text-black">{title}</h3>
        </div>
        <div className="bg-[#0f1115] rounded-2xl border border-white/5 overflow-hidden print:border-slate-200">
           <table className="w-full">
             <thead className="bg-[#22272e] text-[8px] font-black text-slate-500 uppercase tracking-widest print:bg-slate-100 print:text-slate-600">
               <tr>
                 <th className="px-4 py-4 text-left">Item</th>
                 <th className="px-4 py-4 text-left">Marca</th>
                 <th className="px-4 py-4 text-center">Qtd</th>
                 <th className="px-4 py-4 text-right">Unit.</th>
                 <th className="px-4 py-4 text-right">Subtotal</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5 print:divide-slate-200">
               {items.map((item: any, i: number) => (
                 <tr key={i} className="print:text-black">
                   <td className="px-4 py-4 text-xs font-bold text-slate-200 print:text-black">{item.description}</td>
                   <td className="px-4 py-4 text-[10px] text-slate-500 print:text-slate-600">{item.brand || '-'}</td>
                   <td className="px-4 py-4 text-center text-xs font-bold">{item.quantity}</td>
                   <td className="px-4 py-4 text-right text-[10px]">R$ {item.price.toFixed(2)}</td>
                   <td className="px-4 py-4 text-right font-black text-white text-xs print:text-black">R$ {(item.price * item.quantity).toFixed(2)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>
    );
  };

  const companyName = os.companyName || 'CRMPLUS';

  return (
    <div className="min-h-screen bg-[#0f1115] p-4 lg:p-10 text-slate-200 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto bg-[#1a1d23] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden print:shadow-none print:border-none print:bg-white print:text-black">
        
        {status !== 'pending' && (
          <div className={`p-4 text-center animate-in slide-in-from-top-full duration-500 ${status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest">
              {status === 'approved' ? 'Aprovado com Sucesso! O sistema já foi notificado.' : 'Orçamento Reprovado.'}
            </p>
          </div>
        )}

        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-[#22272e] to-[#1a1d23] print:bg-none print:border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-6 mb-4">
                {logo ? (
                  <div className="h-16 w-auto flex items-center justify-center transition-all">
                    <img src={logo} className="h-full w-auto object-contain max-w-[200px]" alt="Logo Empresa" />
                  </div>
                ) : (
                  <div className="bg-violet-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl shadow-violet-600/30">
                    {companyName[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xl font-black text-white print:text-black uppercase tracking-tighter">
                  {companyName.split(' ')[0]}
                  <span className="text-violet-500">{companyName.split(' ').slice(1).join(' ') || ''}</span>
                </span>
               </div>
               <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight print:text-black">Orçamento O.S. <span className="text-violet-500">#{os.id}</span></h1>
               <div className="flex items-center gap-4 text-slate-400 font-bold text-[10px]">
                 <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest print:border-slate-200">Emissão: {os.date}</span>
               </div>
            </div>
            <div className="text-right hidden md:block print:block">
               <div className={`w-12 h-12 ml-auto mb-2 rounded-xl border flex items-center justify-center transition-all ${status === 'approved' ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl' : status === 'rejected' ? 'bg-red-500 text-white border-red-500 shadow-xl' : 'bg-white/5 border-white/5 text-emerald-500'}`}>
                 {status === 'approved' ? <ThumbsUp size={24} strokeWidth={3} /> : status === 'rejected' ? <ThumbsDown size={24} strokeWidth={3} /> : <Check size={24} strokeWidth={3} />}
               </div>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                 {status === 'approved' ? 'Aprovado' : status === 'rejected' ? 'Reprovado' : 'Aguardando'}
               </p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4 print:text-black">
          <div className="p-5 bg-[#0f1115] rounded-xl border border-white/5 space-y-4 print:bg-slate-50 print:border-slate-200">
             <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Cliente</p>
              <p className="text-base font-black text-white print:text-black">{os.client}</p>
             </div>
             <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Veículo</p>
              <p className="text-base font-black text-white print:text-black">{os.vehicle} - <span className="text-violet-500">{os.plate}</span></p>
             </div>
          </div>
          <div className="p-5 bg-violet-600/5 border border-violet-500/20 rounded-xl flex flex-col justify-center">
            <p className="text-[8px] font-black text-violet-400 uppercase tracking-widest mb-1">Diagnóstico</p>
            <p className="text-slate-300 font-medium italic text-sm leading-relaxed print:text-slate-600">"{os.description}"</p>
          </div>
        </div>

        <div className="px-8 space-y-8 pb-8">
          <TableSection title="Peças" icon={<Box size={18}/>} items={parts} />
          <TableSection title="Serviços" icon={<Wrench size={18}/>} items={services} />
          <TableSection title="Notas" icon={<Check size={18}/>} items={others} />

          {os.observation && (
            <div className="p-5 bg-[#0f1115] rounded-xl border border-violet-500/20 space-y-2">
               <p className="text-[8px] font-black text-violet-400 uppercase tracking-widest">Observações Técnicas</p>
               <p className="text-slate-300 text-xs leading-relaxed print:text-slate-700 whitespace-pre-wrap">{os.observation}</p>
            </div>
          )}

          <div className="bg-[#0f1115] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/5">
                <div className="space-y-2">
                   <div className="flex justify-between items-center text-slate-500 text-[9px] font-black uppercase">
                      <span>Subtotal</span>
                      <span className="text-white text-xs">R$ {os.total.toFixed(2)}</span>
                   </div>
                </div>
                <div className="md:pl-6 flex flex-col justify-center items-center md:items-end">
                   <p className="text-[8px] font-black text-violet-400 uppercase tracking-widest mb-1">Total</p>
                   <p className="text-4xl font-black text-white tracking-tighter print:text-black">R$ {os.total.toFixed(2)}</p>
                </div>
             </div>
             <div className="bg-white/5 p-4 flex flex-col md:flex-row gap-3 print:hidden border-t border-white/5">
                {status === 'pending' && (
                  <>
                   <button 
                     onClick={() => handleClientAction('Reprovado')} 
                     className="flex-1 py-4 bg-red-600/10 border border-red-500/20 text-red-500 font-black rounded-xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                   >
                     <ThumbsDown size={14} /> Reprovar
                   </button>
                   <button 
                     onClick={() => handleClientAction('Execução')} 
                     className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-xl"
                   >
                     <ThumbsUp size={14} /> Aprovar Orçamento
                   </button>
                  </>
                )}
                {status !== 'pending' && (
                  <button onClick={() => window.print()} className="w-full py-4 bg-white/5 text-slate-400 font-black rounded-xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
                    Imprimir Comprovante
                  </button>
                )}
             </div>
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-[8px] text-slate-700 uppercase tracking-[0.5em] font-black print:hidden">Plataforma Oficial {companyName}</p>
    </div>
  );
};

export default PublicView;
