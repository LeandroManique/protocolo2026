import React from "react";
import { Check, Target } from "lucide-react";

type GrowthStage = {
  range: string;
  title: string;
  focus: string;
  strategies: string[];
};

const stages: GrowthStage[] = [
  {
    range: "0 - 1k",
    title: "A Base",
    focus: "Experimentacao & Quantidade",
    strategies: ["3 videos/dia (Manha, Tarde, Noite)", "Foco extremo em UM sub-nicho", "Use audios virais (volume 1%)"],
  },
  {
    range: "1k - 10k",
    title: "Construcao",
    focus: "Identidade & Comunidade",
    strategies: ["Inicie Lives semanais", "Crie series (Episodio 1, 2...)", "Analise retencao quadro-a-quadro"],
  },
  {
    range: "10k - 100k",
    title: "Autoridade",
    focus: "Monetizacao & Diversificacao",
    strategies: ["Videos longos (>1min) para RPM", "Venda de infoprodutos/afiliados", "SEO (Otimizacao de Busca)"],
  },
  {
    range: "100k+",
    title: "O Icone",
    focus: "Marca & Escala",
    strategies: ["Multi-plataforma (Youtube/IG)", "Produtos fisicos ou Marca Propria", "Anuncios Pagos (Spark Ads)"],
  },
];

const GrowthLadder: React.FC = () => {
  return (
    <section className="p-6 md:p-12 bg-white">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Mapa de Crescimento</h2>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Estrategia Sequencial</p>
      </div>

      <div className="relative border-l border-black ml-4 md:ml-1/2 space-y-12 pb-12">
        {stages.map((stage, idx) => (
          <div key={idx} className="relative pl-8 md:pl-12">
            <div className="absolute -left-[5px] top-0 w-[10px] h-[10px] bg-black rounded-full outline outline-4 outline-white"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
              <div>
                <span className="inline-block bg-black text-white text-[10px] font-bold px-2 py-1 mb-2 uppercase tracking-widest">
                  Fase {idx + 1}
                </span>
                <h3 className="text-5xl font-black uppercase text-gray-200 leading-none mb-2">{stage.range}</h3>
                <h4 className="text-xl font-bold uppercase">{stage.title}</h4>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <Target size={16} />
                  <p className="text-xs font-bold uppercase">{stage.focus}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 border border-gray-100 rounded-sm">
                <ul className="space-y-4">
                  {stage.strategies.map((str, sIdx) => (
                    <li key={sIdx} className="flex gap-3 text-sm font-medium items-start">
                      <Check size={16} className="mt-1 flex-shrink-0" />
                      <span className="leading-relaxed">{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GrowthLadder;
