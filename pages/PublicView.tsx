
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, ThumbsUp, ThumbsDown, Package, Wrench, Calendar, Info, User, Car, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
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
        id: raw.i, client: raw.n, vehicle: raw.v, plate: raw.p, description: raw.d, 
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

  const addClientLog = (action: 'APROVADO' | 'REPROVADO', details: string) => {
    const logs = JSON.parse(localStorage.getItem('crmplus_logs') || '[]');
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('pt-BR'),
      userId: 'CLIENTE',
      userName: 'CLIENTE EXTERNO',
      action,
      details,
      system: 'OFICINA'
    };
    localStorage.setItem('crmplus_logs', JSON.stringify([newLog, ...logs].slice(0, 1000)));
  };

  const handleClientAction = (newStatus: 'Execução' | 'Reprovado') => {
    if (!osDataFromUrl) return;
    const saved = localStorage.getItem('crmplus_oficina_orders');
    if (saved) {
      const orders = JSON.parse(saved);
      const updatedOrders = orders.map((o: any) => o.id === osDataFromUrl.id ? { ...o, status: newStatus } : o);
      localStorage.setItem('crmplus_oficina_orders', JSON.stringify(updatedOrders));
      
      const action = newStatus === 'Execução' ? 'APROVADO' : 'REPROVADO';
      addClientLog(action, `O cliente ${action.toLowerCase()} o orçamento da OS #${osDataFromUrl.id.slice(-4)} (${osDataFromUrl.vehicle})`);
      
      setCurrentStatus(newStatus === 'Execução' ? 'approved' : 'rejected');
      window.dispatchEvent(new Event('storage'));
    }
  };

  if (!osDataFromUrl) return <div className="min-h-screen flex items-center justify-center p-10 text-slate-500 font-black uppercase tracking-[0.3em]">Orçamento não disponível</div>;

  return (
    <div className="min-h-screen p-4 lg:p-12 text-slate-200">
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-1000">
        <div className="bg-[#0a0a0b]/60 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-10 lg:p-14 border-b border-white/5 flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-6 mb-4">
                {logo ? (
                  <img src={logo} className="h-16 w-auto object-contain" alt="Logo" />
                ) : (
                  <div className="bg-gradient-to-br from-cyan-500 to-violet-600 w-16 h-16 rounded-[2rem] flex items-center justify-center font-black text-white text-2xl shadow-lg">
                    {osDataFromUrl.companyName[0]}
                  </div>
                )}
                <span className="text-2xl font-black text-white uppercase tracking-tighter">{osDataFromUrl.companyName}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter">ORÇAMENTO DE <span className="text-cyan-500">SERVIÇO</span></h1>
              <div className="flex flex-wrap gap-4">
                <p className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border border-white/5"><Calendar size={14} className="text-cyan-400"/> {osDataFromUrl.date}</p>
                <p className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border border-white/5">Nº {osDataFromUrl.id.slice(-4)}</p>
              </div>
            </div>
            <div className="bg-black/40 p-8 rounded-[3rem] border border-cyan-500/20 text-center min-w-[240px] shadow-inner">
               <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Investimento Total</p>
               <p className="text-5xl font-black text-white tracking-tighter">R$ {osDataFromUrl.total.toFixed(2)}</p>
            </div>
          </div>
          <div className="p-10 lg:p-14 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-6">
               <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente / Proprietário</p><p className="text-xl font-black text-white uppercase">{osDataFromUrl.client}</p></div>
               <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Veículo Identificado</p><p className="text-xl font-black text-white uppercase">{osDataFromUrl.vehicle} <span className="text-cyan-500 font-mono">[{osDataFromUrl.plate}]</span></p></div>
            </div>
            <div className="p-8 bg-cyan-500/5 border border-cyan-500/10 rounded-[2.5rem] flex flex-col justify-center space-y-4">
              <p className="text-[10px] font-black text-cyan-500/50 uppercase tracking-widest">Diagnóstico Técnico</p>
              <p className="text-slate-300 italic text-sm leading-relaxed">"{osDataFromUrl.description}"</p>
            </div>
          </div>
          {osDataFromUrl.photos.length > 0 && (
            <div className="px-10 lg:px-14 py-8 space-y-6">
               <div className="flex items-center gap-3 px-2 border-l-4 border-cyan-500"><ImageIcon className="text-cyan-500" size={18}/><h3 className="text-[11px] font-black text-white uppercase tracking-widest">Galeria de Fotos</h3></div>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {osDataFromUrl.photos.map((ph: string, i: number) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
                       <img src={ph} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Serviço ${i}`} />
                    </div>
                  ))}
               </div>
            </div>
          )}
          <div className="px-10 lg:px-14 pb-14 space-y-8">
            <div className="bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden">
               <table className="w-full">
                 <thead className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                   <tr><th className="px-8 py-5 text-left">Peça ou Serviço</th><th className="px-8 py-5 text-center">Qtd</th><th className="px-8 py-5 text-right">Valor</th></tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {osDataFromUrl.items.map((item: any, i: number) => (
                     <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-5">
                          <p className="text-sm font-black text-white uppercase">{item.description}</p>
                          <p className="text-[8px] font-black text-slate-600 uppercase mt-1">{item.type}</p>
                       </td>
                       <td className="px-8 py-5 text-center text-sm font-bold text-slate-400 font-mono">x{item.quantity}</td>
                       <td className="px-8 py-5 text-right font-black text-white text-base">R$ {(item.price * item.quantity).toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
            <div className="pt-10 flex flex-col sm:flex-row gap-6">
              {currentStatus === 'pending' ? (
                <>
                  <button onClick={() => handleClientAction('Reprovado')} className="flex-1 py-6 bg-red-600/10 border border-red-500/20 text-red-500 font-black rounded-3xl uppercase text-[11px] tracking-widest hover:bg-red-600 hover:text-white transition-all">Recusar Orçamento</button>
                  <button onClick={() => handleClientAction('Execução')} className="flex-1 py-6 bg-emerald-600 text-white font-black rounded-3xl uppercase text-[11px] tracking-widest shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-95 transition-all">Aprovar e Iniciar</button>
                </>
              ) : (
                <div className={`w-full py-10 text-center font-black rounded-[2.5rem] uppercase text-sm tracking-[0.2em] flex flex-col items-center gap-4 border-2 ${currentStatus === 'approved' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20' : 'bg-red-600/10 text-red-500 border-red-500/20'}`}>
                  {currentStatus === 'approved' ? (
                    <>
                      <CheckCircle2 size={48} className="animate-bounce" />
                      Orçamento Aprovado!
                      <p className="text-[10px] opacity-60 normal-case font-medium">Aguarde, iniciaremos o serviço conforme o diagnóstico.</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={48} />
                      Orçamento Recusado.
                      <p className="text-[10px] opacity-60 normal-case font-medium">Entre em contato conosco para renegociar os itens ou retirar o veículo.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-center pb-10">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Gerado por {osDataFromUrl.companyName}</p>
        </div>
      </div>
    </div>
  );
};

export default PublicView;
