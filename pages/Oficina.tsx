
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, Clock, CheckCircle2, 
  X, ChevronRight, Camera, Save, 
  Send, User, Car, FileText, 
  Package, Wrench, History, Trash2,
  PlusCircle, AlertCircle, Edit3, LayoutDashboard,
  Printer, TrendingUp, Users, ClipboardList,
  Filter, Calendar, Hash, Settings
} from 'lucide-react';
import { ServiceOrder, ServiceItem } from '../types';

const Oficina: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ativos' | 'historico'>('ativos');
  const [view, setView] = useState<'lista' | 'nova' | 'detalhes' | 'editar'>('lista');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  
  // Estados de Filtro
  const [filters, setFilters] = useState({
    client: '',
    plate: '',
    date: '',
    period: 'all' // 'today' | 'week' | 'month' | 'all'
  });

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
      createdAt: new Date().toISOString().split('T')[0],
      total: 350,
      items: [
        { id: 'i1', type: 'PEÇA', description: 'Amortecedor Dianteiro', quantity: 2, price: 150, timestamp: '14:00' },
        { id: 'i2', type: 'MÃO DE OBRA', description: 'Troca de amortecedores', quantity: 1, price: 50, timestamp: '15:30' }
      ]
    }
  ]);

  // Lógica de Filtragem Universal
  const filteredOrders = useMemo(() => {
    let list = orders;

    // Filtro de Aba
    if (activeTab === 'ativos') list = list.filter(o => o.status !== 'Entregue');
    else if (activeTab === 'historico') list = list.filter(o => o.status === 'Entregue');

    return list.filter(o => {
      const matchClient = o.clientName.toLowerCase().includes(filters.client.toLowerCase());
      const matchPlate = o.plate.toLowerCase().includes(filters.plate.toLowerCase());
      const matchDate = filters.date ? o.createdAt === filters.date : true;

      let matchPeriod = true;
      if (filters.period !== 'all') {
        const orderDate = new Date(o.createdAt);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        orderDate.setHours(0, 0, 0, 0);

        if (filters.period === 'today') {
          matchPeriod = orderDate.getTime() === now.getTime();
        } else if (filters.period === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          matchPeriod = orderDate >= weekAgo;
        } else if (filters.period === 'month') {
          matchPeriod = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        }
      }

      return matchClient && matchPlate && matchDate && matchPeriod;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, activeTab, filters]);

  // Estatísticas Dinâmicas Baseadas nos Filtros
  const stats = useMemo(() => {
    const total = filteredOrders.reduce((acc, curr) => acc + curr.total, 0);
    const ativos = filteredOrders.filter(o => o.status !== 'Entregue').length;
    const concluidos = filteredOrders.filter(o => o.status === 'Entregue').length;
    return { total, ativos, concluidos };
  }, [filteredOrders]);

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
    setView('lista');
    setActiveTab('ativos');
  };

  const addItem = (type: ServiceItem['type']) => {
    if (!selectedOS) return;
    const desc = prompt(`Descrição da ${type}:`);
    if (!desc) return;
    const price = type !== 'NOTA' ? parseFloat(prompt('Valor unitário:') || '0') : 0;
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

  const resetFilters = () => setFilters({ client: '', plate: '', date: '', period: 'all' });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* HEADER TABS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print">
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
          onClick={() => { setView('nova'); setTempPhoto(null); }}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus size={20} /> Nova O.S.
        </button>
      </div>

      {/* PAINEL DE FILTROS (Disponível em todas as abas de lista) */}
      {view === 'lista' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 no-print">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Filter size={16} className="text-indigo-600" /> Filtros de Busca
            </h3>
            <button onClick={resetFilters} className="text-xs text-indigo-600 font-semibold hover:underline">Limpar Filtros</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                value={filters.client} 
                onChange={e => setFilters({...filters, client: e.target.value})}
                placeholder="Nome do cliente"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                value={filters.plate} 
                onChange={e => setFilters({...filters, plate: e.target.value})}
                placeholder="Placa do veículo"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="date"
                value={filters.date} 
                onChange={e => setFilters({...filters, date: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={filters.period}
                onChange={e => setFilters({...filters, period: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="all">Todo o Período</option>
                <option value="today">Hoje</option>
                <option value="week">Últimos 7 dias</option>
                <option value="month">Este Mês</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: DASHBOARD */}
      {activeTab === 'dashboard' && view === 'lista' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100">
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Faturamento Filtrado</p>
              <h3 className="text-3xl font-black">R$ {stats.total.toFixed(2)}</h3>
              <p className="text-indigo-200 text-[10px] mt-4 font-medium flex items-center gap-1">
                <TrendingUp size={12}/> Refletindo filtros aplicados
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Ordens Ativas</p>
              <h3 className="text-3xl font-black text-slate-900">{stats.ativos}</h3>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Finalizadas</p>
              <h3 className="text-3xl font-black text-slate-900">{stats.concluidos}</h3>
            </div>
          </div>
          
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
            <ClipboardList size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Resumo de Atividades</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Utilize os filtros acima para analisar o desempenho da sua oficina em diferentes períodos e clientes.</p>
          </div>
        </div>
      )}

      {/* VIEW: LISTA */}
      {(activeTab === 'ativos' || activeTab === 'historico') && view === 'lista' && (
        <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-300">
          {filteredOrders.length > 0 ? filteredOrders.map(order => (
            <div key={order.id} onClick={() => { setSelectedOS(order); setView('detalhes'); }} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 cursor-pointer flex items-center justify-between group shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Car size={24} /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{order.plate}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${order.status === 'Entregue' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                      {order.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900">{order.clientName} - {order.vehicle}</h3>
                </div>
              </div>
              <div className="text-right flex items-center gap-6">
                <div className="hidden sm:block">
                  <p className="text-sm font-black text-slate-900">R$ {order.total.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">{order.createdAt}</p>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-indigo-500" />
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <Search size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">Nenhum veículo encontrado com estes filtros.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW: NOVA O.S. (Removido IA/Mágica) */}
      {view === 'nova' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Novo Atendimento</h2>
            <button type="button" onClick={() => setView('lista')} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
          </div>
          <form onSubmit={handleCreateOS}>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nome do Cliente</label>
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

      {/* VIEW: DETALHES (Removido Consultoria IA) */}
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
                  <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Problema Relatado</p>
                  <p className="text-xs text-slate-700 italic">"{selectedOS.description}"</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Peças e Serviços</h3>
                  <div className="flex gap-2 no-print">
                    <button onClick={() => addItem('PEÇA')} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold">+ Peça</button>
                    <button onClick={() => addItem('MÃO DE OBRA')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold">+ Mão de Obra</button>
                  </div>
                </div>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                      <tr><th className="px-6 py-4 text-left">Item</th><th className="px-6 py-4 text-center">Qtd</th><th className="px-6 py-4 text-right">Total</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedOS.items.length > 0 ? selectedOS.items.map(item => (
                        <tr key={item.id}><td className="px-6 py-4 font-medium">{item.description}</td><td className="px-6 py-4 text-center">{item.quantity}</td><td className="px-6 py-4 text-right font-bold text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</td></tr>
                      )) : (
                        <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-300 italic">Nenhum item lançado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 no-print">
            <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Total do Atendimento</p>
              <h3 className="text-4xl font-black mb-8">R$ {selectedOS.total.toFixed(2)}</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    const texto = `Olá! Segue o orçamento para o veículo ${selectedOS.vehicle}:\n\nTotal: R$ ${selectedOS.total.toFixed(2)}`;
                    window.open(`https://wa.me/55${selectedOS.phone}?text=${encodeURIComponent(texto)}`, '_blank');
                  }}
                  className="w-full py-4 bg-white text-indigo-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all"
                >
                  <Send size={18}/> Enviar via WhatsApp
                </button>
                <button onClick={() => window.print()} className="w-full py-4 bg-indigo-800 text-indigo-100 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                  <Printer size={18}/> Imprimir PDF
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              {/* Fix: Added Settings icon import and usage to manage Service Order status */}
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Settings size={18} className="text-slate-400"/> Gerenciar O.S.</h3>
              <select 
                value={selectedOS.status}
                onChange={(e) => {
                  const updated = { ...selectedOS, status: e.target.value as any };
                  setSelectedOS(updated);
                  setOrders(orders.map(o => o.id === selectedOS.id ? updated : o));
                }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
              >
                <option>Aberto</option>
                <option>Orçamento</option>
                <option>Execução</option>
                <option>Pronto</option>
                <option>Entregue</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para Impressão */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default Oficina;
