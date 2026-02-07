
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, Utensils, FileText, LayoutGrid, Heart, ClipboardCheck, 
  CheckCircle, X, Copy, Mail, CreditCard, MessageSquare, Shield, ScrollText,
  Zap, BarChart3, ListChecks, ArrowUpRight, Menu
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const [showLegal, setShowLegal] = useState<'terms' | 'privacy' | null>(null);
  const [activeModuleDetail, setActiveModuleDetail] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const modules = [
    { 
      id: 'oficina', 
      title: '🔧 Oficina Pro', 
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800',
      desc: 'Diagnóstico tecnológico e gestão de O.S. na palma da mão.', 
      icon: <Wrench size={32} />, 
      detailed: 'Diagnósticos inteligentes, ordens de serviço e fotos do motor direto do celular. Mais transparência, histórico completo e aprovação do orçamento por link.',
      practical: [
        'Abertura de OS via mobile com fotos',
        'Checklist de entrada em tempo real',
        'Histórico completo do veículo',
        'Status acessível via link público',
        'Aprovação 100% digital'
      ],
      pilar: 'Tecnologia Aplicada ao Diagnóstico',
      reports: 'Tempo de box, Ticket médio, Conversão'
    },
    { 
      id: 'restaurante', 
      title: '🍽 Restaurante Gastro', 
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800',
      desc: 'Comanda eletrônica e agilidade máxima no salão.', 
      icon: <Utensils size={32} />, 
      detailed: 'Experiência que o cliente percebe. Elimine erros de pedido e acelere entregas com integração total entre salão e cozinha.',
      practical: [
        'Lançamento de pedidos via celular',
        'Impressão automática na cozinha',
        'Divisão de contas simplificada',
        'Gestão de mesas em tempo real',
        'Relatórios de pratos e giro'
      ],
      pilar: 'Experiência do Cliente Digital',
      reports: 'Vendas por garçom, Pratos preferidos'
    },
    { 
      id: 'orcamento', 
      title: '📄 Orçamentos Flash', 
      image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=800',
      desc: 'Orçamentos profissionais e fechamentos rápidos.', 
      icon: <FileText size={32} />, 
      detailed: 'Transforme o balcão da sua loja em uma máquina de vendas. Crie orçamentos detalhados enquanto atende e envie via WhatsApp.',
      practical: [
        'Emissão rápida de PDF profissional',
        'Envio automático via WhatsApp',
        'Acompanhamento de pendências',
        'Conversão rápida em Venda/OS',
        'Preços dinâmicos por perfil'
      ],
      pilar: 'Agilidade Comercial Máxima',
      reports: 'Taxa de conversão, Volume de propostas'
    },
  ];

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-black min-h-screen text-zinc-200 overflow-x-hidden">
      <header className="fixed top-0 w-full z-[100] border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <span className="text-xl md:text-2xl font-black text-red-600 italic tracking-tighter">CRMPLUS+</span>
          
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-zinc-400">
            <button onClick={() => scrollTo('modulos')} className="hover:text-red-500 transition-colors">Sistemas</button>
            <button onClick={() => scrollTo('precos')} className="hover:text-red-500 transition-colors">Preços</button>
            <button onClick={() => navigate('/login')} className="hover:text-red-500 transition-colors">Entrar</button>
            <button onClick={() => navigate('/signup')} className="bg-red-600 text-white px-6 py-2.5 rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">Criar Conta</button>
          </nav>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-zinc-400">
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-black border-b border-zinc-800 p-6 flex flex-col gap-6 md:hidden animate-in fade-in slide-in-from-top-2">
            <button onClick={() => scrollTo('modulos')} className="text-left font-black uppercase text-xs tracking-widest">Sistemas</button>
            <button onClick={() => scrollTo('precos')} className="text-left font-black uppercase text-xs tracking-widest">Preços</button>
            <button onClick={() => navigate('/login')} className="text-left font-black uppercase text-xs tracking-widest text-red-600">Entrar na Área do Cliente</button>
            <button onClick={() => navigate('/signup')} className="bg-red-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest">Ativar agora</button>
          </div>
        )}
      </header>

      <section className="pt-32 md:pt-48 pb-20 md:pb-32 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8 md:space-y-12 animate-in fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter uppercase flex flex-col items-center">
            <span className="text-white">GESTÃO DO SEU NEGÓCIO</span>
            <span className="text-red-600">POR ASSINATURA</span>
          </h1>
          
          <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
            <p className="text-lg md:text-2xl text-zinc-200 font-bold leading-relaxed">
              Sistemas inteligentes para quem busca eficiência real sem complicação.
            </p>
            <p className="text-sm md:text-lg text-zinc-400 font-medium leading-relaxed">
              Ative apenas o que sua empresa precisa e pague de forma modular.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <button onClick={() => navigate('/signup')} className="w-full sm:w-auto bg-red-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-sm md:text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-red-600/20">Começar Agora</button>
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-zinc-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-sm md:text-lg uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-all">Acessar Portal</button>
          </div>
        </div>
      </section>

      <section id="modulos" className="py-16 md:py-24 px-4 md:px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-4 tracking-tighter">Nosso Catálogo</h2>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Sistemas prontos para escalar sua operação</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {modules.map((m) => (
              <div 
                key={m.id} 
                onClick={() => setActiveModuleDetail(m)}
                className="group bg-zinc-900 border border-zinc-800 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col h-full shadow-2xl cursor-pointer hover:border-red-600/40 transition-all relative"
              >
                <div className="aspect-[16/10] overflow-hidden relative bg-black">
                  <img 
                    src={m.image} 
                    alt={m.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 text-red-600">
                    {m.icon}
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="text-xl md:text-2xl font-black uppercase mb-2 tracking-tight">{m.title}</h3>
                  <p className="text-zinc-400 font-medium text-xs md:text-sm mb-8 flex-1 leading-relaxed">{m.desc}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Conhecer módulo</span>
                    <ArrowUpRight size={18} className="text-zinc-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="py-20 md:py-24 px-4 md:px-6">
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-red-600/20 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] text-center space-y-6 md:space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><CreditCard size={100} /></div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Valor Fixo</h2>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl md:text-6xl font-black text-white">R$ 50</span>
            <div className="text-left"><p className="font-black uppercase text-red-600 leading-none">/mês</p><p className="text-zinc-500 font-bold text-[8px] uppercase">por sistema</p></div>
          </div>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Sem taxas ocultas • Suporte via WhatsApp incluso</p>
          <button onClick={() => navigate('/signup')} className="w-full bg-red-600 text-white py-4 md:py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">Ativar agora</button>
        </div>
      </section>

      <footer className="py-16 md:py-24 border-t border-zinc-900 text-zinc-600 bg-zinc-950 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-16 text-center md:text-left">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <span className="text-2xl font-black text-red-600 italic tracking-tighter block">CRMPLUS+</span>
            <p className="text-xs font-medium max-w-sm uppercase leading-relaxed mx-auto md:mx-0">Sistemas modulares de alta performance para o seu crescimento.</p>
          </div>
          <div className="space-y-4">
            <p className="text-white font-black text-[9px] uppercase tracking-[0.3em]">Navegação</p>
            <nav className="flex flex-col gap-3 text-[10px] font-black uppercase tracking-widest">
              <button onClick={() => scrollTo('modulos')} className="hover:text-red-500 transition-colors">Sistemas</button>
              <button onClick={() => scrollTo('precos')} className="hover:text-red-500 transition-colors">Preços</button>
              <button onClick={() => navigate('/login')} className="hover:text-red-500 transition-colors">Entrar</button>
            </nav>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-zinc-900 text-center text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em]">
          © {new Date().getFullYear()} CRMPLUS+ TECNOLOGIA. TODOS OS DIREITOS RESERVADOS.
        </div>
      </footer>

      {/* Responsive Detail Modal */}
      {activeModuleDetail && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/95 p-0 md:p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border-t md:border border-zinc-800 rounded-t-[2.5rem] md:rounded-[3.5rem] w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
            <button onClick={() => setActiveModuleDetail(null)} className="absolute top-4 right-4 md:top-8 md:right-8 text-white z-50 bg-black/50 p-2 rounded-full backdrop-blur-md shadow-lg"><X size={20}/></button>
            
            <div className="overflow-y-auto no-scrollbar">
              <div className="aspect-[16/9] md:aspect-video w-full relative bg-black">
                <img src={activeModuleDetail.image} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 space-y-2">
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">{activeModuleDetail.title}</h2>
                </div>
              </div>

              <div className="p-6 md:p-12 pt-4 relative z-10 space-y-10">
                <p className="text-zinc-200 text-lg md:text-xl font-bold leading-relaxed">{activeModuleDetail.detailed}</p>
                
                <div>
                  <h4 className="text-red-600 font-black uppercase text-[10px] tracking-[0.2em] mb-6 flex items-center gap-2">
                    <ListChecks size={16} /> Praticidade no dia a dia:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeModuleDetail.practical?.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 bg-black/40 border border-zinc-800 p-4 rounded-xl">
                        <CheckCircle size={14} className="text-red-600 mt-0.5" />
                        <p className="text-zinc-300 text-xs font-bold uppercase tracking-tight">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                  <div className="bg-black/40 border border-zinc-800 p-6 rounded-2xl">
                    <p className="text-red-600 font-black uppercase text-[8px] tracking-widest mb-2">Foco</p>
                    <p className="text-white font-bold text-[10px] uppercase">{activeModuleDetail.pilar}</p>
                  </div>
                  <div className="bg-black/40 border border-zinc-800 p-6 rounded-2xl">
                    <p className="text-red-600 font-black uppercase text-[8px] tracking-widest mb-2">Dados</p>
                    <p className="text-white font-bold text-[10px] uppercase">{activeModuleDetail.reports}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-white/5 bg-zinc-900/50 backdrop-blur-xl">
              <button onClick={() => { navigate('/signup'); setActiveModuleDetail(null); }} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl">Ativar este serviço agora</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
