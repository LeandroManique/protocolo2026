import React from "react";

const NewsHeader: React.FC = () => {
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="bg-white border-b border-black sticky top-0 z-40">
      <div className="max-w-4xl mx-auto border-x border-gray-100 bg-white">
        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <span>Edicao 24.3</span>
          <span>{today}</span>
          <span>Brasil</span>
        </div>

        <div className="py-8 px-6 text-center">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase text-black leading-none break-words">
            ARTHUALIZACOES
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="h-[2px] bg-black w-full max-w-[60px] md:max-w-[100px]"></div>
            <span className="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase whitespace-nowrap">
              Relatorio Oficial
            </span>
            <div className="h-[2px] bg-black w-full max-w-[60px] md:max-w-[100px]"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NewsHeader;
