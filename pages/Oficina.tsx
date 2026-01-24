
import React, { useState } from 'react';
import { 
  Plus, 
  Car, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BrainCircuit,
  ClipboardList,
  MoreVertical,
  ChevronRight,
  Filter
} from 'lucide-react';
import { getDiagnosticHelp } from '../services/geminiService';
import { ServiceOrder } from '../types';

const Oficina: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'clients'>('dashboard');
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState(false);
  const [symptomInput, setSymptomInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const [orders] = useState<ServiceOrder[]>([
    { id: '1', clientName: 'Ricardo Oliveira', vehicle: 'Toyota Corolla 2022', plate: 'ABC-1234', description: 'Troca de óleo e filtros', status: 'Em Andamento', date: '2023-10-25', total: 450.00 },
    { id: '2', clientName: 'Maria Silva', vehicle: 'Hyundai HB20', plate: 'XYZ-5678', description: 'Revisão freios dianteiros', status: 'Pendente', date: '2023-10-26', total: 320.00 },
    { id: '3', clientName: 'Carlos Santos', vehicle: 'Honda Civic', plate: 'KKK-9900', description: 'Alinhamento e balanceamento', status: 'Concluído', date: '2023-10-24', total: 180.00 },
  ]);

  const handleAIDiagnostic = async () => {
    if (!symptomInput) return;
    setIsDiagnosticLoading(true);
    setAiResponse('');
    const help = await getDiagnosticHelp(symptomInput);
    setAiResponse(help || 'Não foi possível obter resposta.');
    setIsDiagnosticLoading(false);
  };

  const stats = [
    { label: 'O.S. Pendentes', value: '12', icon: <Clock className="text-amber-500" />, bg: 'bg-amber-50' },
    { label: 'Em Andamento', value: '08', icon: <AlertCircle className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Concluídas (Hoje)', value: '05', icon: <CheckCircle2 className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { label: 'Faturamento Mês', value: 'R$ 14.2k', icon: <CheckCircle2 className="text-indigo-500" />, bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="text-indigo-600" /> Oficina Mecânica
          </h1>
          <p className="text-sm text-slate-500">Gestão de serviços e manutenção veicular.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all text-sm">
            <Plus size={18} />
            Nova O.S.
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Visão Geral
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'orders' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Ordens de Serviço
        </button>
        <button 
          onClick={() => setActiveTab('clients')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'clients' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Clientes
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gemini AI Assistant Section */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <div className="p-2 bg-indigo-600 text-white rounded-lg">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Assistente de Diagnóstico</h3>
                  <p className="text-xs text-slate-500">Powered by Gemini AI</p>
                </div>
              </div>
              <div className="p-6 flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Descreva os sintomas do veículo</label>
                <textarea 
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="Ex: Carro morrendo em marcha lenta e cheiro de gasolina no escapamento..."
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none min-h-[120px] transition-all"
                />
                <button 
                  onClick={handleAIDiagnostic}
                  disabled={isDiagnosticLoading || !symptomInput}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200"
                >
                  {isDiagnosticLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></div>
                      Analisando...
                    </>
                  ) : (
                    <>
                      <BrainCircuit size={18} />
                      Gerar Sugestão Técnica
                    </>
                  )}
                </button>

                {aiResponse && (
                  <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-bold text-indigo-700 uppercase mb-2 flex items-center gap-1.5">
                      <CheckCircle2 size={12} />
                      Sugestão do Assistente:
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed italic">
                      "{aiResponse}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Ordens de Serviço Recentes</h3>
                <button className="text-sm text-indigo-600 font-semibold hover:underline">Ver todas</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">O.S. / Cliente</th>
                      <th className="px-6 py-4">Veículo</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">#OS-{order.id.padStart(4, '0')}</p>
                          <p className="text-xs text-slate-500">{order.clientName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-700">{order.vehicle}</p>
                          <p className="text-xs font-mono text-indigo-600 bg-indigo-50 inline-block px-1.5 rounded uppercase">{order.plate}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`
                            px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                            ${order.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' : 
                              order.status === 'Em Andamento' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}
                          `}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                <p className="text-xs text-center text-slate-400 font-medium italic">
                  Mostrando as 3 ordens mais recentes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Módulo de Listagem de OS</h2>
          <p className="text-slate-500 mb-6">Em breve: Filtros avançados, impressão em PDF e integração com faturamento.</p>
          <button 
             onClick={() => setActiveTab('dashboard')}
             className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200"
          >
            Voltar ao Início
          </button>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <Users size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Gestão de Clientes</h2>
          <p className="text-slate-500 mb-6">Em breve: Histórico de manutenções por cliente, alertas de retorno e WhatsApp integrado.</p>
          <button 
             onClick={() => setActiveTab('dashboard')}
             className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200"
          >
            Voltar ao Início
          </button>
        </div>
      )}
    </div>
  );
};

const Wrench = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export default Oficina;
