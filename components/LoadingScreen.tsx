import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-black flex items-center justify-center">
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400">
        <div className="w-3 h-3 bg-black rounded-full animate-pulse"></div>
        Carregando
      </div>
    </div>
  );
};

export default LoadingScreen;
