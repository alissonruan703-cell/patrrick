
import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

const LockedModule: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-8">
        <Construction size={48} />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Módulo {name}</h1>
      <p className="text-slate-600 max-w-md mx-auto mb-10 text-lg">
        Estamos trabalhando duro para trazer as melhores ferramentas de gestão de {name.toLowerCase()} para você.
        Este módulo estará disponível em breve!
      </p>
      <Link 
        to="/" 
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
      >
        <ArrowLeft size={20} />
        Voltar para o Catálogo
      </Link>
    </div>
  );
};

export default LockedModule;
