
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, Clock, CheckCircle2, 
  X, ChevronRight, Camera, Save, 
  Send, User, Car, FileText, 
  Package, Wrench, History, Trash2,
  PlusCircle, AlertCircle, BrainCircuit,
  Image as ImageIcon, Edit3, LayoutDashboard,
  Printer, TrendingUp, Users, ClipboardList
} from 'lucide-react';
import { getDiagnosticHelp } from '../services/geminiService';
import { ServiceOrder, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ativos' | 'historico'>('ativos');
  const [view, setView] = useState<'lista' | 'nova' | 'detalhes' | 'editar'>('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState('');
  
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dados Iniciais
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
    },
    {
      id: '102',
      clientName: 'Maria Souza',
      phone: '11999998888',
      vehicle: 'VW Gol G5',
      plate: 'ABC-1234',
      description: 'Revisão básica e troca de óleo.',
      status: 'Entregue',
      createdAt: '2024-05-08',
      total: 280,
      items: [
        { id: 'i3', type: 'PEÇA', description: 'Óleo 5W30', quantity: 4, price: 45, timestamp: '10:00' },
        { id: 'i4', type: 'MÃO DE OBRA', description: 'Troca de óleo e filtros', quantity: 1, price: 100, timestamp: '11:00' }
      ]
    }
  ]);

  // Estatísticas para o Dashboard
  const stats = useMemo(() => {
    const ativos = orders.filter(o => o.status !== 'Entregue');
    const concluidos = orders.filter(o => o.status === 'Entregue');
    const faturamentoTotal = orders.reduce((acc, curr) => acc + curr.total, 0);
    return {
      ativosCount: ativos.length,
      concluidosCount: concluidos.length,
      faturamento: faturamentoTotal,
      aguardandoOrcamento: ativos.filter(o => o.status === 'Orçamento').length
    };
  }, [orders]);

  // Filtragem por Tab e Busca
  const filteredOrders = useMemo(() => {
    let list = orders;
    if (activeTab === 'ativos') {
      list = orders.filter(o => o.status !== 'Entregue');
    } else if (activeTab === 'historico') {
      list = orders.filter(o => o.status === 'Entregue');
    }

    return list.filter(o => 
      (o.plate?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (o.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, activeTab, searchTerm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateOS = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nova: ServiceOrder = {
      id: (Date.now() % 10000).toString(),
      clientName: formData.get('nome') as string,
      phone: (formData.get('tel') as string).replace(/\D/g, ''),
      vehicle: formData.get('veiculo') as string,
      plate: (formData.get('placa') as string).toUpperCase(),
      description: formData.get('problema') as string,
      status: 'Aberto',
      createdAt: new Date().toISOString().split('T')[0],
      total: 0,
      items: [],
      photoUrl: tempPhoto || undefined
    };
    setOrders([nova, ...orders]);
    setTempPhoto(null);
    setView('lista');
    setActiveTab('ativos');
  };

  const handleUpdateOS = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOS) return;
    const formData = new FormData(e.currentTarget);
    const updatedOS: ServiceOrder = {
      ...selectedOS,
      clientName: formData.get('nome') as string,
      phone: (formData.get('tel') as string).replace(/\D/g, ''),
      vehicle: formData.get('veiculo') as string,
      plate: (formData.get('placa') as string).toUpperCase(),
      description: formData.get('problema') as string,
      photoUrl: tempPhoto || selectedOS.photoUrl
    };
    setOrders(orders.map(o => o.id === selectedOS.id ? updatedOS : o));
    setSelectedOS(updatedOS);
    setView('detalhes');
  };

  const handleDeleteOS = (id: string) => {
    if (window.confirm('Excluir esta O.S. permanentemente?')) {
      setOrders(orders.filter(o => o.id !== id));
      setSelectedOS(null);
      setView('lista');
    }
  };

  const addItem = (type: ServiceItem['type']) => {
    if (!selectedOS) return;
    const desc = prompt(`Descrição da ${type}:`);
    if (!desc) return;
    const price = type !== 'NOTA' ? parseFloat(prompt('Valor unitário:') || '0') : 0;
    const qty = type !== 'NOTA' ? parseInt(prompt('Quantidade:') || '1') : 1;

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

  const enviarOrcamento = () => {
    if (!selectedOS) return;
    const texto = `Olá ${selectedOS.clientName}! Segue o orçamento para o veículo ${selectedOS.vehicle} (${selectedOS.plate}):\n\n` +
      selectedOS.items.map(i => `- ${i.description}: R$ ${(i.price * i.quantity).toFixed(2)}`).join('\n') +
      `\n\n*Total: R$ ${selectedOS.total.toFixed(2)}*`;
    const url = `https://wa.me/55${selectedOS.phone}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const imprimirComprovante = () => {
    window.print();
  };

  const getAiHelp = async () => {
    if (!selectedOS) return;
    setIsAiLoading(true);
    const help = await getDiagnosticHelp(selectedOS.description);
    setAiTip(help || '');
    setIsAiLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* NAVEGAÇÃO POR GUIAS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
          <button 
            onClick={() => { setActiveTab('dashboard'); setView('lista'); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={18} /> Painel
          </button>
          <button 
            onClick={() => { setActiveTab('ativos'); setView('lista'); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'ativos' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Clock size={18} /> Ativos
          </button>
          <button 
            onClick={() => { setActiveTab('historico'); setView('lista'); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'historico' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <History size={18} /> Histórico
          </button>
        </div>
        
        <button 
          onClick={() => { setView('nova'); setTempPhoto(null); }}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus size={20} /> Nova O.S.
        </button>
      </div>

      {/* VIEW: DASHBOARD */}
      {activeTab === 'dashboard' && view === 'lista' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Car size={20} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Veículos em Serviço</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.ativosCount}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp size={20} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Faturamento Total</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">R$ {stats.faturamento.toFixed(2)}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                <ClipboardList size={20} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Aguardando Orçamento</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.aguardandoOrcamento}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Concluídos</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.concluidosCount}</h3>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center py-16">
            <TrendingUp size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Visão Geral Mensal</h3>
            <p className="text-slate-500 text-sm mt-2">Seu negócio está crescendo! Gerencie suas O.S. para ver estatísticas detalhadas aqui.</p>
          </div>
        </div>
      )}

      {/* VIEW: LISTA (ATIVOS OU HISTÓRICO) */}
      {(activeTab === 'ativos' || activeTab === 'historico') && view === 'lista' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={`Buscar em ${activeTab === 'ativos' ? 'Ativos' : 'Histórico'} por PLACA ou NOME...`}
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
                    <img src={order.photoUrl} alt="Veículo" className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${order.status === 'Entregue' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Car size={24} />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{order.plate}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${order.status === 'Pronto' ? 'bg-emerald-100 text-emerald-700' : order.status === 'Entregue' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                        {order.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mt-1">{order.clientName} - {order.vehicle}</h3>
                  </div>
                </div>
                <div className="text-right flex items-center gap-6">
                  <div className="hidden sm:block">
                    <p className="text-sm font-black text-slate-900">R$ {order.total.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">{order.createdAt}</p>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <ClipboardList size={40} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium">Nenhum registro encontrado.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: NOVA / EDITAR */}
      {(view === 'nova' || view === 'editar') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <form onSubmit={view === 'nova' ? handleCreateOS : handleUpdateOS}>
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{view === 'nova' ? 'Novo Atendimento' : 'Editar Dados'}</h2>
              <button type="button" onClick={() => setView(view === 'nova' ? 'lista' : 'detalhes')} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nome do Cliente</label>
                  <input name="nome" defaultValue={selectedOS?.clientName} required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Placa</label>
                  <input name="placa" defaultValue={selectedOS?.plate} required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Veículo</label>
                  <input name="veiculo" defaultValue={selectedOS?.vehicle} required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">WhatsApp</label>
                  <input name="tel" defaultValue={selectedOS?.phone} type="text" placeholder="11999999999" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Sintomas / Observações</label>
                <textarea name="problema" defaultValue={selectedOS?.description} required rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="O que precisa ser feito?"></textarea>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Foto do Veículo</label>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                {!(tempPhoto || selectedOS?.photoUrl) ? (
                  <div onClick={() => fileInputRef.current?.click()} className="p-10 border-2 border-dashed border-slate-200 rounded-2xl text-center hover:border-indigo-400 cursor-pointer group bg-slate-50 transition-all">
                    <Camera className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-2" size={40} />
                    <p className="text-sm text-slate-500 font-medium">Clique para fotografar o veículo</p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-64">
                    <img src={tempPhoto || selectedOS?.photoUrl} alt="Preview" className="w-full h-full object-contain" />
                    <button type="button" onClick={() => setTempPhoto(null)} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-xl hover:bg-red-600"><X size={20} /></button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
              <button type="button" onClick={() => setView(view === 'nova' ? 'lista' : 'detalhes')} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-200 rounded-2xl transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition-colors">Salvar O.S.</button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: DETALHES (ATIVAÇÕES DE BOTÕES) */}
      {view === 'detalhes' && selectedOS && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div id="print-area" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between no-print">
                <button onClick={() => setView('lista')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600">
                  <ChevronRight className="rotate-180" size={16}/> Voltar
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setView('editar')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Editar"><Edit3 size={18} /></button>
                  <button onClick={() => handleDeleteOS(selectedOS.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Excluir"><Trash2 size={18} /></button>
                </div>
                <select 
                  value={selectedOS.status}
                  onChange={(e) => {
                    const updated = { ...selectedOS, status: e.target.value as any };
                    setSelectedOS(updated);
                    setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
                  }}
                  className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-xl text-xs font-bold border-none outline-none cursor-pointer"
                >
                  <option>Aberto</option>
                  <option>Orçamento</option>
                  <option>Execução</option>
                  <option>Pronto</option>
                  <option>Entregue</option>
                </select>
              </div>

              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 uppercase">Ordem de Serviço #{selectedOS.id}</h2>
                    <p className="text-sm text-slate-400">Gerada em {selectedOS.createdAt}</p>
                  </div>
                  {selectedOS.photoUrl && (
                    <img src={selectedOS.photoUrl} alt="Veículo" className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-50" />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="p-5 bg-slate-50 rounded-3xl space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                        <p className="text-lg font-bold text-slate-900">{selectedOS.clientName}</p>
                        <p className="text-sm text-slate-500">{selectedOS.phone}</p>
                      </div>
                      <div className="h-[1px] bg-slate-100"></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Veículo</p>
                        <p className="text-lg font-bold text-slate-900">{selectedOS.vehicle}</p>
                        <p className="text-sm font-mono font-bold text-indigo-600">{selectedOS.plate}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl h-full">
                    <p className="text-[10px] font-black text-amber-600 uppercase mb-3">Relato do Problema</p>
                    <p className="text-slate-700 leading-relaxed italic">"{selectedOS.description}"</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between no-print">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Serviços e Peças</h3>
                    <div className="flex gap-2">
                      <button onClick={() => addItem('PEÇA')} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"><Package size={14}/> + Peça</button>
                      <button onClick={() => addItem('MÃO DE OBRA')} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"><Wrench size={14}/> + Mão de Obra</button>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                        <tr>
                          <th className="px-6 py-4">Item / Serviço</th>
                          <th className="px-6 py-4 text-center">Qtd</th>
                          <th className="px-6 py-4 text-right">Preço</th>
                          <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm">
                        {selectedOS.items.length > 0 ? selectedOS.items.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className={`text-[8px] mr-2 px-1.5 py-0.5 rounded font-black ${item.type === 'PEÇA' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {item.type}
                              </span>
                              <span className="font-medium text-slate-800">{item.description}</span>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-500 font-mono">{item.quantity}</td>
                            <td className="px-6 py-4 text-right text-slate-500">R$ {item.price.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right font-black text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-300 italic">Lance os serviços para gerar o orçamento.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 no-print">
            <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-2xl shadow-indigo-200">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Total O.S.</p>
              <h3 className="text-4xl font-black mb-8">R$ {selectedOS.total.toFixed(2)}</h3>
              <div className="space-y-3">
                <button 
                  onClick={enviarOrcamento}
                  className="w-full py-4 bg-white text-indigo-900 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all"
                >
                  <Send size={20}/> Enviar Orçamento
                </button>
                <button 
                  onClick={imprimirComprovante}
                  className="w-full py-4 bg-indigo-800 text-indigo-100 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all"
                >
                  <Printer size={20}/> Imprimir / PDF
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <BrainCircuit size={20}/>
                <h3 className="font-bold">Consultoria IA</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Deixe a IA analisar os problemas e sugerir soluções técnicas para você.</p>
              <button 
                onClick={getAiHelp}
                disabled={isAiLoading}
                className="w-full py-3.5 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm flex items-center justify-center gap-2"
              >
                {isAiLoading ? 'Analisando...' : 'Pedir Auxílio Técnico IA'}
              </button>
              {aiTip && (
                <div className="p-5 bg-indigo-50 rounded-2xl text-[13px] text-slate-700 italic border border-indigo-100 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-500">
                  {aiTip}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ESTILO DE IMPRESSÃO */}
      <style>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; border: none; shadow: none; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Oficina;
