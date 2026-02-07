
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, Utensils, FileText, LayoutGrid, Heart, ClipboardCheck, 
  CheckCircle, X, Copy, Mail, CreditCard, MessageSquare, Shield, ScrollText,
  Zap, BarChart3, ListChecks, ArrowUpRight
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const [showLegal, setShowLegal] = useState<'terms' | 'privacy' | null>(null);
  const [activeModuleDetail, setActiveModuleDetail] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const modules = [
    { 
      id: 'oficina', 
      title: '🔧 Sistema de Oficina', 
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800',
      desc: 'Diagnóstico tecnológico e gestão de O.S. na palma da mão.', 
      icon: <Wrench size={32} />, 
      detailed: 'Diagnósticos inteligentes, ordens de serviço e fotos do motor direto do celular. Mais transparência, histórico completo e aprovação do orçamento por link.',
      practical: [
        'Abertura de OS via mobile com diagnóstico via scanner',
        'Checklist de entrada com fotos em tempo real',
        'Histórico completo do veículo (Timeline)',
        'Status de reparo acessível pelo cliente via link',
        'Aprovação de orçamentos 100% digital'
      ],
      pilar: 'Tecnologia Aplicada ao Diagnóstico Automotivo',
      reports: 'Tempo médio de box, OS abertas/fechadas, Ticket médio'
    },
    { 
      id: 'restaurante', 
      title: '🍽 Sistema de Restaurante', 
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800',
      desc: 'Comanda eletrônica e agilidade máxima no salão.', 
      icon: <Utensils size={32} />, 
      detailed: 'Experiência que o cliente percebe. Elimine erros de pedido e acelere entregas com integração total entre salão e cozinha.',
      practical: [
        'Lançamento de pedidos direto na mesa via celular',
        'Impressão automática de tickets na cozinha/bar',
        'Divisão de contas rápida e intuitiva',
        'Gestão de mesas e reservas em tempo real',
        'Relatórios de pratos mais vendidos e giro de mesa'
      ],
      pilar: 'Agilidade e Experiência do Cliente (Atendimento Digital)',
      reports: 'Vendas por garçom, pratos preferidos, horários de pico'
    },
    { 
      id: 'orcamento', 
      title: '📄 Sistema de Orçamentos', 
      image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=800',
      desc: 'Orçamentos profissionais e fechamentos rápidos.', 
      icon: <FileText size={32} />, 
      detailed: 'Transforme o balcão da sua loja em uma máquina de vendas. Crie orçamentos detalhados enquanto atende, envie via WhatsApp e receba a aprovação digital imediata do seu cliente.',
      practical: [
        'Emissão de orçamentos rápidos com PDF profissional',
        'Envio automático de link para aprovação digital',
        'Integração com estoque e preços dinâmicos',
        'Acompanhamento de orçamentos pendentes',
        'Conversão rápida de orçamento em Venda/OS'
      ],
      pilar: 'Profissionalismo e Agilidade Comercial',
      reports: 'Taxa de conversão, volume de propostas, ticket médio'
    },
    { 
      id: 'funil', 
      title: '📊 Funil de Vendas (CRM)', 
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
      desc: 'Gestão comercial estratégica para sua equipe.', 
      icon: <LayoutGrid size={32} />, 
      detailed: 'Assuma o controle total dos seus leads. Visualize cada etapa da negociação em um quadro Kanban e garanta que nenhuma oportunidade de negócio seja perdida por falta de acompanhamento.',
      practical: [
        'Quadro visual de oportunidades (Pipeline)',
        'Registro automático de interações com leads',
        'Agendamento de follow-ups e lembretes',
        'Análise de motivos de perda de negócios',
        'Previsão de faturamento mensal baseado no funil'
      ],
      pilar: 'Gestão Estratégica Orientada por Dados',
      reports: 'Conversão por etapa, performance de vendas, forecast'
    },
    { 
      id: 'nps', 
      title: '⭐ Sistema de NPS', 
      image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800',
      desc: 'Entenda a satisfação real do seu cliente.', 
      icon: <Heart size={32} />, 
      detailed: 'Mensure a lealdade do seu público de forma automática. Colete feedbacks logo após a entrega do serviço e aja rapidamente para transformar clientes neutros em promotores da sua marca.',
      practical: [
        'Disparo automático de pesquisas via e-mail/WhatsApp',
        'Dashboard de índice NPS em tempo real',
        'Coleta de feedbacks qualitativos detalhados',
        'Alertas imediatos para clientes insatisfeitos',
        'Relatórios de evolução da satisfação'
      ],
      pilar: 'Melhoria Contínua e Foco no Sucesso do Cliente',
      reports: 'Índice NPS, análise de sentimento, promotores vs detratores'
    },
    { 
      id: 'inspeção', 
      title: '🔍 Sistema de Inspeção', 
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
      desc: 'Checklists técnicos e controle de qualidade industrial.', 
      icon: <ClipboardCheck size={32} />, 
      detailed: 'Padronize vistorias e garanta a conformidade técnica. Registre não conformidades com fotos detalhadas e gere laudos profissionais instantaneamente, direto do chão de fábrica ou pátio.',
      practical: [
        'Checklists digitais inteligentes e padronizados',
        'Registro fotográfico de não conformidades no ato',
        'Assinatura digital de inspeção via mobile',
        'Geração automática de laudo técnico em PDF',
        'Histórico completo de vistorias por ativo'
      ],
      pilar: 'Controle de Qualidade e Conformidade Técnica',
      reports: 'Falhas recorrentes, tempo de inspeção, conformidade geral'
    },
  ];

  const copyEmail = () => {
    navigator.clipboard.writeText('suporte@crmplus.com.br');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-black min-h-screen text-zinc-200">
      <header className="fixed top-0 w-full z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <span className="text-2xl font-black text-red-600 italic tracking-tighter">CRMPLUS+</span>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-zinc-400">
            <button onClick={() => scrollTo('modulos')} className="hover:text-red-500 transition-colors">Sistemas</button>
            <button onClick={() => scrollTo('precos')} className="hover:text-red-500 transition-colors">Preços</button>
            <button onClick={() => navigate('/login')} className="hover:text-red-500 transition-colors">Entrar</button>
            <button onClick={() => navigate('/signup')} className="bg-red-600 text-white px-6 py-2.5 rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">Criar Conta</button>
          </nav>
        </div>
      </header>

      <section className="pt-48 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-12 animate-in fade-in">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter uppercase flex flex-col items-center">
            <span className="text-white">GESTÃO DO SEU NEGÓCIO</span>
            <span className="text-red-600">SERVIÇO POR ASSINATURA</span>
          </h1>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-zinc-200 font-bold leading-relaxed">
              Sistemas inteligentes para quem busca eficiência real sem complicação.
            </p>
            <p className="text-lg text-zinc-400 font-medium leading-relaxed">
              Módulos individuais para oficina, restaurante, vendas e auditoria. Ative apenas o que você precisa e pague por sistema.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/signup')} className="w-full sm:w-auto bg-red-600 text-white px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-red-600/20">Começar Agora</button>
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-zinc-900 text-white px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-all">Acessar Área do Cliente</button>
          </div>
        </div>
      </section>

      <section id="modulos" className="py-24 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter">Nossos Sistemas de Gestão</h2>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Escolha os serviços ideais para o seu segmento</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {modules.map((m) => (
              <div 
                key={m.id} 
                onClick={() => setActiveModuleDetail(m)}
                className="group bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden flex flex-col h-full shadow-2xl cursor-pointer hover:border-red-600/40 transition-all relative"
              >
                <div className="aspect-[16/10] overflow-hidden relative bg-black">
                  <img 
                    src={m.image} 
                    alt={m.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                    onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.src = "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                  <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                    {m.icon}
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black uppercase mb-3 tracking-tight group-hover:text-red-500 transition-colors">{m.title}</h3>
                  <p className="text-zinc-400 font-medium text-sm mb-10 flex-1 leading-relaxed">{m.desc}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ver detalhes do serviço</span>
                    <ArrowUpRight size={20} className="text-zinc-700 group-hover:text-red-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="py-24 px-6">
        <div className="max-w-3xl mx-auto bg-zinc-900 border border-red-600/20 p-12 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={120} /></div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Transparência Total</h2>
          <div className="flex items-center justify-center gap-4">
            <span className="text-6xl font-black text-white">R$ 50</span>
            <div className="text-left"><p className="font-black uppercase text-red-600 leading-none">/mês</p><p className="text-zinc-500 font-bold text-[10px] uppercase">por sistema assinado</p></div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Sem fidelidade • Sem taxas ocultas • Suporte técnico incluso</p>
          <button onClick={() => navigate('/signup')} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">Começar Agora</button>
        </div>
      </section>

      <footer className="py-24 border-t border-zinc-900 text-zinc-600 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <span className="text-3xl font-black text-red-600 italic tracking-tighter block">CRMPLUS+</span>
            <p className="text-sm font-medium max-w-sm uppercase leading-relaxed">A tecnologia que o seu negócio precisa com foco em sistemas modulares.</p>
          </div>
          <div className="space-y-6">
            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Serviços</p>
            <nav className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest">
              <button onClick={() => scrollTo('modulos')} className="text-left hover:text-red-500 transition-colors">Sistemas</button>
              <button onClick={() => scrollTo('precos')} className="text-left hover:text-red-500 transition-colors">Preços</button>
              <button onClick={() => navigate('/login')} className="text-left hover:text-red-500 transition-colors">Login</button>
            </nav>
          </div>
          <div className="space-y-6">
            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Suporte & Legal</p>
            <nav className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest">
              <button onClick={() => setShowLegal('terms')} className="text-left hover:text-red-500 transition-colors">Termos de uso</button>
              <button onClick={() => setShowLegal('privacy')} className="text-left hover:text-red-500 transition-colors">Privacidade</button>
              <button onClick={() => setShowContact(true)} className="text-left hover:text-red-500 transition-colors">Fale Conosco</button>
            </nav>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-16 mt-16 border-t border-zinc-900 text-center text-[10px] font-black uppercase tracking-[0.5em]">
          © {new Date().getFullYear()} CRMPLUS+ TECNOLOGIA. TODOS OS DIREITOS RESERVADOS.
        </div>
      </footer>

      {/* Modal de Detalhes do Módulo */}
      {activeModuleDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3.5rem] w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <button onClick={() => setActiveModuleDetail(null)} className="absolute top-8 right-8 text-white hover:text-red-600 z-50 bg-black/50 p-2 rounded-full backdrop-blur-md transition-all shadow-lg"><X size={24}/></button>
            
            <div className="overflow-y-auto pr-4 no-scrollbar">
              <div className="aspect-video w-full relative bg-black">
                <img 
                    src={activeModuleDetail.image} 
                    alt="" 
                    className="w-full h-full object-cover opacity-60" 
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
                <div className="absolute bottom-12 left-12 space-y-4">
                  <div className="text-red-600 bg-black/40 backdrop-blur-md w-fit p-6 rounded-3xl border border-white/10 shadow-2xl">{activeModuleDetail.icon}</div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">{activeModuleDetail.title}</h2>
                </div>
              </div>

              <div className="p-8 md:p-12 pt-0 -mt-6 relative z-10">
                <p className="text-zinc-200 text-xl font-bold leading-relaxed mb-12 max-w-3xl">{activeModuleDetail.detailed}</p>
                
                <div className="mb-16">
                  <h4 className="text-red-600 font-black uppercase text-xs tracking-[0.2em] mb-8 flex items-center gap-3">
                    <ListChecks size={20} /> Funcionalidades Práticas:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeModuleDetail.practical?.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 bg-black/40 border border-zinc-800 p-5 rounded-2xl group hover:border-red-600/30 transition-all">
                        <div className="mt-1 flex-shrink-0"><CheckCircle size={14} className="text-red-600" /></div>
                        <p className="text-zinc-300 text-sm font-bold uppercase tracking-tight">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="bg-black/40 border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-red-600/50 transition-all">
                    <div className="absolute top-4 right-4 text-red-600/10 group-hover:text-red-600/20 transition-all"><Zap size={48} /></div>
                    <p className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-4">Pilar de Negócio</p>
                    <p className="text-white font-bold text-xs uppercase leading-relaxed">{activeModuleDetail.pilar}</p>
                  </div>
                  <div className="bg-black/40 border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-red-600/50 transition-all">
                    <div className="absolute top-4 right-4 text-red-600/10 group-hover:text-red-600/20 transition-all"><BarChart3 size={48} /></div>
                    <p className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-4">Principais Dashboards</p>
                    <p className="text-white font-bold text-xs uppercase leading-relaxed">{activeModuleDetail.reports}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-zinc-900/50 backdrop-blur-xl">
              <button onClick={() => { navigate('/signup'); setActiveModuleDetail(null); }} className="w-full bg-red-600 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-red-600/20 hover:scale-[1.01] active:scale-95 transition-all">Ativar Acesso Agora</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fale Conosco */}
      {showContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[3rem] w-full max-w-md text-center shadow-2xl relative">
            <button onClick={() => setShowContact(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={24}/></button>
            <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-8"><MessageSquare size={40}/></div>
            <h2 className="text-2xl font-black uppercase mb-4 tracking-tighter text-white">Fale com a gente</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Dúvidas técnicas ou comerciais?</p>
            <div className="space-y-3">
              <button onClick={copyEmail} className="w-full bg-black border border-zinc-800 p-5 rounded-2xl flex items-center justify-between hover:border-red-600 transition-all group">
                <div className="flex items-center gap-4"><Mail size={20} className="text-zinc-600 group-hover:text-red-600"/><span className="font-bold text-sm text-zinc-300">suporte@crmplus.com.br</span></div>
                {copied ? <CheckCircle size={18} className="text-emerald-500"/> : <Copy size={18} className="text-zinc-700"/>}
              </button>
              <a href="https://wa.me/55000000000" target="_blank" className="w-full bg-emerald-600/10 border border-emerald-500/20 p-5 rounded-2xl flex items-center gap-4 hover:bg-emerald-600 transition-all group no-underline">
                <MessageSquare size={20} className="text-emerald-500 group-hover:text-white"/>
                <span className="font-black uppercase text-[10px] tracking-widest text-emerald-500 group-hover:text-white">Chamar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Legal */}
      {showLegal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[3.5rem] w-full max-w-2xl shadow-2xl relative max-h-[80vh] flex flex-col">
            <button onClick={() => setShowLegal(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={24}/></button>
            <div className="flex items-center gap-4 mb-8">
              {showLegal === 'terms' ? <ScrollText className="text-red-600"/> : <Shield className="text-red-600"/>}
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                {showLegal === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 text-zinc-400 text-sm font-medium leading-relaxed space-y-6 no-scrollbar">
              <p>O Serviço CRMPLUS+ é uma plataforma modular de gestão empresarial.</p>
              <p>1. LICENCIAMENTO: O acesso é concedido por sistema assinado, com renovação mensal recorrente.</p>
              <p>2. DADOS: A CRMPLUS+ garante a criptografia e sigilo dos dados inseridos, não compartilhando informações com terceiros.</p>
              <p>3. RESPONSABILIDADE: O usuário é responsável pela veracidade dos dados e pela gestão dos acessos internos.</p>
              <p>4. SUPORTE: Atendimento especializado via e-mail e WhatsApp em horário comercial.</p>
              <p>Esta plataforma evolui constantemente para oferecer a melhor experiência técnica aos nossos parceiros.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
