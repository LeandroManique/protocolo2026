import React from "react";
import { ArrowDown, ArrowLeft } from "lucide-react";
import NewsHeader from "./news/NewsHeader";
import OfficialHeadline from "./news/OfficialHeadline";
import ReportGuidelines from "./news/ReportGuidelines";
import AlgorithmReport from "./news/AlgorithmReport";
import GrowthLadder from "./news/GrowthLadder";
import ViralHacks from "./news/ViralHacks";

interface NewsPageProps {
  onBack?: () => void;
}

const NewsPage: React.FC<NewsPageProps> = ({ onBack }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 selection:bg-black selection:text-white">
      {onBack && (
        <div className="bg-white border-b border-black">
          <div className="max-w-4xl mx-auto border-x border-gray-100 px-4 py-2">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Voltar
            </button>
          </div>
        </div>
      )}

      <NewsHeader />

      <main className="max-w-4xl mx-auto w-full bg-white border-x border-gray-100 min-h-screen shadow-2xl shadow-gray-100/50">
        <section className="p-8 border-b border-black">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
              INTELIGENCIA
              <br />
              ESTRATEGICA
            </h2>
            <ArrowDown className="animate-bounce" />
          </div>
          <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-600 max-w-2xl">
            Este relatorio condensa atualizacoes criticas do algoritmo, padroes de viralizacao
            observados e o mapa de crescimento para o ciclo {currentYear}/{currentYear + 1}.
          </p>
        </section>

        <OfficialHeadline />
        <ReportGuidelines />

        <div id="report">
          <AlgorithmReport />
        </div>

        <div id="growth" className="border-t border-black">
          <GrowthLadder />
        </div>

        <div id="hacks" className="border-t border-black">
          <ViralHacks />
        </div>

        <footer className="bg-black text-white p-12 text-center">
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">
            RELATORIO ARTHUALIZACOES
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            {currentYear} Divisao de Inteligencia TikTok. Atualizado diariamente.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default NewsPage;
