
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, Utensils, FileText, LayoutGrid, Heart, ClipboardCheck, 
  CheckCircle, X, Copy, Mail, CreditCard, MessageSquare, Shield, ScrollText
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const [showLegal, setShowLegal] = useState<'terms' | 'privacy' | null>(null);
  const [activeModuleDetail, setActiveModuleDetail] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const modules = [
    { id: 'oficina', title: 'Oficina', desc: 'Ordens de serviço, peças, fotos e histórico completo.', icon: <Wrench size={32} />, detailed: 'A solução definitiva para mecânicas. Controle estoque de peças em tempo real, gere checklists de entrada e mantenha o histórico do veículo sempre à mão.' },
    { id: 'restaurante', title: 'Restaurante', desc: 'Pedidos, categorias, produtos e observações de mesa.', icon: <Utensils size={32} />, detailed: 'Gestão ágil para gastronomia. Organize mesas, controle comandas por QR Code e tenha relatórios de produtos mais vendidos instantaneamente.' },
    { id: 'orcamento', title: 'Orçamento', desc: 'Itens, PDF profissional e link compartilhável.', icon: <FileText size={32} />, detailed: 'Transforme orçamentos em vendas. Envie links interativos para aprovação via WhatsApp e gere PDFs profissionais com a sua logo em um clique.' },
    { id: 'funil', title: 'Funil de Vendas', desc: 'Controle de leads via kanban e taxas de conversão.', icon: <LayoutGrid size={32} />, detailed: 'Não perca nenhum negócio. Visualize sua jornada de vendas em colunas Kanban e identifique gargalos no seu processo comercial.' },
    { id: 'nps', title: 'NPS', desc: 'Pesquisas e dashboard de satisfação de clientes.', icon: <Heart size={32} />, detailed: 'Ouça seu cliente. Dispare pesquisas automáticas após o fechamento de cada serviço e melhore sua reputação no mercado.' },
    { id: 'inspeção', title: 'Inspeção/Vistoria', desc: 'Checklist, fotos por item e exportação de laudos.', icon: <ClipboardCheck size={32} />, detailed: 'Segurança em primeiro lugar. Crie laudos técnicos detalhados com fotos ilimitadas para comprovar o estado de qualquer bem ou serviço.' },
  ];

  const copyEmail = () => {
    navigator.clipboard.writeText('contato@crmplus.com.br');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
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
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase">Sistemas de gestão <span className="text-red-600">do seu jeito.</span></h1>
          <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto">Ative apenas os módulos que você precisa e controle tudo com perfis, histórico e personalização total por empresa.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/signup')} className="w-full sm:w-auto bg-red-600 text-white px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 transition-all">Começar Trial Grátis</button>
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-zinc-900 text-white px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-all">Portal do Cliente</button>
          </div>
        </div>
      </section>

      <section id="modulos" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter">Nossos Módulos</h2>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Soluções modulares de alta performance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((m) => (
              <div key={m.id} className="group bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-red-600/50 transition-all flex flex-col h-full shadow-2xl relative overflow-hidden">
                <div className="text-red-600 mb-6 group-hover:scale-110 transition-transform">{m.icon}</div>
                <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">{m.title}</h3>
                <p className="text-zinc-400 font-medium mb-8 flex-1 leading-relaxed">{m.desc}</p>
                <div className="flex gap-4">
                  <button onClick={() => setActiveModuleDetail(m)} className="flex-1 bg-zinc-800 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-700 transition-colors">Detalhes</button>
                  <button onClick={() => navigate('/signup')} className="flex-1 bg-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 shadow-lg">Ativar Trial</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="py-24 px-6">
        <div className="max-w-3xl mx-auto bg-zinc-900 border border-red-600/20 p-12 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={120} /></div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Transparência Total</h2>
          <div className="flex items-center justify-center gap-4">
            <span className="text-6xl font-black">R$ 50</span>
            <div className="text-left"><p className="font-black uppercase text-red-600 leading-none">/mês</p><p className="text-zinc-500 font-bold text-[10px] uppercase">por módulo ativo</p></div>
          </div>
          <button onClick={() => navigate('/signup')} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">Criar Conta Agora</button>
        </div>
      </section>

      <footer className="py-24 border-t border-zinc-900 text-zinc-600 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <span className="text-3xl font-black text-red-600 italic tracking-tighter block">CRMPLUS+</span>
            <p className="text-sm font-medium max-w-sm uppercase leading-relaxed">Simplificando a gestão de milhares de empresas com tecnologia modular de ponta.</p>
          </div>
          <div className="space-y-6">
            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Produto</p>
            <nav className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest">
              <button onClick={() => scrollTo('modulos')} className="text-left hover:text-red-500">Recursos</button>
              <button onClick={() => scrollTo('precos')} className="text-left hover:text-red-500">Preços</button>
              <button onClick={() => navigate('/login')} className="text-left hover:text-red-500">Login</button>
            </nav>
          </div>
          <div className="space-y-6">
            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Suporte & Legal</p>
            <nav className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest">
              <button onClick={() => setShowLegal('terms')} className="text-left hover:text-red-500">Termos de uso</button>
              <button onClick={() => setShowLegal('privacy')} className="text-left hover:text-red-500">Privacidade</button>
              <button onClick={() => setShowContact(true)} className="text-left hover:text-red-500">Fale Conosco</button>
            </nav>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-16 mt-16 border-t border-zinc-900 text-center text-[10px] font-black uppercase tracking-[0.5em]">
          © {new Date().getFullYear()} CRMPLUS+ TECNOLOGIA. TODOS OS DIREITOS RESERVADOS.
        </div>
      </footer>

      {/* Modais de Detalhes */}
      {activeModuleDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[3.5rem] w-full max-w-2xl shadow-2xl relative overflow-hidden">
            <button onClick={() => setActiveModuleDetail(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={24}/></button>
            <div className="text-red-600 mb-8">{activeModuleDetail.icon}</div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">{activeModuleDetail.title}</h2>
            <p className="text-zinc-400 text-lg font-medium leading-relaxed mb-10">{activeModuleDetail.detailed}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 border border-zinc-800 p-6 rounded-3xl">
                <p className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-2">Destaque</p>
                <p className="text-white font-bold text-sm">Integração Nativa</p>
              </div>
              <div className="bg-black/40 border border-zinc-800 p-6 rounded-3xl">
                <p className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-2">Relatórios</p>
                <p className="text-white font-bold text-sm">Atualização em Tempo Real</p>
              </div>
            </div>
            <button onClick={() => navigate('/signup')} className="w-full mt-10 bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Ativar TRIAL Agora</button>
          </div>
        </div>
      )}

      {/* Modal Fale Conosco */}
      {showContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[3rem] w-full max-w-md text-center shadow-2xl relative">
            <button onClick={() => setShowContact(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={24}/></button>
            <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-8"><MessageSquare size={40}/></div>
            <h2 className="text-2xl font-black uppercase mb-4 tracking-tighter">Central de Atendimento</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Escolha como prefere falar conosco</p>
            <div className="space-y-3">
              <button onClick={copyEmail} className="w-full bg-black border border-zinc-800 p-5 rounded-2xl flex items-center justify-between hover:border-red-600 transition-all group">
                <div className="flex items-center gap-4"><Mail size={20} className="text-zinc-600 group-hover:text-red-600"/><span className="font-bold text-sm text-zinc-300">contato@crmplus.com.br</span></div>
                {copied ? <CheckCircle size={18} className="text-emerald-500"/> : <Copy size={18} className="text-zinc-700"/>}
              </button>
              <a href="https://wa.me/55000000000" target="_blank" className="w-full bg-emerald-600/10 border border-emerald-500/20 p-5 rounded-2xl flex items-center gap-4 hover:bg-emerald-600 transition-all group">
                <MessageSquare size={20} className="text-emerald-500 group-hover:text-white"/>
                <span className="font-black uppercase text-[10px] tracking-widest text-emerald-500 group-hover:text-white">Suporte via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Legal (Termos/Privacidade) */}
      {showLegal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[3.5rem] w-full max-w-2xl shadow-2xl relative max-h-[80vh] flex flex-col">
            <button onClick={() => setShowLegal(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={24}/></button>
            <div className="flex items-center gap-4 mb-8">
              {showLegal === 'terms' ? <ScrollText className="text-red-600"/> : <Shield className="text-red-600"/>}
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                {showLegal === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 text-zinc-400 text-sm font-medium leading-relaxed space-y-6">
              <p>O Ecossistema CRMPLUS+ é uma plataforma de gestão modular operada pela CRMPLUS TECNOLOGIA.</p>
              <p>1. AO ACESSAR O SISTEMA, VOCÊ CONCORDA EM MANTER A CONFIDENCIALIDADE DOS DADOS DOS SEUS CLIENTES.</p>
              <p>2. A TAXA MENSAL É DE R$ 50,00 POR MÓDULO ATIVO, SEM FIDELIDADE CONTRATUAL.</p>
              <p>3. DADOS SENSÍVEIS SÃO CRIPTOGRAFADOS E ARMAZENADOS EM SERVIDORES DE ALTA SEGURANÇA.</p>
              <p>4. O USO DO TRIAL É LIMITADO A UMA VEZ POR CNPJ/CONTA POR MÓDULO.</p>
              <p>Para mais informações, entre em contato com nossa equipe jurídica.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
