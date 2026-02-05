
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, Utensils, FileText, LayoutGrid, Heart, ClipboardCheck, 
  CheckCircle, X, Copy, Mail, CreditCard, MessageSquare, Shield, ScrollText,
  Zap, BarChart3, ListChecks
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
      title: 'Sistema de Oficina', 
      desc: 'Gestão profissional do atendimento, do check-in à entrega.', 
      icon: <Wrench size={32} />, 
      detailed: 'Organize ordens de serviço, controle etapas do reparo e mantenha o histórico completo do veículo sempre acessível. Ideal para reduzir retrabalho, padronizar atendimentos e dar mais previsibilidade ao fluxo da oficina.',
      practical: [
        'Cadastro de clientes e veículos',
        'Abertura de OS com serviços, observações e prazos',
        'Linha do tempo do veículo (histórico de serviços e ocorrências)',
        'Status por etapa: Recebido → Em análise → Em execução → Pronto → Entregue',
        'Anexos e fotos por OS (opcional)'
      ],
      pilar: 'Integração Nativa com Orçamentos, Inspeção/Vistoria e Funil de Vendas',
      reports: 'Atualização em tempo real (OS abertas/fechadas, tempo médio por etapa, volume por período)'
    },
    { 
      id: 'restaurante', 
      title: 'Sistema de Restaurante', 
      desc: 'Controle simples e rápido da operação diária.', 
      icon: <Utensils size={32} />, 
      detailed: 'Gerencie mesas, comandas e pedidos com um fluxo prático, reduzindo erros e garantindo agilidade no atendimento — perfeito para operação de balcão e salão.',
      practical: [
        'Abertura/fechamento de mesas e comandas',
        'Registro de pedidos por mesa/cliente',
        'Status do pedido (enviado, em preparo, pronto, entregue)',
        'Histórico de consumo por cliente/mesa',
        'Resumo do dia (movimento e desempenho)'
      ],
      pilar: 'Integração Nativa com Relatórios e Histórico Operacional',
      reports: 'Atualização em tempo real (pedidos do dia, ticket médio, horários de pico, itens mais pedidos)'
    },
    { 
      id: 'orcamento', 
      title: 'Sistema de Orçamentos', 
      desc: 'Orçamentos que viram venda — com visual profissional e envio rápido.', 
      icon: <FileText size={32} />, 
      detailed: 'Crie propostas claras, envie pelo WhatsApp e gere PDFs padronizados com sua identidade visual. Acompanhe status para saber o que está em negociação e o que foi aprovado.',
      practical: [
        'Criação de orçamentos por cliente',
        'Itens/serviços com valores, descontos e observações',
        'Status do orçamento: Rascunho → Enviado → Em negociação → Aprovado → Recusado',
        'PDF profissional com logo e dados da empresa',
        'Envio rápido por WhatsApp (link ou PDF)'
      ],
      pilar: 'Integração Nativa com Funil de Vendas e Oficina',
      reports: 'Atualização em tempo real (taxa de aprovação, valores enviados, tempo até aprovação, motivos de perda)'
    },
    { 
      id: 'funil', 
      title: 'Funil de Vendas', 
      desc: 'Seu comercial em modo visual: saiba exatamente onde cada venda está.', 
      icon: <LayoutGrid size={32} />, 
      detailed: 'Organize leads e oportunidades em colunas Kanban, registre interações e acompanhe conversão por etapa para entender onde seu time está ganhando ou perdendo.',
      practical: [
        'Kanban com etapas personalizáveis',
        'Registro de contato e histórico por lead',
        'Próxima ação e lembretes (follow-up)',
        'Motivo de perda e observações',
        'Ranking simples por desempenho'
      ],
      pilar: 'Integração Nativa com Orçamentos e Histórico do Cliente',
      reports: 'Atualização em tempo real (conversão por etapa, volume de leads, previsão de fechamento, perdas por motivo)'
    },
    { 
      id: 'nps', 
      title: 'Sistema de NPS (Satisfação)', 
      desc: 'Feedback real, sem achismo: acompanhe satisfação e gere melhoria contínua.', 
      icon: <Heart size={32} />, 
      detailed: 'Envie pesquisas automaticamente, consolide respostas e acompanhe evolução por período, unidade ou atendente — com histórico por cliente.',
      practical: [
        'Envio de NPS por link (WhatsApp/Email)',
        'Coleta de nota + comentário',
        'Classificação automática (Promotor/Neutro/Detrator)',
        'Histórico por cliente e por período',
        'Painel de insights (tendência e pontos críticos)'
      ],
      pilar: 'Integração Nativa com Clientes e Atendimentos',
      reports: 'Atualização em tempo real (NPS geral, evolução semanal/mensal, causas mais citadas, taxa de resposta)'
    },
    { 
      id: 'inspeção', 
      title: 'Sistema de Inspeção / Vistoria', 
      desc: 'Padronize inspeções e gere laudos com credibilidade.', 
      icon: <ClipboardCheck size={32} />, 
      detailed: 'Use checklists, registre fotos e observações e transforme a vistoria em um documento profissional para o cliente — ideal para oficinas, frotas e serviços técnicos.',
      practical: [
        'Checklists personalizáveis por tipo de serviço',
        'Registro de fotos e observações por item',
        'Assinatura/ciência do cliente (opcional)',
        'Geração de laudo em PDF',
        'Histórico de vistorias por veículo/cliente'
      ],
      pilar: 'Integração Nativa com Oficina e Orçamentos',
      reports: 'Atualização em tempo real (vistorias realizadas, pendências por item, recorrência de problemas, tempo médio)'
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
    <div className="bg-black min-h-screen">
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
            <span className="text-red-600">NA PALMA DA SUA MÃO</span>
          </h1>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-zinc-200 font-bold leading-relaxed">
              Sistemas de gestão simples, inteligentes e sem complicação. que cabe no seu bolso.
            </p>
            <p className="text-lg text-zinc-400 font-medium leading-relaxed">
              Visualize o desempenho da sua empresa, acompanhe históricos e tome decisões com dados claros, em uma experiência rápida, interativa e acessível.
            </p>
            <div className="pt-4">
              <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-sm mb-2 text-red-600">Conheça agora a plataforma.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/signup')} className="w-full sm:w-auto bg-red-600 text-white px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-red-600/20">Começar Teste Grátis</button>
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-zinc-900 text-white px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-all">Área do Cliente</button>
          </div>
        </div>
      </section>

      <section id="modulos" className="py-24 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter">Nossos sistemas</h2>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Soluções de alta performance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((m) => (
              <div key={m.id} className="group bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-red-600/50 transition-all flex flex-col h-full shadow-2xl relative overflow-hidden">
                <div className="text-red-600 mb-6 group-hover:scale-110 transition-transform">{m.icon}</div>
                <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">{m.title}</h3>
                <p className="text-zinc-400 font-medium mb-8 flex-1 leading-relaxed">{m.desc}</p>
                <div className="flex gap-4">
                  <button onClick={() => setActiveModuleDetail(m)} className="flex-1 bg-zinc-800 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-700 transition-colors">Detalhes</button>
                  <button onClick={() => navigate('/signup')} className="flex-1 bg-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 shadow-lg">Ativar Teste</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="py-24 px-6">
        <div className="max-w-3xl mx-auto bg-zinc-900 border border-red-600/20 p-12 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={120} /></div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Preço Único</h2>
          <div className="flex items-center justify-center gap-4">
            <span className="text-6xl font-black">R$ 50</span>
            <div className="text-left"><p className="font-black uppercase text-red-600 leading-none">/mês</p><p className="text-zinc-500 font-bold text-[10px] uppercase">por acesso ativo</p></div>
          </div>
          <button onClick={() => navigate('/signup')} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">Criar Conta Agora</button>
        </div>
      </section>

      <footer className="py-24 border-t border-zinc-900 text-zinc-600 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <span className="text-3xl font-black text-red-600 italic tracking-tighter block">CRMPLUS+</span>
            <p className="text-sm font-medium max-w-sm uppercase leading-relaxed">Simplificando a gestão de empresas com tecnologia modular de ponta.</p>
          </div>
          <div className="space-y-6">
            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Produto</p>
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
          <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-[3.5rem] w-full max-w-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <button onClick={() => setActiveModuleDetail(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white z-10"><X size={24}/></button>
            
            <div className="overflow-y-auto pr-4 no-scrollbar">
              <div className="text-red-600 mb-8">{activeModuleDetail.icon}</div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-6">{activeModuleDetail.title}</h2>
              <p className="text-zinc-200 text-lg font-bold leading-relaxed mb-10">{activeModuleDetail.detailed}</p>
              
              <div className="mb-12">
                <h4 className="text-red-600 font-black uppercase text-xs tracking-[0.2em] mb-6 flex items-center gap-2">
                  <ListChecks size={18} /> O que faz na prática:
                </h4>
                <div className="space-y-4">
                  {activeModuleDetail.practical?.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-4 bg-black/40 border border-zinc-800 p-4 rounded-2xl group hover:border-red-600/30 transition-all">
                      <div className="mt-1 flex-shrink-0"><CheckCircle size={14} className="text-red-600" /></div>
                      <p className="text-zinc-400 text-sm font-bold uppercase tracking-tight">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-black/40 border border-zinc-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-red-600/50 transition-all">
                  <div className="absolute top-4 right-4 text-red-600/10 group-hover:text-red-600/20 transition-all"><Zap size={40} /></div>
                  <p className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-4">Pilar</p>
                  <p className="text-white font-bold text-xs uppercase leading-relaxed">{activeModuleDetail.pilar}</p>
                </div>
                <div className="bg-black/40 border border-zinc-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-red-600/50 transition-all">
                  <div className="absolute top-4 right-4 text-red-600/10 group-hover:text-red-600/20 transition-all"><BarChart3 size={40} /></div>
                  <p className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-4">Relatórios</p>
                  <p className="text-white font-bold text-xs uppercase leading-relaxed">{activeModuleDetail.reports}</p>
                </div>
              </div>
            </div>

            <button onClick={() => { navigate('/signup'); setActiveModuleDetail(null); }} className="w-full mt-6 bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-600/20 hover:scale-[1.02] transition-all">Ativar Teste Agora</button>
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
              <p>1. USO DOS SERVIÇOS: O acesso é concedido mediante assinatura ativa ou período de teste válido.</p>
              <p>2. PROPRIEDADE INTELECTUAL: Todo o código e design da plataforma são protegidos por leis de direitos autorais.</p>
              <p>3. DADOS: Seus dados são criptografados. Não compartilhamos informações com terceiros sem consentimento.</p>
              <p>4. CANCELAMENTO: Você pode cancelar sua assinatura a qualquer momento, sem taxas de fidelidade.</p>
              <p>Estes termos são atualizados periodicamente para garantir a melhor segurança jurídica aos nossos usuários.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
