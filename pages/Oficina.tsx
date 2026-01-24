
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Clock, CheckCircle2, 
  X, ChevronRight, Camera, Save, 
  Send, User, Car, FileText, 
  Package, Wrench, History, Trash2,
  PlusCircle, AlertCircle, BrainCircuit
} from 'lucide-react';
import { getDiagnosticHelp } from '../services/geminiService';
import { ServiceOrder, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const [view, setView] = useState<'lista' | 'nova' | 'detalhes'>('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState('');

  // Dados Simulados (Aqui integraria com o Vercel Blob)
  const [orders, setOrders] = useState<ServiceOrder[]>([
    {
      id: '101',
      clientName: 'João Ferreira',
      phone: '11 98888-7777',
      vehicle: 'Fiat Uno Mile',
      plate: 'DFE-4567',
      description: 'Barulho na suspensão dianteira ao passar em buracos.',
      status: 'Execução',
      createdAt: '2024-05-10',
      total: 350,
      items: [
        { id: 'i1', type: 'PEÇA', description: 'Amortecedor Dianteiro', quantity: 2, price: 150, timestamp: '2024-05-10 14:00' },
        { id: 'i2', type: 'MÃO DE OBRA', description: 'Troca de amortecedores', quantity: 1, price: 50, timestamp: '2024-05-10 15:30' }
      ]
    },
    {
      id: '102',
      clientName: 'Ana Paula',
      phone: '11 97777-6666',
      vehicle: 'Honda Fit',
      plate: 'GHI-1234',
      description: 'Revisão de 60.000km.',
      status: 'Aberto',
      createdAt: '2024-05-12',
      total: 0,
      items: []
    }
  ]);

  // Busca inteligente (Histórico e Atuais)
  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchTerm]);

  // Função para adicionar nova linha de serviço/peça
  const addItem = (type: ServiceItem['type']) => {
    if (!selectedOS) return;
    const desc = prompt(`Descrição da ${type}:`);
    if (!desc) return;
    
    let price = 0;
    let qty = 1;
    
    if (type !== 'NOTA') {
      price = parseFloat(prompt('Valor unitário:') || '0');
      qty = parseInt(prompt('Quantidade:') || '1');
    }

    const newItem: ServiceItem = {
      id: Date.now().toString(),
      type,
      description: desc,
      quantity: qty,
      price: price,
      timestamp: new Date().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedItems = [...selectedOS.items, newItem];
    const newTotal = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const updatedOS = { ...selectedOS, items: updatedItems, total: newTotal };
    setSelectedOS(updatedOS);
    setOrders(orders.map(o => o.id === selectedOS.id ? updatedOS : o));
  };

  const handleCreateOS = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nova: ServiceOrder = {
      id: (orders.length + 101).toString(),
      clientName: formData.get('nome') as string,
      phone: formData.get('tel') as string,
      vehicle: formData.get('veiculo') as string,
      plate: (formData.get('placa') as string).toUpperCase(),
      description: formData.get('problema') as string,
      status: 'Aberto',
      createdAt: new Date().toISOString().split('T')[0],
      total: 0,
      items: []
    };
    setOrders([nova, ...orders]);
    setView('lista');
  };

  const getAiHelp = async () => {
    if (!selectedOS) return;
    setIsAiLoading(true);
    const help = await getDiagnosticHelp(selectedOS.description);
    setAiTip(help || '');
    setIsAiLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* HEADER SIMPLES */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Oficina Digital</h1>
          <p className="text-sm text-slate-500">Gestão simplificada de atendimentos.</p>
        </div>
        <button 
          onClick={() => setView('nova')}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} /> Nova O.S.
        </button>
      </div>

      {/* BUSCA / HISTÓRICO */}
      {view === 'lista' && (
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Digite a PLACA ou NOME para buscar no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm text-lg"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredOrders.map(order => (
              <div 
                key={order.id}
                onClick={() => { setSelectedOS(order); setView('detalhes'); }}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${order.status === 'Entregue' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Car size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{order.plate}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${order.status === 'Pronto' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mt-1">{order.clientName} - {order.vehicle}</h3>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className="hidden sm:block">
                    <p className="text-sm font-black text-slate-900">R$ {order.total.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">{order.createdAt}</p>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TELA DE CADASTRO */}
      {view === 'nova' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
          <form onSubmit={handleCreateOS}>
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Abrir Novo Atendimento</h2>
              <button type="button" onClick={() => setView('lista')} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nome do Cliente</label>
                  <input name="nome" required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                  <input name="tel" required type="text" placeholder="(00) 00000-0000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Veículo (Modelo/Ano)</label>
                  <input name="veiculo" required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Placa</label>
                  <input name="placa" required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Relato do Defeito</label>
                <textarea name="problema" required rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Motor falhando, barulho na suspensão..."></textarea>
              </div>
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center hover:border-indigo-400 cursor-pointer group">
                <Camera className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-2" />
                <span className="text-xs text-slate-500">Adicionar Foto do Veículo / Peça</span>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
              <button type="button" onClick={() => setView('lista')} className="flex-1 py-4 font-bold text-slate-500">Cancelar</button>
              <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg">Salvar Atendimento</button>
            </div>
          </form>
        </div>
      )}

      {/* DETALHES E ACOMPANHAMENTO (O CORAÇÃO DO SISTEMA) */}
      {view === 'detalhes' && selectedOS && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
          
          {/* COLUNA ESQUERDA: EXECUÇÃO (LINHAS) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setView('lista')} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight className="rotate-180" size={20}/></button>
                  <h2 className="text-xl font-black text-slate-900">#OS-{selectedOS.id}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedOS.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      const updated = { ...selectedOS, status: newStatus };
                      setSelectedOS(updated);
                      setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-sm outline-none border-none"
                  >
                    <option>Aberto</option>
                    <option>Orçamento</option>
                    <option>Execução</option>
                    <option>Pronto</option>
                    <option>Entregue</option>
                  </select>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* DADOS DO CLIENTE RESUMIDOS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Cliente</p>
                    <p className="text-sm font-bold">{selectedOS.clientName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Veículo</p>
                    <p className="text-sm font-bold">{selectedOS.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Placa</p>
                    <p className="text-sm font-mono font-bold text-indigo-600">{selectedOS.plate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Entrada</p>
                    <p className="text-sm font-bold">{selectedOS.createdAt}</p>
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO RÁPIDA (AS FUNÇÕES QUE O USUÁRIO QUER ADICIONAR) */}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => addItem('PEÇA')} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-100 transition-colors">
                    <Package size={14}/> + Peça
                  </button>
                  <button onClick={() => addItem('MÃO DE OBRA')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-xs hover:bg-emerald-100 transition-colors">
                    <Wrench size={14}/> + Mão de Obra
                  </button>
                  <button onClick={() => addItem('NOTA')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors">
                    <FileText size={14}/> + Observação
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors">
                    <Camera size={14}/> Add Foto
                  </button>
                </div>

                {/* LINHAS DE EXECUÇÃO */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Linhas de Atendimento</h3>
                  {selectedOS.items.length > 0 ? (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                          <tr>
                            <th className="px-4 py-3">Descrição / Item</th>
                            <th className="px-4 py-3 text-center">Qtd</th>
                            <th className="px-4 py-3 text-right">Valor</th>
                            <th className="px-4 py-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {selectedOS.items.map(item => (
                            <tr key={item.id} className="group">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold ${item.type === 'PEÇA' ? 'bg-indigo-100 text-indigo-600' : item.type === 'MÃO DE OBRA' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200'}`}>
                                    {item.type}
                                  </span>
                                  <span className="font-medium text-slate-700">{item.description}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-slate-500">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-slate-500">R$ {item.price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-bold text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 text-sm italic">Nenhum serviço ou peça adicionada ainda.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: RESUMO E IA */}
          <div className="space-y-6">
            {/* TOTAL E ORÇAMENTO */}
            <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl shadow-indigo-100">
              <p className="text-indigo-200 text-xs font-bold uppercase mb-2">Total Estimado</p>
              <h3 className="text-4xl font-black mb-6">R$ {selectedOS.total.toFixed(2)}</h3>
              <div className="space-y-3">
                <button className="w-full py-4 bg-white text-indigo-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all">
                  <Send size={18}/> Enviar Orçamento
                </button>
                <button className="w-full py-3 bg-indigo-800 text-indigo-200 font-bold rounded-xl flex items-center justify-center gap-2 text-sm">
                  <FileText size={16}/> Gerar PDF / Recibo
                </button>
              </div>
            </div>

            {/* APOIO IA */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <BrainCircuit size={20}/>
                <h3 className="font-bold">Assistente Técnico</h3>
              </div>
              <p className="text-xs text-slate-500">Clique abaixo para receber uma análise técnica baseada no defeito relatado.</p>
              <button 
                onClick={getAiHelp}
                disabled={isAiLoading}
                className="w-full py-3 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm flex items-center justify-center gap-2"
              >
                {isAiLoading ? 'Analisando...' : 'Consultar Diagnóstico IA'}
              </button>
              {aiTip && (
                <div className="p-4 bg-indigo-50 rounded-2xl text-xs text-slate-700 italic border border-indigo-100 leading-relaxed">
                  {aiTip}
                </div>
              )}
            </div>

            {/* HISTÓRICO RÁPIDO DO VEÍCULO */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <History size={18} className="text-slate-400"/> Histórico do Carro
              </h3>
              <div className="space-y-3">
                {orders.filter(o => o.plate === selectedOS.plate && o.id !== selectedOS.id).length > 0 ? (
                  orders.filter(o => o.plate === selectedOS.plate && o.id !== selectedOS.id).map(prev => (
                    <div 
                      key={prev.id} 
                      onClick={() => setSelectedOS(prev)}
                      className="p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 cursor-pointer border border-transparent hover:border-indigo-100 transition-all"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-400">#OS-{prev.id}</span>
                        <span className="text-[10px] font-bold text-slate-500">{prev.createdAt}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate">{prev.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhuma passagem anterior.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;
