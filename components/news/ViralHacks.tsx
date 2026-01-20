import React, { useState, useEffect } from "react";
import { Zap, Play, Layers, Globe } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getGeneralTrends } from "../../services/newsService";

const ViralHacks: React.FC = () => {
  const [generalTrends, setGeneralTrends] = useState<string | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(true);

  useEffect(() => {
    const loadTrends = async () => {
      const result = await getGeneralTrends();
      setGeneralTrends(result);
      setLoadingTrends(false);
    };
    loadTrends();
  }, []);

  return (
    <section className="p-6 md:p-12 bg-black text-white">
      <div className="mb-12 flex justify-between items-end border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-1">Arsenal Viral</h2>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Dados em Tempo Real</p>
        </div>
        <Zap className="text-white" size={32} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-3 bg-gray-900 border border-purple-500/50 p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-purple-400 animate-pulse" size={20} />
            <h3 className="font-bold uppercase tracking-widest text-purple-400 text-xs">
              Radar de Tendencias (Hoje)
            </h3>
          </div>

          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-headings:uppercase prose-p:text-gray-300">
            {loadingTrends ? (
              <div className="animate-pulse flex flex-col gap-2">
                <div className="h-2 bg-gray-700 w-1/2 rounded"></div>
                <div className="h-2 bg-gray-700 w-full rounded"></div>
                <div className="h-2 bg-gray-700 w-3/4 rounded"></div>
              </div>
            ) : (
              <ReactMarkdown>{generalTrends || "Carregando tendencias..."}</ReactMarkdown>
            )}
          </div>
        </div>

        <div className="bg-white text-black p-6 border border-gray-800 hover:bg-gray-100 transition-colors">
          <div className="flex justify-between mb-4">
            <Play size={24} />
            <span className="text-[10px] font-black uppercase border border-black px-1">Retencao</span>
          </div>
          <h4 className="text-xl font-black uppercase mb-2">Loop Infinito</h4>
          <p className="text-sm text-gray-600">
            Conecte a ultima frase com a primeira. O cerebro nao percebe o fim.
          </p>
        </div>

        <div className="bg-white text-black p-6 border border-gray-800 hover:bg-gray-100 transition-colors">
          <div className="flex justify-between mb-4">
            <Layers size={24} />
            <span className="text-[10px] font-black uppercase border border-black px-1">Edicao</span>
          </div>
          <h4 className="text-xl font-black uppercase mb-2">Corte de Respiro</h4>
          <p className="text-sm text-gray-600">Remova silencios &gt;0.2s. Mantenha o ritmo visual frenetico.</p>
        </div>
      </div>
    </section>
  );
};

export default ViralHacks;
