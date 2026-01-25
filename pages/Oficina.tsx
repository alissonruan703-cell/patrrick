
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, Clock, CheckCircle2, 
  X, ChevronRight, Camera, Save, 
  Send, User, Car, FileText, 
  Package, Wrench, History, Trash2,
  PlusCircle, AlertCircle, BrainCircuit,
  Image as ImageIcon, Edit3, LayoutDashboard,
  Printer, TrendingUp, Users, ClipboardList,
  Sparkles, Wand2, Lightbulb, Timer
} from 'lucide-react';
import { getDiagnosticHelp, extractOSData } from '../services/geminiService';
import { ServiceOrder, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ativos' | 'historico'>('ativos');
  const [view, setView] = useState<'lista' | 'nova' | 'detalhes' | 'editar'>('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  
  // Estados para formulário
  const [autofillText, setAutofillText] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    plate: '',
    vehicle: '',
    phone: '',
    description: ''
  });

  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [orders, setOrders] = useState<ServiceOrder[]>([
    {
      id: '101',
      clientName: 'João Ferreira',
      phone: '11988887777',
      vehicle: 'Fiat Uno Mile',
      plate: 'DFE-4567',
      description: 'Barulho na suspensão dianteira ao passar em buracos.',
      status: 'Execução',
      createdAt: '2024-05-10',
      total: 350,
      items: [
        { id: 'i1', type: 'PEÇA', description: 'Amortecedor Dianteiro', quantity: 2, price: 150, timestamp: '14:00' },
        { id: 'i2', type: 'MÃO DE OBRA', description: 'Troca de amortecedores', quantity: 1, price: 50, timestamp: '15:30' }
      ]
    }
  ]);

  const stats = useMemo(() => {
    const ativos = orders.filter(o => o.status !== 'Entregue');
    const concluidos = orders.filter(o => o.status === 'Entregue');
    return {
      ativosCount: ativos.length,
      concluidosCount: concluidos.length,
      faturamento: orders.reduce((acc, curr) => acc + curr.total, 0),
      aguardandoOrcamento: ativos.filter(o => o.status === 'Orçamento').length
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (activeTab === 'ativos') list = orders.filter(o => o.status !== 'Entregue');
    else if (activeTab === 'historico') list = orders.filter(o => o.status === 'Entregue');

    return list.filter(o => 
      (o.plate?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (o.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, activeTab, searchTerm]);

  const handleAutofill = async () => {
    if (!autofillText.trim()) return;
    setIsAutofilling(true);
    const data = await extractOSData(autofillText);
    if (data) {
      setFormData({
        clientName: data.clientName || '',
        plate: data.plate || '',
        vehicle: data.vehicle || '',
        description: data.description || '',
        phone: ''
      });
    }
    setIsAutofilling(false);
  };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: ServiceOrder = {
      id: (Date.now() % 10000).toString(),
      ...formData,
      status: 'Aberto',
      createdAt: new Date().toISOString().split('T')[0],
      total: 0,
      items: [],
      photoUrl: tempPhoto || undefined
    };
    setOrders([nova, ...orders]);
    setFormData({ clientName: '', plate: '', vehicle: '', phone: '', description: '' });
    setAutofillText('');
    setView('lista');
  };

  const addItem = (type: ServiceItem['type'], customDesc?: string, customPrice?: number) => {
    if (!selectedOS) return;
    
    const desc = customDesc || prompt(`Descrição da ${type}:`);
    if (!desc) return;
    
    const price = customPrice !== undefined ? customPrice : (type !== 'NOTA' ? parseFloat(prompt('Valor unitário:') || '0') : 0);
    const qty = 1;

    const newItem: ServiceItem = {
      id: Date.now().toString(),
      type,
      description: desc,
      quantity: qty,
      price: price,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedItems = [...selectedOS.items, newItem];
    const updatedOS = { 
      ...selectedOS, 
      items: updatedItems, 
      total: updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) 
    };
    setSelectedOS(updatedOS);
    setOrders(orders.map(o => o.id === selectedOS.id ? updatedOS : o));
  };

  const getAiConsultancy = async () => {
    if (!selectedOS) return;
    setIsAiLoading(true);
    const result = await getDiagnosticHelp(selectedOS.description);
    setAiAnalysis(result);
    setIsAiLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* HEADER TABS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
          {[
            { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={18} /> },
            { id: 'ativos', label: 'Em Serviço', icon: <Wrench size={18} /> },
            { id: 'historico', label: 'Histórico', icon: <History size={18} /> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setView('lista'); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <button 
          onClick={() => { setView('nova'); setAiAnalysis(null); setTempPhoto(null); }}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus size={20} /> Nova O.S.
        </button>
      </div>

      {/* VIEW: NOVA O.S. COM AUTOFILL */}
      {view === 'nova' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-8 bg-indigo-50 border-b border-indigo-100 space-y-4">
            <div className="flex items-center gap-2 text-indigo-700">
              <Sparkles size={20} />
              <h3 className="font-bold">Preenchimento Rápido com IA</h3>
            </div>
            <div className="flex gap-2">
              <input 
                value={autofillText}
                onChange={(e) => setAutofillText(e.target.value)}
                placeholder="Cole aqui: 'O João trouxe um Celta ABC1234 com barulho no freio'..."
                className="flex-1 px-4 py-3 bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button 
                onClick={handleAutofill}
                disabled={isAutofilling}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isAutofilling ? 'Lendo...' : <><Wand2 size={16}/> Mágica</>}
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateOS}>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
                  <input value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Placa</label>
                  <input value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Veículo</label>
                  <input value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">WhatsApp</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="11999999999" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Relato do Defeito</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
              <button type="button" onClick={() => setView('lista')} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-200 rounded-2xl">Cancelar</button>
              <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700">Abrir Atendimento</button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: LISTA */}
      {view === 'lista' && activeTab !== 'dashboard' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por placa ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {filteredOrders.map(order => (
              <div key={order.id} onClick={() => { setSelectedOS(order); setView('detalhes'); setAiAnalysis(null); }} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 cursor-pointer flex items-center justify-between group shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Car size={24} /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{order.plate}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{order.status}</span>
                    </div>
                    <h3 className="font-bold text-slate-900">{order.clientName} - {order.vehicle}</h3>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-indigo-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: DASHBOARD */}
      {activeTab === 'dashboard' && view === 'lista' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">Faturamento</p>
            <h3 className="text-2xl font-black text-slate-900">R$ {stats.faturamento.toFixed(2)}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">Em Serviço</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.ativosCount}</h3>
          </div>
        </div>
      )}

      {/* VIEW: DETALHES + CONSULTORIA IA */}
      {view === 'detalhes' && selectedOS && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8 space-y-8">
              <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                <div>
                  <button onClick={() => setView('lista')} className="text-sm font-bold text-slate-400 mb-2 block hover:text-indigo-600">← Voltar</button>
                  <h2 className="text-2xl font-black text-slate-900 uppercase">O.S. #{selectedOS.id}</h2>
                  <p className="text-sm text-slate-500">{selectedOS.vehicle} • {selectedOS.plate}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 max-w-xs">
                  <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Sintomas</p>
                  <p className="text-xs text-slate-700 italic">"{selectedOS.description}"</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Peças e Serviços</h3>
                  <div className="flex gap-2">
                    <button onClick={() => addItem('PEÇA')} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold">+ Peça</button>
                    <button onClick={() => addItem('MÃO DE OBRA')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold">+ Mão de Obra</button>
                  </div>
                </div>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                      <tr><th className="px-6 py-4 text-left">Item</th><th className="px-6 py-4 text-center">Qtd</th><th className="px-6 py-4 text-right">Total</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedOS.items.map(item => (
                        <tr key={item.id}><td className="px-6 py-4 font-medium">{item.description}</td><td className="px-6 py-4 text-center">{item.quantity}</td><td className="px-6 py-4 text-right font-bold">R$ {(item.price * item.quantity).toFixed(2)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA IA RENOVAÇÃO */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-indigo-600">
                <BrainCircuit size={24}/>
                <h3 className="font-bold">Consultoria Técnica IA</h3>
              </div>
              
              {!aiAnalysis ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">Analise os sintomas com nossa IA treinada para sugerir causas e peças necessárias.</p>
                  <button 
                    onClick={getAiConsultancy}
                    disabled={isAiLoading}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAiLoading ? <span className="animate-pulse">Analisando...</span> : <><Sparkles size={18}/> Pedir Diagnóstico IA</>}
                  </button>
                  {!process.env.API_KEY && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-[10px]">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>Configure sua API_KEY para ativar a Inteligência Artificial.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Timer size={12}/> Tempo Estimado: {aiAnalysis.tempo_estimado}</p>
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-700 mb-2 flex items-center gap-1"><Lightbulb size={14}/> Dica do Mestre</p>
                      <p className="text-xs text-slate-600 leading-relaxed italic">"{aiAnalysis.dica_mestre}"</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peças Sugeridas</p>
                    <div className="space-y-2">
                      {aiAnalysis.pecas.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <p className="text-xs font-bold text-slate-700">{p.item}</p>
                            <p className="text-[10px] text-slate-400">R$ {p.preco_medio.toFixed(2)} (médio)</p>
                          </div>
                          <button 
                            onClick={() => addItem('PEÇA', p.item, p.preco_medio)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all"
                            title="Lançar na O.S."
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setAiAnalysis(null)}
                    className="w-full py-2 text-xs font-bold text-slate-400 hover:text-indigo-600"
                  >
                    Nova Consulta
                  </button>
                </div>
              )}
            </div>

            <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Total</p>
              <h3 className="text-4xl font-black mb-8">R$ {selectedOS.total.toFixed(2)}</h3>
              <button onClick={() => window.print()} className="w-full py-4 bg-white text-indigo-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all">
                <Printer size={18}/> Gerar Comprovante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;
