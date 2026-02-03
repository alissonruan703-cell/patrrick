
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Utensils, FileText, LayoutGrid, Heart, ClipboardCheck, ArrowRight, CheckCircle, X, Copy, Mail, ExternalLink, CreditCard, CheckCircle2 } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(!!sessionStorage.getItem('crmplus_user'));
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText('suporte@crmplus.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modules = [
    { id: 'oficina', title: 'Oficina', desc: 'Ordens de serviço, peças, fotos e histórico completo.', icon: <Wrench size={32} /> },
    { id: 'restaurante', title: 'Restaurante', desc: 'Pedidos, categorias, produtos e observações de mesa.', icon: <Utensils size={32} /> },
    { id: 'orcamento', title: 'Orçamento', desc: 'Itens, PDF profissional e link compartilhável.', icon: <FileText size={32} /> },
    { id: 'funil', title: 'Funil de Vendas', desc: 'Controle de leads via kanban e taxas de conversão.', icon: <LayoutGrid size={32} /> },
    { id: 'nps', title: 'NPS', desc: 'Pesquisas e dashboard de satisfação de clientes.', icon: <Heart size={32} /> },
    { id: 'inspeção', title: 'Inspeção/Vistoria', desc: 'Checklist, fotos por item e exportação de laudos.', icon: <ClipboardCheck size={32} /> },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProductAction = () => {
    if (isLogged) navigate('/dashboard');
    else scrollTo('modulos');
  };

  return (
    <div className="bg-black min-h-screen">
      <header className="fixed top-0 w-full z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <span className="text-2xl font-black text-red-600 italic tracking-tighter">CRMPLUS+</span>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-zinc-400">
            <button onClick={() => scrollTo('modulos')} className="hover:text-red-500 transition-colors">Recursos</button>
            <button onClick={() => scrollTo('precos')} className="hover:text-red-500 transition-colors">Preços</button>
            <button onClick={() => navigate('/login')} className="hover:text-red-500 transition-colors">Entrar</button>
            <button onClick={() => navigate('/signup')} className="bg-red-600 text-white px-6 py-2.5 rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">Criar Conta</button>
          </nav>
        </div>
      </header>

      <section className="pt-48 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase">Sistemas de gestão <span className="text-red-600">do seu jeito.</span></h1>
          <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto">Ative apenas os módulos que você precisa e controle tudo com perfis, histórico e personalização total por empresa.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/signup')} className="w-full sm:w-auto bg-red-600 text-white px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 transition-all">Começar Agora</button>
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-zinc-900 text-white px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-all">Área do Cliente</button>
          </div>
          <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Teste grátis de 7 dias • Sem fidelidade</p>
        </div>
      </section>

      <section id="modulos" className="py-24 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter">Módulos Disponíveis</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Combine como quiser</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((m) => (
              <div key={m.id} className="group bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-red-600/50 transition-all flex flex-col h-full shadow-2xl">
                <div className="text-red-600 mb-6 group-hover:scale-110 transition-transform">{m.icon}</div>
                <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">{m.title}</h3>
                <p className="text-zinc-400 font-medium mb-8 flex-1 leading-relaxed">{m.desc}</p>
                <div className="flex gap-4">
                  <button className="flex-1 bg-zinc-800 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Detalhes</button>
                  <button onClick={() => navigate('/signup')} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Ativar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="py-24 px-6">
        <div className="max-w-3xl mx-auto bg-zinc-900 border-2 border-red-600/20 p-12 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={120} /></div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Transparência</h2>
          <div className="flex items-center justify-center gap-4">
            <span className="text-6xl font-black">R$ 50</span>
            <div className="text-left"><p className="font-black uppercase text-red-600 leading-none">/mês</p><p className="text-zinc-500 font-bold text-xs uppercase">por módulo</p></div>
          </div>
          <button onClick={() => navigate('/signup')} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 hover:scale-[1.02] transition-all">Experimentar Grátis</button>
        </div>
      </section>

      <footer className="py-24 border-t border-zinc-900 text-zinc-600 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <span className="text-3xl font-black text-red-600 italic tracking-tighter block">CRMPLUS+</span>
            <p className="text-sm font-medium max-w-sm uppercase leading-relaxed">Ecossistema SaaS modular para empresas que buscam alta performance.</p>
          </div>
          <div className="space-y-6">
            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Produto</p>
            <nav className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest">
              <button onClick={handleProductAction} className="text-left hover:text-red-500 transition-colors">Módulos</button>
              <button onClick={() => scrollTo('precos')} className="text-left hover:text-red-500 transition-colors">Preços</button>
              <button onClick={() => navigate('/support')} className="text-left hover:text-red-500 transition-colors">Central de Ajuda</button>
            </nav>
          </div>
          <div className="space-y-6">
            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Legal & Suporte</p>
            <nav className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest">
              <button onClick={() => navigate('/terms')} className="text-left hover:text-red-500 transition-colors">Termos de uso</button>
              <button onClick={() => navigate('/privacy')} className="text-left hover:text-red-500 transition-colors">Privacidade</button>
              <button onClick={() => setShowContact(true)} className="text-left hover:text-red-500 transition-colors">Fale Conosco</button>
            </nav>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-16 mt-16 border-t border-zinc-900 text-center text-[10px] font-black uppercase tracking-[0.5em]">
          © {new Date().getFullYear()} CRMPLUS+ – Sistemas de Gestão por Assinatura.
        </div>
      </footer>

      {showContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[3rem] w-full max-w-md text-center shadow-2xl relative">
            <button onClick={() => setShowContact(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-all"><X size={24} /></button>
            <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-8"><Mail size={40} /></div>
            <h2 className="text-2xl font-black uppercase mb-4 tracking-tighter">Atendimento</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase mb-8">Estamos prontos para te ajudar</p>
            <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex items-center justify-between group">
              <span className="font-black text-sm text-zinc-300">suporte@crmplus.com</span>
              <button onClick={copyEmail} className="p-3 bg-zinc-900 rounded-xl text-zinc-500 hover:text-red-600 transition-all">
                {copied ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Copy size={20} />}
              </button>
            </div>
            <button onClick={() => setShowContact(false)} className="w-full mt-8 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-700">Fechar Janela</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
