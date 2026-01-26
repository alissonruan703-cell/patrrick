
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Building2, ImagePlus, CheckCircle2, Trash, Info } from 'lucide-react';
import { SystemConfig } from '../types';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [config, setConfig] = useState<SystemConfig>({ companyName: 'Minha Empresa', companyLogo: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('crmplus_system_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  const handleSave = () => {
    localStorage.setItem('crmplus_system_config', JSON.stringify(config));
    window.dispatchEvent(new Event('storage'));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setConfig({ ...config, companyLogo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="pt-32 px-4 sm:px-6 lg:px-20 max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">CONFIGURAÇÕES DO <span className="text-violet-500">SISTEMA</span></h1>
          <p className="text-slate-400 font-medium text-sm sm:text-base">Personalize a identidade visual da sua plataforma SaaS.</p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="w-fit p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-slate-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-[#1a1d23] border border-white/5 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
              <div className="relative group mx-auto w-32 h-32 sm:w-44 sm:h-44">
                {config.companyLogo ? (
                   <div className="w-full h-full flex items-center justify-center overflow-hidden bg-transparent">
                      <img src={config.companyLogo} className="w-full h-full object-contain" alt="Empresa Logo" />
                   </div>
                ) : (
                   <div className="w-full h-full bg-black/40 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-slate-700">
                      <Building2 size={40} />
                   </div>
                )}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-2xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                >
                  <ImagePlus className="text-white" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-xs tracking-widest">Logo da Empresa</h3>
                <p className="text-[10px] text-slate-500 mt-2 font-bold leading-relaxed uppercase">Formato recomendado: PNG transparente.</p>
              </div>
              {config.companyLogo && (
                <button 
                  onClick={() => setConfig({...config, companyLogo: ''})}
                  className="w-full py-2 bg-red-600/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/10 hover:bg-red-600 hover:text-white transition-all"
                >
                  Remover Logo
                </button>
              )}
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="bg-[#1a1d23] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Fantasia da Empresa</label>
                <input 
                  value={config.companyName}
                  onChange={e => setConfig({...config, companyName: e.target.value})}
                  placeholder="Ex: Tracbel S/A"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-violet-500/20 transition-all uppercase"
                />
              </div>

              <div className="h-px bg-white/5" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-xs text-slate-400 font-medium text-center sm:text-left">Configurações globais de identidade visual.</p>
                <button 
                  onClick={handleSave}
                  className="w-full sm:w-auto px-10 py-5 bg-violet-600 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-violet-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-violet-600/20"
                >
                  {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                  {saved ? 'Salvo!' : 'Salvar Alterações'}
                </button>
              </div>
           </div>

           <div className="p-6 sm:p-8 bg-blue-600/5 border border-blue-500/10 rounded-3xl space-y-4">
              <h4 className="text-blue-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                 <Info size={14} /> Transparência Nativa
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                O sistema foi otimizado para integrar logos transparentes (PNG) diretamente sobre o fundo escuro, removendo bordas e containers delimitadores para um visual mais premium.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
