
import React from 'react';
import { useParams } from 'react-router-dom';
import { Car, CheckCircle2, MapPin, Phone, Printer } from 'lucide-react';

const PublicView: React.FC = () => {
  const { data } = useParams();
  
  const os = React.useMemo(() => {
    try {
      return JSON.parse(atob(data || ''));
    } catch (e) {
      return null;
    }
  }, [data]);

  if (!os) return <div className="p-10 text-center font-bold">Orçamento não encontrado ou link inválido.</div>;

  return (
    <div className="min-h-screen bg-white p-6 max-w-3xl mx-auto shadow-xl my-10 rounded-2xl border border-slate-100">
      <div className="flex justify-between items-start border-b border-slate-100 pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase">Orçamento</h1>
          <p className="text-slate-500 font-bold">O.S. #{os.id} • {os.date}</p>
        </div>
        <div className="text-right">
          <h2 className="font-black text-indigo-600">OFICINA PRO</h2>
          <p className="text-xs text-slate-400">Serviço de Qualidade</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Cliente</p>
          <p className="font-bold text-slate-800">{os.client}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Veículo</p>
          <p className="font-bold text-slate-800">{os.vehicle}</p>
          <p className="text-xs font-mono bg-slate-100 inline-block px-2 py-0.5 rounded">{os.plate}</p>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl mb-10 border border-amber-100">
        <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Relato/Problema</p>
        <p className="text-sm text-slate-700 italic">"{os.description}"</p>
      </div>

      <table className="w-full mb-10">
        <thead>
          <tr className="border-b-2 border-slate-900 text-left text-xs uppercase font-black">
            <th className="py-2">Serviço/Peça</th>
            <th className="py-2 text-right">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {os.items.map((item: any, i: number) => (
            <tr key={i}>
              <td className="py-4 text-sm font-medium">{item.description}</td>
              <td className="py-4 text-right font-bold">R$ {item.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-900">
            <td className="py-6 text-right font-black uppercase">Total do Orçamento</td>
            <td className="py-6 text-right text-2xl font-black text-indigo-600">R$ {os.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-4">
        <p className="text-sm text-slate-500 font-medium">Deseja autorizar este serviço?</p>
        <div className="flex justify-center gap-4">
          <a href={`https://wa.me/55${os.phone}?text=Autorizo o orçamento da O.S. #${os.id}`} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Autorizar via WhatsApp</a>
        </div>
      </div>
      
      <button onClick={() => window.print()} className="mt-8 w-full py-3 text-slate-400 text-xs font-bold uppercase flex items-center justify-center gap-2 hover:text-indigo-600 print:hidden">
        <Printer size={14} /> Imprimir Orçamento
      </button>
    </div>
  );
};

export default PublicView;
