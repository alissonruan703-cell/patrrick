
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, Clock, CheckCircle2, 
  X, ChevronRight, Camera, Save, 
  Send, User, Car, FileText, 
  Package, Wrench, History, Trash2,
  PlusCircle, AlertCircle, BrainCircuit,
  Image as ImageIcon
} from 'lucide-react';
import { getDiagnosticHelp } from '../services/geminiService';
import { ServiceOrder, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const [view, setView] = useState<'lista' | 'nova' | 'detalhes'>('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState('');
  
  // Estados para nova OS
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dados Simulados Iniciais
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
        { id: 'i1', type: 'PEÇA', description: 'Amortecedor Dianteiro', quantity: 2, price: 150, timestamp: '14:00' },
        { id: 'i2', type: 'MÃO DE OBRA', description: 'Troca de amortecedores', quantity: 1, price: 50, timestamp: '15:30' }
      ]
    }
  ]);

  // Busca (Histórico por placa ou nome)
  const filteredOrders = useMemo(() => {
    try {
      return orders.filter(o => 
        (o.plate?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (o.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      return orders;
    }
  }, [orders, searchTerm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
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
      id: (Date.now() % 10000).toString(),
      clientName: formData.get('nome') as string || 'Consumidor',
      phone: formData.get('tel') as string || '',
      vehicle: formData.get('veiculo') as string || 'Veículo não informado',
      plate: (formData.get('placa') as string || '').toUpperCase(),
      description: formData.get('problema') as string || '',
      status: 'Aberto',
      createdAt: new Date().toISOString().split('T')[0],
      total: 0,
      items: [],
      photoUrl: tempPhoto || undefined
    };
    setOrders([nova, ...orders]);
    setTempPhoto(null);
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
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-black text-slate-900">Oficina Digital</h1>
          <p className="text-sm text-slate-500">Fluxo de atendimento simples e rápido.</p>
        </div>
        <button 
          onClick={() => { setView('nova'); setAiTip(''); setTempPhoto(null); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} /> Nova O.S.
        </button>
      </div>

      {/* LISTA / BUSCA */}
      {view === 'lista' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Digite a PLACA ou NOME para buscar no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm text-lg"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredOrders.length > 0 ? filteredOrders.map(order => (
              <div 
                key={order.id}
                onClick={() => { setSelectedOS(order); setView('detalhes'); setAiTip(''); }}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {order.photoUrl ? (
                    <img src={order.photoUrl} alt="Veículo" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${order.status === 'Entregue' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Car size={24} />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{order.plate || 'SEM PLACA'}</span>
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
            )) : (
              <div className="text-center py-12 bg-slate-100 rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-500">Nenhum registro encontrado no histórico.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOVA O.S. (CADASTRO COM FOTO FUNCIONANDO) */}
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
                  <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
                  <input name="nome" required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Placa</label>
                  <input name="placa" required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Veículo</label>
                  <input name="veiculo" required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Telefone (WhatsApp)</label>
                  <input name="tel" type="text" placeholder="(00) 00000-0000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Defeito Relatado pelo Cliente</label>
                <textarea name="problema" required rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: O carro está morrendo em marcha lenta..."></textarea>
              </div>

              {/* CAMPO DE IMAGEM ATUALIZADO E FUNCIONANDO */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Foto do Veículo / Entrada</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                />
                {!tempPhoto ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center hover:border-indigo-400 cursor-pointer group bg-slate-50 transition-all"
                  >
                    <Camera className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-2" size={32} />
                    <p className="text-xs text-slate-500 font-medium">Clique para tirar uma foto ou selecionar arquivo</p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={tempPhoto} alt="Preview" className="w-full h-48 object-contain" />
                    <button 
                      type="button"
                      onClick={() => setTempPhoto(null)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
              <button type="button" onClick={() => setView('lista')} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-200 rounded-2xl transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">Abrir Ordem de Serviço</button>
            </div>
          </form>
        </div>
      )}

      {/* DETALHES (EXIBIÇÃO DE FOTO ADICIONADA) */}
      {view === 'detalhes' && selectedOS && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <button onClick={() => setView('lista')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600">
                  <ChevronRight className="rotate-180" size={16}/> Voltar
                </button>
                <h2 className="text-lg font-black text-slate-900 uppercase">O.S. #{selectedOS.id}</h2>
                <select 
                  value={selectedOS.status}
                  onChange={(e) => {
                    const updated = { ...selectedOS, status: e.target.value as any };
                    setSelectedOS(updated);
                    setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
                  }}
                  className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl text-xs font-bold border-none outline-none cursor-pointer"
                >
                  <option>Aberto</option>
                  <option>Orçamento</option>
                  <option>Execução</option>
                  <option>Pronto</option>
                  <option>Entregue</option>
                </select>
              </div>

              <div className="p-6 space-y-8">
                {/* DADOS RESUMIDOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informações do Atendimento</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Cliente</p>
                          <p className="text-sm font-bold text-slate-900">{selectedOS.clientName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Veículo</p>
                          <p className="text-sm font-bold text-slate-900">{selectedOS.vehicle}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Placa</p>
                          <p className="text-sm font-mono font-bold text-indigo-600">{selectedOS.plate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Entrada</p>
                          <p className="text-sm font-bold text-slate-900">{selectedOS.createdAt}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                      <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Problema Relatado</p>
                      <p className="text-sm text-slate-700 italic">"{selectedOS.description}"</p>
                    </div>
                  </div>

                  {/* EXIBIÇÃO DA FOTO NA O.S. */}
                  {selectedOS.photoUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-full max-h-[220px]">
                      <img src={selectedOS.photoUrl} alt="Foto Veículo" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* LINHAS DE ATENDIMENTO */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Itens e Serviços Adicionados</h3>
                    <div className="flex gap-2">
                      <button onClick={() => addItem('PEÇA')} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors" title="Adicionar Peça">
                        <Package size={16}/>
                      </button>
                      <button onClick={() => addItem('MÃO DE OBRA')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Adicionar Mão de Obra">
                        <Wrench size={16}/>
                      </button>
                      <button onClick={() => addItem('NOTA')} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors" title="Adicionar Nota">
                        <FileText size={16}/>
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="px-4 py-3">Descrição</th>
                          <th className="px-4 py-3 text-center">Qtd</th>
                          <th className="px-4 py-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedOS.items.length > 0 ? selectedOS.items.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-700">
                              <span className={`text-[8px] mr-2 px-1.5 py-0.5 rounded font-bold ${item.type === 'PEÇA' ? 'bg-indigo-100 text-indigo-600' : item.type === 'MÃO DE OBRA' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200'}`}>
                                {item.type}
                              </span>
                              {item.description}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-500">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400 italic">Nenhum item adicionado. Use os botões acima para atualizar o atendimento.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA RESUMO E IA */}
          <div className="space-y-6">
            <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl shadow-indigo-100">
              <p className="text-indigo-200 text-xs font-bold uppercase mb-2 tracking-widest">Valor do Atendimento</p>
              <h3 className="text-4xl font-black mb-8">R$ {selectedOS.total.toFixed(2)}</h3>
              <div className="space-y-3">
                <button className="w-full py-4 bg-white text-indigo-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all">
                  <Send size={18}/> Enviar Orçamento
                </button>
                <button className="w-full py-3 bg-indigo-800 text-indigo-200 font-bold rounded-xl flex items-center justify-center gap-2 text-xs hover:bg-indigo-700 transition-colors">
                  <ImageIcon size={16}/> Gerar Comprovante
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <BrainCircuit size={20}/>
                <h3 className="font-bold">Assistente Inteligente</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Analise os sintomas com IA para sugerir peças e tempos de serviço.</p>
              <button 
                onClick={getAiHelp}
                disabled={isAiLoading}
                className="w-full py-3 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm flex items-center justify-center gap-2"
              >
                {isAiLoading ? 'Processando Sintomas...' : 'Pedir Ajuda Técnica IA'}
              </button>
              {aiTip && (
                <div className="p-4 bg-indigo-50 rounded-2xl text-xs text-slate-700 italic border border-indigo-100 leading-relaxed whitespace-pre-wrap">
                  {aiTip}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;
