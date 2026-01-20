import React from 'react';
import { ViewState } from '../types';
import { Search, Zap, MessageCircle, TrendingUp, ChevronRight, LayoutTemplate, User } from 'lucide-react';

interface HomeProps {
  setViewState: (view: ViewState) => void;
  userEmail?: string;
  onSignOut?: () => void;
}

const Home: React.FC<HomeProps> = ({ setViewState, userEmail, onSignOut }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      
      {/* Header / Brand */}
      <div className="pt-20 pb-12 px-8 flex flex-col items-center justify-center animate-fade-in-up relative">
        <h1 className="text-[5rem] leading-[0.9] font-black tracking-tighter text-center mb-6">
          ARTHUR
        </h1>
        <div className="flex items-center gap-4">
             <div className="h-px w-8 bg-black"></div>
             <p className="text-[10px] font-bold tracking-[0.4em] uppercase">
                ESTRATEGISTA | TIKTOK
             </p>
             <div className="h-px w-8 bg-black"></div>
        </div>
      </div>

      {/* Main Action - The "Hero" Product */}
      <div className="flex-1 w-full max-w-md mx-auto px-6 flex flex-col gap-6 animate-fade-in-up delay-100 pb-12">
        
        {/* Utility Bar (Profile Access) */}
        <div className="flex justify-between items-end px-1">
            <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                    Menu Principal
                </span>
                {userEmail && (
                  <p className="text-[10px] text-gray-400 mt-1">{userEmail}</p>
                )}
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setViewState(ViewState.USER_PROFILE)}
                    className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase hover:bg-gray-100 px-3 py-1.5 rounded-full transition-all"
                >
                    <User className="w-3 h-3" />
                    Meu Perfil
                </button>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase hover:bg-gray-100 px-3 py-1.5 rounded-full transition-all"
                  >
                    Sair
                  </button>
                )}
            </div>
        </div>

        {/* Mentoria Button - The Centerpiece */}
        <button 
          onClick={() => setViewState(ViewState.CHAT)}
          className="group relative w-full bg-black text-white py-8 px-8 rounded-none transition-all duration-500 hover:scale-[1.01]"
        >
          <div className="flex justify-between items-start">
             <div>
                <span className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2 group-hover:text-white transition-colors">Toque para iniciar</span>
                <span className="text-3xl font-black uppercase tracking-tight flex items-center gap-2">
                   Iniciar Mentoria
                </span>
             </div>
             <MessageCircle className="w-8 h-8 stroke-1 group-hover:fill-white transition-all duration-500" />
          </div>
          <div className="mt-4 h-px w-full bg-gray-800 group-hover:bg-white transition-colors duration-500"></div>
          <p className="mt-4 text-xs font-medium text-gray-400 max-w-[80%] text-left group-hover:text-white transition-colors">
            Consultoria estratégica em tempo real baseada em dados atuais do algoritmo.
          </p>
        </button>

        {/* Secondary Actions - Clean Grid */}
        <div className="grid grid-cols-1 gap-px bg-gray-100 border border-gray-100">
            {/* Script Generator */}
            <button 
              onClick={() => setViewState(ViewState.SCRIPT_GENERATOR)}
              className="bg-white p-6 hover:bg-gray-50 transition-colors group text-left flex items-center justify-between"
            >
              <div>
                 <h3 className="font-bold text-lg uppercase tracking-tight mb-1">Gerador de Roteiro</h3>
                 <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Direção Técnica & Viral</p>
              </div>
              <LayoutTemplate className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
            </button>

            {/* Profile Audit */}
            <button 
              onClick={() => setViewState(ViewState.PROFILE_AUDITOR)}
              className="bg-white p-6 hover:bg-gray-50 transition-colors group text-left flex items-center justify-between"
            >
              <div>
                 <h3 className="font-bold text-lg uppercase tracking-tight mb-1">Raio-X de Perfil</h3>
                 <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Auditoria Visual</p>
              </div>
              <Search className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
            </button>

            {/* SEO */}
            <button 
              onClick={() => setViewState(ViewState.SEO_OPTIMIZER)}
              className="bg-white p-6 hover:bg-gray-50 transition-colors group text-left flex items-center justify-between"
            >
              <div>
                 <h3 className="font-bold text-lg uppercase tracking-tight mb-1">SEO & Metadados</h3>
                 <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Otimização de Busca</p>
              </div>
              <Zap className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
            </button>

             {/* Strategies */}
             <button 
              onClick={() => setViewState(ViewState.NEWS)}
              className="bg-white p-6 hover:bg-black hover:text-white transition-colors duration-500 group text-left flex items-center justify-between"
            >
              <div>
                 <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <h3 className="font-bold text-sm uppercase tracking-widest">Estratégias & Tendências</h3>
                 </div>
                 <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase pl-6 group-hover:text-gray-400">Últimas Atualizações</p>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
        </div>

      </div>

      {/* Footer Minimal */}
      <div className="py-8 text-center space-y-3">
        <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
           Protocolo 2026 // v2.6
        </p>
        <div className="flex justify-center gap-4 text-[9px] text-gray-300 font-medium tracking-wide">
             <button onClick={() => setViewState(ViewState.LEGAL_TERMS)} className="hover:text-black transition-colors uppercase">Termos de Uso</button>
             <span className="text-gray-200">|</span>
             <button onClick={() => setViewState(ViewState.LEGAL_PRIVACY)} className="hover:text-black transition-colors uppercase">Política de Privacidade</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
