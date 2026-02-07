
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    { label: 'MENSAL', price: '50', duration: 'MÊS' },
    { label: 'SEMESTRAL', price: '250', duration: '6 MESES' },
    { label: 'ANUAL', price: '480', duration: 'ANO' }
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-black min-h-screen text-zinc-200 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-[100] border-b border-zinc-900 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <span className="text-3xl font-black text-red-600 italic tracking-tighter cursor-pointer" onClick={() => navigate('/')}>CRMPLUS+</span>
          <nav className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <button onClick={() => scrollTo('precos')} className="hover:text-red-600 transition-colors">Preços</button>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Entrar</button>
            <button onClick={() => navigate('/signup')} className="bg-red-600 text-white px-10 py-3 rounded-full hover:bg-red-700 transition-all font-black shadow-lg shadow-red-600/20">Criar Conta</button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-64 pb-32 px-6 text-center space-y-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-6xl md:text-[9rem] font-black text-white tracking-tighter uppercase italic leading-[0.8] animate-in fade-in">
            SISTEMAS <br/><span className="text-red-600">MODULARES</span>
          </h1>
          <p className="text-zinc-600 font-black uppercase text-xs tracking-[0.6em]">Alta Performance para seu Negócio</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button onClick={() => scrollTo('precos')} className="px-14 py-6 bg-red-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-red-600/30 hover:scale-105 transition-all">Ver Planos</button>
          <button onClick={() => navigate('/login')} className="px-14 py-6 bg-zinc-900 border border-zinc-800 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all">Acessar Portal</button>
        </div>
      </section>

      {/* Pricing - Design Matching User Image */}
      <section id="precos" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">VALORES <span className="text-red-600">FIXOS</span></h2>
            <p className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.4em]">Escolha a modalidade que melhor se adapta à sua empresa</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {plans.map((plan) => (
              <div key={plan.label} className="bg-[#0c0c0c] border border-zinc-900 rounded-[4rem] p-12 lg:p-16 text-center space-y-12 relative overflow-hidden group hover:border-red-600/40 transition-all duration-500">
                <div className="absolute top-10 right-10 text-zinc-800 group-hover:text-zinc-700 transition-colors">
                  <CreditCard size={48} />
                </div>
                
                <div className="space-y-4 pt-10">
                  <p className="text-3xl font-black text-white uppercase italic tracking-tighter">VALOR FIXO</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none">R$ {plan.price}</span>
                    <div className="text-left space-y-0.5">
                      <p className="text-red-600 font-black text-[10px] uppercase tracking-widest">/{plan.duration}</p>
                      <p className="text-zinc-600 font-black text-[8px] uppercase tracking-widest leading-none">POR SISTEMA</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">SEM TAXAS OCULTAS • SUPORTE VIA WHATSAPP INCLUSO</p>
                  <button 
                    onClick={() => navigate('/signup')} 
                    className="w-full bg-red-600 text-white py-7 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-red-600/10 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    ATIVAR AGORA
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 border-t border-zinc-900 text-center space-y-10">
        <span className="text-4xl font-black text-red-600 italic tracking-tighter">CRMPLUS+</span>
        <div className="flex justify-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
           <button onClick={() => scrollTo('precos')} className="hover:text-red-600">Sistemas</button>
           <button onClick={() => scrollTo('precos')} className="hover:text-red-600">Preços</button>
           <button onClick={() => navigate('/login')} className="hover:text-red-600">Entrar</button>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-800">© CRMPLUS+ TECNOLOGIA. TODOS OS DIREITOS RESERVADOS.</p>
      </footer>
    </div>
  );
};

export default Landing;
