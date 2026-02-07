
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, ThumbsUp, ThumbsDown, Package, Wrench, Calendar, Info, User, Car, Image as ImageIcon, AlertCircle } from 'lucide-react';

const PublicView: React.FC = () => {
  const { data } = useParams();
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [logo, setLogo] = useState('');
  
  const osDataFromUrl = useMemo(() => {
    try {
      const decoded = decodeURIComponent(escape(atob(data || '')));
      const raw = JSON.parse(decoded);
      return { 
        id: raw.i, client: raw.n, vehicle: raw.v, plate: raw.p, description: raw.d, 
        total: raw.t, date: raw.dt, companyName: raw.cn || 'CRMPLUS',
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
    if (!osDataFromUrl) return;
    const saved = localStorage.getItem('crmplus_oficina_orders');
    if (saved) {
      const orders = JSON.parse(saved);
      localStorage.setItem('crmplus_oficina_orders', JSON.stringify(orders.map((o: any) => o.id === osDataFromUrl.id ? { ...o, status: newStatus } : o)));
      setCurrentStatus(newStatus === 'Execução' ? 'approved' : 'rejected');
      window.dispatchEvent(new Event('storage'));
    }
  };

  if (!osDataFromUrl) return <div className="min-h-screen bg-[#050505] flex items-center justify-center p-10 text-slate-500 font-black">Orçamento Inválido</div>;

  return (
    <div className="min-h-screen bg-[#050505] p-4 lg:p-12 text-slate-200">
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-1000">
        
        <div className="bg-[#0a0a0a] rounded-[4rem] border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-10 lg:p-14 border-b border-white/5 flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-6 mb-4">
                {logo ? <img src={logo} className="h-16 w-auto" /> : <div className="bg-violet-600 w-16 h-16 rounded-[2rem] flex items-center justify-center font-black text-white text-2xl">{osDataFromUrl.companyName[0]}</div>}
                <span className="text-2xl font-black text-white uppercase">{osDataFromUrl.companyName}</span>
              </div>
              {/* Fix: Corrected variable name from osDataDataFromUrl to osDataFromUrl */}
              <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter">ORÇAMENTO <span className="text-violet-500">#{osDataFromUrl.id.slice(-4)}</span></h1>
              <p className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2"><Calendar size={14}/> {osDataFromUrl.date}</p>
            </div>
            <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5 text-center min-w-[240px]">
               <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">Total</p>
               <p className="text-5xl font-black text-white tracking-tighter">R$ {osDataFromUrl.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="p-10 lg:p-14 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-6">
               <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</p><p className="text-xl font-black text-white">{osDataFromUrl.client}</p></div>
               <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Veículo</p><p className="text-xl font-black text-white uppercase">{osDataFromUrl.vehicle} [{osDataFromUrl.plate}]</p></div>
            </div>
            <div className="p-8 bg-violet-600/5 border border-violet-500/10 rounded-[2.5rem] flex flex-col justify-center space-y-4">
              <p className="text-slate-300 italic text-sm leading-relaxed">"{osDataFromUrl.description}"</p>
            </div>
          </div>

          {/* Galeria de Fotos no Link do Cliente */}
          {osDataFromUrl.photos.length > 0 && (
            <div className="px-10 lg:px-14 py-8 space-y-6">
               <div className="flex items-center gap-3 px-2 border-l-4 border-cyan-500"><ImageIcon className="text-cyan-500" size={18}/><h3 className="text-[11px] font-black text-white uppercase tracking-widest">Fotos do Serviço</h3></div>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Corrected: Accessing ph.url property as osDataFromUrl.photos contains objects of type PhotoWithObs */}
                  {osDataFromUrl.photos.map((ph: any, i: number) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                       <img src={ph.url} className="w-full h-full object-cover" />
                    </div>
                  ))}
               </div>
            </div>
          )}

          <div className="px-10 lg:px-14 pb-14 space-y-8">
            <div className="bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden">
               <table className="w-full">
                 <thead className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                   <tr><th className="px-8 py-5 text-left">Item</th><th className="px-8 py-5 text-center">Qtd</th><th className="px-8 py-5 text-right">Subtotal</th></tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {osDataFromUrl.items.map((item: any, i: number) => (
                     <tr key={i} className="hover:bg-white/[0.02]">
                       <td className="px-8 py-5 text-sm font-black text-white uppercase">{item.description}</td>
                       <td className="px-8 py-5 text-center text-sm font-bold text-slate-400">{item.quantity}</td>
                       <td className="px-8 py-5 text-right font-black text-white text-base">R$ {(item.price * item.quantity).toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>

            <div className="pt-10 flex flex-col sm:flex-row gap-6">
              {currentStatus === 'pending' ? (
                <>
                  <button onClick={() => handleClientAction('Reprovado')} className="flex-1 py-6 bg-red-600/10 border border-red-500/20 text-red-500 font-black rounded-3xl uppercase text-[11px]">Rejeitar</button>
                  <button onClick={() => handleClientAction('Execução')} className="flex-1 py-6 bg-emerald-600 text-white font-black rounded-3xl uppercase text-[11px] shadow-xl">Aprovar Orçamento</button>
                </>
              ) : (
                <div className={`w-full py-6 text-center font-black rounded-3xl uppercase text-[11px] ${currentStatus === 'approved' ? 'bg-emerald-600/10 text-emerald-500' : 'bg-red-600/10 text-red-500'}`}>
                  {currentStatus === 'approved' ? 'Orçamento Aprovado!' : 'Orçamento Reprovado.'}
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
