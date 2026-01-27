
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, Check, Box, Wrench, ThumbsUp, ThumbsDown, Package, FileText, Calendar, Info, ShieldCheck, AlertCircle, User, Car } from 'lucide-react';

const PublicView: React.FC = () => {
  const { data } = useParams();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [logo, setLogo] = useState('');
  
  const os = React.useMemo(() => {
    try {
      const decoded = decodeURIComponent(escape(atob(data || '')));
      const raw = JSON.parse(decoded);
      return { id: raw.i, client: raw.n, vehicle: raw.v, plate: raw.p, description: raw.d, observation: raw.o, total: raw.t, date: raw.dt, companyName: raw.cn || 'CRMPLUS' };
    } catch (e) { return null; }
  }, [data]);

  useEffect(() => {
    const savedConfig = localStorage.getItem('crmplus_system_config');
    if (savedConfig) setLogo(JSON.parse(savedConfig).companyLogo || '');
  }, []);

  const items = React.useMemo(() => {
     if (!data) return [];
     try {
       const decoded = decodeURIComponent(escape(atob(data)));
       const raw = JSON.parse(decoded);
       return (raw.it || []).map((item: any) => ({
          type: item.t === 'P' ? 'PEÇA' : item.t === 'M' ? 'MÃO DE OBRA' : 'NOTA',
          description: item.d, brand: item.b, quantity: item.q, price: item.p
        }));
     } catch(e) { return []; }
  }, [data]);

  const handleClientAction = (newStatus: 'Execução' | 'Reprovado') => {
    if (!os) return;
    setStatus(newStatus === 'Execução' ? 'approved' : 'rejected');
    const saved = localStorage.getItem('crmplus_oficina_orders');
    if (saved) {
      const orders = JSON.parse(saved);
      const updated = orders.map((o: any) => String(o.id) === String(os.id) ? { ...o, status: newStatus } : o);
      localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  if (!os) return <div className="min-h-screen bg-[#050505] flex items-center justify-center p-10"><div className="text-center space-y-6"><AlertCircle size={64} className="mx-auto text-red-500 opacity-50"/><p className="text-slate-500 font-black uppercase tracking-widest text-sm">Link de orçamento inválido ou expirado.</p></div></div>;

  const TableSection = ({ title, icon, items }: any) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 border-l-4 border-violet-500"><div className="text-violet-500">{icon}</div><h3 className="text-[11px] font-black text-white uppercase tracking-widest print:text-black">{title}</h3></div>
        <div className="bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden print:border-slate-200 shadow-xl">
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest print:bg-slate-100 print:text-slate-600">
                 <tr>
                   <th className="px-8 py-5 text-left">Item / Descrição</th>
                   <th className="px-8 py-5 text-center">Qtd</th>
                   <th className="px-8 py-5 text-right">Preço</th>
                   <th className="px-8 py-5 text-right">Subtotal</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5 print:divide-slate-200">
                 {items.map((item: any, i: number) => (
                   <tr key={i} className="print:text-black hover:bg-white/[0.02] transition-colors">
                     <td className="px-8 py-5"><p className="text-sm font-black text-white print:text-black uppercase">{item.description}</p><p className="text-[9px] text-slate-500 font-bold uppercase">{item.brand || '-'}</p></td>
                     <td className="px-8 py-5 text-center text-sm font-bold text-slate-400">{item.quantity}</td>
                     <td className="px-8 py-5 text-right text-[10px] text-slate-500">R$ {item.price.toFixed(2)}</td>
                     <td className="px-8 py-5 text-right font-black text-white text-base print:text-black">R$ {(item.price * item.quantity).toFixed(2)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] p-4 lg:p-12 text-slate-200 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-1000">
        
        {/* Banner de Feedback de Aprovação */}
        {status !== 'pending' && (
          <div className={`p-6 rounded-3xl text-center shadow-2xl animate-in slide-in-from-top-10 duration-500 ${status === 'approved' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-red-600 shadow-red-600/20'}`}>
            <div className="flex items-center justify-center gap-4">
               {status === 'approved' ? <ThumbsUp size={24} className="animate-bounce" /> : <ThumbsDown size={24} />}
               <p className="text-xs font-black uppercase tracking-[0.3em]">
                 {status === 'approved' ? 'Orçamento Aprovado! Nossa equipe iniciará o serviço em breve.' : 'Orçamento Reprovado. Entraremos em contato.'}
               </p>
            </div>
          </div>
        )}

        <div className="bg-[#0a0a0a] rounded-[4rem] border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.1)] overflow-hidden print:shadow-none print:border-none print:bg-white print:text-black">
          {/* Header */}
          <div className="p-10 lg:p-14 border-b border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent print:bg-none print:border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10">
              <div className="space-y-6">
                 <div className="flex items-center gap-6 mb-8">
                  {logo ? (
                    <div className="h-20 w-auto flex items-center justify-center"><img src={logo} className="h-full w-auto object-contain max-w-[240px]" /></div>
                  ) : (
                    <div className="bg-violet-600 w-16 h-16 rounded-[2rem] flex items-center justify-center text-2xl font-black text-white shadow-2xl shadow-violet-600/30">
                      {os.companyName[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-2xl font-black text-white print:text-black uppercase tracking-tighter">
                    {os.companyName.split(' ')[0]} <span className="text-violet-500">{os.companyName.split(' ').slice(1).join(' ')}</span>
                  </span>
                 </div>
                 <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none print:text-black">ORÇAMENTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-magenta-500">#{os.id}</span></h1>
                 <div className="flex items-center gap-4 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                   <span className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 print:border-slate-200 flex items-center gap-2"><Calendar size={14}/> Emitido em: {os.date}</span>
                 </div>
              </div>
              <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5 text-center min-w-[240px] shadow-inner print:border-slate-200">
                 <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">Total Investimento</p>
                 <p className="text-5xl font-black text-white tracking-tighter print:text-black">R$ {os.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Dados do Cliente / Veículo */}
          <div className="p-10 lg:p-14 grid grid-cols-1 md:grid-cols-2 gap-10 print:gap-6 print:text-black">
            <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl print:bg-slate-50 print:border-slate-200">
               {/* Add missing User and Car icons to imports and use them below */}
               <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><User size={12}/> Proprietário</p><p className="text-xl font-black text-white print:text-black uppercase">{os.client}</p></div>
               <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Car size={12}/> Veículo</p><p className="text-xl font-black text-white print:text-black uppercase">{os.vehicle} <span className="text-violet-500 font-mono tracking-widest ml-2">[{os.plate}]</span></p></div>
            </div>
            <div className="p-8 bg-violet-600/5 border border-violet-500/10 rounded-[2.5rem] flex flex-col justify-center space-y-4">
              <div className="flex items-center gap-3 text-violet-400"><Info size={20}/><p className="text-[10px] font-black uppercase tracking-widest">Diagnóstico Técnico</p></div>
              <p className="text-slate-300 font-medium italic text-sm leading-relaxed print:text-slate-600">"{os.description}"</p>
            </div>
          </div>

          {/* Tabelas de Itens */}
          <div className="px-10 lg:px-14 pb-14 space-y-12">
            <TableSection title="Peças e Produtos" icon={<Package size={18}/>} items={items.filter((i: any) => i.type === 'PEÇA')} />
            <TableSection title="Mão de Obra e Serviços" icon={<Wrench size={18}/>} items={items.filter((i: any) => i.type === 'MÃO DE OBRA')} />
            
            {os.observation && (
              <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
                 <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2"><FileText size={16}/> Observações Adicionais</p>
                 <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap uppercase font-bold tracking-tight">{os.observation}</p>
              </div>
            )}

            {/* Ações de Aprovação */}
            <div className="pt-10 flex flex-col sm:flex-row gap-6 print:hidden">
              {status === 'pending' ? (
                <>
                  <button onClick={() => handleClientAction('Reprovado')} className="flex-1 py-6 bg-red-600/10 border border-red-500/20 text-red-500 font-black rounded-[2rem] uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95">
                    <ThumbsDown size={18} /> Reprovar Orçamento
                  </button>
                  <button onClick={() => handleClientAction('Execução')} className="flex-1 py-6 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black rounded-[2rem] uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-4 hover:brightness-125 transition-all shadow-[0_15px_40px_rgba(16,185,129,0.3)] active:scale-95">
                    <ThumbsUp size={18} /> Aprovar e Iniciar Serviço
                  </button>
                </>
              ) : (
                <button onClick={() => window.print()} className="w-full py-6 bg-white/5 border border-white/10 text-white font-black rounded-[2rem] uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white/10 transition-all">
                  <Printer size={18} /> Imprimir Comprovante de {status === 'approved' ? 'Aprovação' : 'Recusa'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center space-y-6 py-10 print:hidden">
          <div className="flex items-center justify-center gap-4 text-slate-700 font-black text-[9px] uppercase tracking-[0.5em]">
             <ShieldCheck size={16} className="text-emerald-500" /> Plataforma Segura {os.companyName}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicView;
