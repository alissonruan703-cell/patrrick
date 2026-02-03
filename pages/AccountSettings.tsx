
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, X, Building2, Tag, List, LayoutGrid, FileText, Trash2 } from 'lucide-react';

const AccountSettings: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(user.settings);
  const [activeTab, setActiveTab] = useState('geral');

  const handleSave = () => {
    const updated = {...user, settings};
    sessionStorage.setItem('crmplus_user', JSON.stringify(updated));
    localStorage.setItem(`crmplus_user_${user.email}`, JSON.stringify(updated));
    alert('Configurações salvas com sucesso!');
  };

  const addItem = (listKey: string, value: string) => {
    if (!value) return;
    setSettings({...settings, [listKey]: [...settings[listKey], value]});
  };

  const removeItem = (listKey: string, index: number) => {
    const newList = [...settings[listKey]];
    newList.splice(index, 1);
    setSettings({...settings, [listKey]: newList});
  };

  return (
    <div className="p-8 pb-32 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Personalizar <span className="text-red-600">Ecossistema</span></h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Configurações globais da empresa</p>
        </div>
        <button onClick={handleSave} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-red-600/20 hover:scale-105 transition-all flex items-center gap-2">
          <Save size={18} /> Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <nav className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('geral')} className={`w-full text-left p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'geral' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}>Identidade & Tags</button>
          <button onClick={() => setActiveTab('funil')} className={`w-full text-left p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'funil' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}>Etapas do Funil</button>
          <button onClick={() => setActiveTab('restaurante')} className={`w-full text-left p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'restaurante' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}>Restaurante</button>
        </nav>

        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10">
          {activeTab === 'geral' && (
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="flex items-center gap-3 text-lg font-black uppercase"><Building2 className="text-red-600" /> Tags Personalizadas</h3>
                <div className="flex flex-wrap gap-2">
                  {settings.tags.map((tag:string, idx:number) => (
                    <span key={idx} className="bg-black border border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-3">
                      {tag} <X size={14} className="text-zinc-600 hover:text-red-500 cursor-pointer" onClick={() => removeItem('tags', idx)} />
                    </span>
                  ))}
                  <button 
                    onClick={() => {
                      const val = prompt('Nome da tag:');
                      if (val) addItem('tags', val);
                    }}
                    className="border-2 border-dashed border-zinc-800 px-4 py-2 rounded-xl text-xs font-black uppercase text-zinc-600 hover:border-red-600 hover:text-red-600"
                  >
                    + Adicionar Tag
                  </button>
                </div>
              </div>
              
              <div className="space-y-6 pt-12 border-t border-zinc-800">
                <h3 className="flex items-center gap-3 text-lg font-black uppercase"><Tag className="text-red-600" /> Campos de Cliente</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase">Estes campos aparecerão no cadastro de clientes em todos os módulos.</p>
                <button className="bg-black border border-zinc-800 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-red-600 transition-all">+ Criar Novo Campo</button>
              </div>
            </div>
          )}

          {activeTab === 'funil' && (
            <div className="space-y-8">
              <h3 className="flex items-center gap-3 text-lg font-black uppercase"><LayoutGrid className="text-red-600" /> Etapas do Kanban</h3>
              <div className="space-y-3">
                {settings.funnelStages.map((stage:string, idx:number) => (
                  <div key={idx} className="flex items-center gap-4 bg-black border border-zinc-800 p-5 rounded-2xl">
                    <List size={18} className="text-zinc-700" />
                    <span className="flex-1 font-black uppercase text-xs">{stage}</span>
                    <button onClick={() => removeItem('funnelStages', idx)} className="text-zinc-600 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  const val = prompt('Nome da Etapa:');
                  if (val) addItem('funnelStages', val);
                }}
                className="w-full border-2 border-dashed border-zinc-800 py-4 rounded-2xl font-black uppercase text-xs text-zinc-600 hover:border-red-600 hover:text-red-600 transition-all"
              >
                + Adicionar Etapa
              </button>
            </div>
          )}

          {activeTab === 'restaurante' && (
            <div className="space-y-8">
              <h3 className="flex items-center gap-3 text-lg font-black uppercase"><FileText className="text-red-600" /> Categorias do Cardápio</h3>
              <div className="space-y-3">
                {settings.restaurantCategories.map((cat:string, idx:number) => (
                  <div key={idx} className="flex items-center gap-4 bg-black border border-zinc-800 p-5 rounded-2xl">
                    <span className="flex-1 font-black uppercase text-xs">{cat}</span>
                    <button onClick={() => removeItem('restaurantCategories', idx)} className="text-zinc-600 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  const val = prompt('Nome da Categoria:');
                  if (val) addItem('restaurantCategories', val);
                }}
                className="w-full border-2 border-dashed border-zinc-800 py-4 rounded-2xl font-black uppercase text-xs text-zinc-600 hover:border-red-600 hover:text-red-600 transition-all"
              >
                + Nova Categoria
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
