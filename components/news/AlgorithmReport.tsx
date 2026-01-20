import React, { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, Search, Clock, Camera, Globe } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getLatestAlgorithmInsights } from "../../services/newsService";

const AlgorithmReport: React.FC = () => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    const result = await getLatestAlgorithmInsights();
    setAiAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <section className="p-6 md:p-8 bg-white">
      <div className="flex items-center gap-2 mb-6 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-xs font-black uppercase tracking-widest text-red-600">
            Ao Vivo: Mudancas de Algoritmo
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Globe size={12} />
          <span className="text-[10px] font-mono uppercase">Conectado a Rede Global</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-8 border border-black p-6 md:p-8 bg-gray-50">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">
              Manchetes do Dia
              <br />
              <span className="text-gray-500 text-lg">Atualizacao Automatica</span>
            </h2>
            <TrendingUp size={32} strokeWidth={1} />
          </div>
          <div className="h-[2px] bg-black w-24 mb-6"></div>

          <div className="prose prose-sm max-w-none text-gray-800 font-medium leading-relaxed prose-headings:font-black prose-headings:uppercase prose-p:mb-2 prose-strong:text-black prose-a:text-blue-600 prose-a:underline">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 w-full rounded"></div>
                <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
                <div className="h-4 bg-gray-200 w-full rounded"></div>
              </div>
            ) : (
              <ReactMarkdown>{aiAnalysis || "Buscando inteligencia de mercado..."}</ReactMarkdown>
            )}
          </div>

          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="mt-6 text-[10px] uppercase font-bold border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw size={12} /> Forcar Atualizacao
          </button>
        </div>

        <div className="col-span-1 md:col-span-4 space-y-6">
          <div className="bg-black text-white p-6 h-full flex flex-col justify-between">
            <div>
              <Search className="mb-4 text-white" size={32} strokeWidth={1} />
              <h3 className="text-xl font-bold uppercase mb-2">SEO (Busca)</h3>
              <p className="text-sm text-gray-300 leading-tight">
                A categorizacao por palavras-chave na legenda e na tela superou o impacto das hashtags em 40%.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-700">
              <span className="text-[10px] uppercase font-bold text-gray-500">Impacto</span>
              <div className="text-3xl font-black">CRITICO</div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 border border-gray-200 p-6 flex gap-4 items-start hover:border-black transition-colors">
          <Camera size={24} className="mt-1" />
          <div>
            <h4 className="font-black uppercase text-lg mb-1">Modo Foto (Carrossel)</h4>
            <p className="text-xs text-gray-600">
              Carrosseis estaticos estao recebendo 2.9x mais engajamento e salvamentos que videos curtos tradicionais.
            </p>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 border border-gray-200 p-6 flex gap-4 items-start hover:border-black transition-colors">
          <Clock size={24} className="mt-1" />
          <div>
            <h4 className="font-black uppercase text-lg mb-1">Videos Longos (1min+)</h4>
            <p className="text-xs text-gray-600">
              Conteudos acima de 1 minuto estao sendo priorizados para monetizacao e construcao de comunidade fiel.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlgorithmReport;
