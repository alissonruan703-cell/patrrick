
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, Check, Plus, Box, Wrench, ThumbsUp, ThumbsDown, AlertCircle, Camera, Search } from 'lucide-react';

const PublicView: React.FC = () => {
  const { data } = useParams();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  const os = React.useMemo(() => {
    try {
      const decoded = decodeURIComponent(escape(atob(data || '')));
      const raw = JSON.parse(decoded);
      
      // Traduzindo chaves curtas de volta para o formato original
      return {
        id: raw.i,
        client: raw.n,
        vehicle: raw.v,
        plate: raw.p,
        description: raw.d,
        observation: raw.o,
        total: raw.t,
        date: raw.dt,
        companyName: raw.cn,
        companyLogo: raw.cl,
        items: (raw.it || []).map((item: any) => ({
          type: item.t === 'P' ? 'PEÇA' : item.t === 'M' ? 'MÃO DE OBRA' : 'NOTA',
          description: item.d,
          brand: item.b,
          quantity: item.q,
          price: item.p
        })),
        photos: raw.ph || [] // Fotos agora são opcionais no link para economizar espaço
      };
    } catch (e) {
      return null;
    }
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
    }
  };

  if (!os) return <div className="p-20 text-center text-slate-500 font-black uppercase tracking-widest">Link expirado ou inválido.</div>;

  const parts = os.items.filter((i: any) => i.type === 'PEÇA');
  const services = os.items.filter((i: any) => i.type === 'MÃO DE OBRA');
  const others = os.items.filter((i: any) => i.type === 'NOTA');

  const totalParts = parts.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0);
  const totalServices = services.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0);
  const totalOthers = others.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0);

  const TableSection = ({ title, icon, items }: any) => {
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
           </table>
        </div>
      </div>
    );
  };

  const companyName = os.companyName || 'CRMPlus+';
  const companyLogo = os.companyLogo || '';

  return (
    <div className="min-h-screen bg-[#0f1115] p-4 lg:p-20 text-slate-200 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto bg-[#1a1d23] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden print:shadow-none print:border-none print:bg-white print:text-black">
        
        {status !== 'pending' && (
          <div className={`p-4 text-center animate-in slide-in-from-top-full duration-500 ${status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            <p className="text-xs font-black uppercase tracking-[0.2em]">
              {status === 'approved' ? 'Orçamento Aprovado com Sucesso!' : 'Orçamento Reprovado.'}
            </p>
          </div>
        )}

        <div className="p-10 border-b border-white/5 bg-gradient-to-br from-[#22272e] to-[#1a1d23] print:bg-none print:border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-4 mb-6">
                {companyLogo ? (
                   <div className="bg-white/10 p-2 rounded-2xl border border-white/10 w-20 h-20 flex items-center justify-center overflow-hidden print:border-slate-200 shadow-xl">
                      <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
                   </div>
                ) : (
                   <div className="bg-violet-600 p-2 rounded-lg print:hidden"><Plus size={20} className="text-white" /></div>
                )}
                <span className="text-2xl font-black text-white print:text-black uppercase tracking-tighter">
                  {companyName.split(' ')[0]}
                  <span className="text-violet-500">{companyName.split(' ').slice(1).join(' ') || '+'}</span>
                </span>
               </div>
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none print:text-black">Orçamento de Serviço <br/><span className="text-violet-500 text-2xl tracking-normal">Documento O.S. #{os.id}</span></h1>
               <div className="flex items-center gap-4 text-slate-400 font-bold text-xs">
                 <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest print:border-slate-200">Emissão: {os.date}</span>
               </div>
            </div>
            
            <div className="text-right hidden md:block print:block">
               <div className={`w-16 h-16 ml-auto mb-4 rounded-2xl border flex items-center justify-center transition-all ${status === 'approved' ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl' : status === 'rejected' ? 'bg-red-500 text-white border-red-500 shadow-xl' : 'bg-white/5 border-white/5 text-emerald-500'}`}>
                 {status === 'approved' ? <ThumbsUp size={32} strokeWidth={3} /> : status === 'rejected' ? <ThumbsDown size={32} strokeWidth={3} /> : <Check size={32} strokeWidth={3} />}
               </div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-slate-400">
                 {status === 'approved' ? 'Aprovado pelo Cliente' : status === 'rejected' ? 'Reprovado pelo Cliente' : 'Aguardando Aprovação'}
               </p>
            </div>
          </div>
        </div>

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
            <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-1">Diagnóstico Técnico</p>
            <p className="text-slate-300 font-medium italic text-base leading-relaxed print:text-slate-600">"{os.description}"</p>
          </div>
        </div>

        <div className="px-10 space-y-10 pb-10">
          <TableSection title="Peças e Componentes" icon={<Box size={20}/>} items={parts} />
          <TableSection title="Mão de Obra e Serviços" icon={<Wrench size={20}/>} items={services} />
          <TableSection title="Outros / Notas" icon={<Check size={20}/>} items={others} />

          {/* Galeria de Fotos da OS (Apenas se inclusas no link) */}
          {os.photos && os.photos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                 <Camera className="text-violet-500" size={20} />
                 <h3 className="text-sm font-black text-white uppercase tracking-widest print:hidden">Registros Fotográficos</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
                {os.photos.map((photo: string, i: number) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/5 bg-black/40 group relative">
                    <img src={photo} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={`Foto ${i}`} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Search size={24} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {os.observation && (
            <div className="p-6 bg-[#0f1115] rounded-2xl border border-violet-500/20 space-y-3 print:bg-slate-50 print:border-slate-200">
               <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest print:text-slate-500">Observações do Orçamento</p>
               <p className="text-slate-300 text-sm leading-relaxed print:text-slate-700 whitespace-pre-wrap">{os.observation}</p>
            </div>
          )}

          <div className="bg-[#0f1115] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/5">
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <span>Total em Peças</span>
                      <span className="text-white text-sm">R$ {totalParts.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <span>Total em Serviços</span>
                      <span className="text-white text-sm">R$ {totalServices.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <span>Outras Taxas</span>
                      <span className="text-white text-sm">R$ {totalOthers.toFixed(2)}</span>
                   </div>
                </div>
                
                <div className="md:pl-8 flex flex-col justify-center items-center md:items-end">
                   <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.4em] mb-2 print:text-slate-500">Valor Total do Investimento</p>
                   <p className="text-5xl font-black text-white tracking-tighter print:text-black">R$ {os.total.toFixed(2)}</p>
                </div>
             </div>
             
             <div className="bg-white/5 p-6 flex flex-col md:flex-row gap-4 print:hidden border-t border-white/5">
                <button onClick={() => window.print()} className="flex-1 py-4 bg-white/5 border border-white/10 text-slate-400 font-black rounded-xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                   <Printer size={16} /> Versão para PDF
                </button>
                
                {status === 'pending' && (
                  <>
                   <button 
                     onClick={() => handleClientAction('Reprovado')} 
                     className="flex-1 py-4 bg-red-600/10 border border-red-500/20 text-red-500 font-black rounded-xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-600/10"
                   >
                     <ThumbsDown size={16} /> Reprovar Orçamento
                   </button>
                   <button 
                     onClick={() => handleClientAction('Execução')} 
                     className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20"
                   >
                     <ThumbsUp size={16} /> Aprovar Agora
                   </button>
                  </>
                )}
             </div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-[10px] text-slate-700 uppercase tracking-[0.5em] font-black print:hidden">Excelência e Transparência • Plataforma {companyName}</p>
    </div>
  );
};

export default PublicView;
