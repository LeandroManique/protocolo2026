import React, { useState } from 'react';
import { ViewState, SEOResult } from '../types';
import { generateVideoMetadata } from '../services/geminiService';
import { ArrowLeft, Hash, Type, Copy, Search, Tag, Check, Zap } from 'lucide-react';

interface SEOOptimizerProps {
  setViewState: (view: ViewState) => void;
}

const SEOOptimizer: React.FC<SEOOptimizerProps> = ({ setViewState }) => {
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOResult | null>(null);

  const handleGenerate = async () => {
    if (!topic || !niche) return;
    setLoading(true);
    const data = await generateVideoMetadata(topic, niche);
    setResult(data);
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="bg-white border-b border-gray-100 p-4 flex items-center shadow-sm">
        <button onClick={() => setViewState(ViewState.HOME)} className="p-2 hover:bg-gray-100 rounded-full">
           <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-4 font-black text-xl flex items-center gap-2">
            SEO & Viralização <Zap className="w-5 h-5 text-yellow-500 fill-current" />
        </h2>
      </div>

      {!result ? (
        <div className="flex-1 max-w-lg mx-auto w-full p-6 flex flex-col justify-center animate-fade-in-up">
           <div className="text-center mb-8">
              <h1 className="text-3xl font-black mb-2 text-gray-900">Publique para ser achado.</h1>
              <p className="text-gray-500">
                Otimize seu vídeo para a Barra de Pesquisa e atinja públicos novos (Cold Reach).
              </p>
           </div>

           <div className="space-y-6 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              <div>
                <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Sobre o que é o vídeo?</label>
                <textarea 
                    value={topic} 
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Ex: Como fazer bolo de cenoura fit..." 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-black transition h-32 resize-none font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Seu Nicho</label>
                <input 
                    value={niche} 
                    onChange={e => setNiche(e.target.value)}
                    placeholder="Ex: Culinária Saudável" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-black transition font-bold"
                />
              </div>

              <button 
                  onClick={handleGenerate}
                  disabled={loading || !topic || !niche}
                  className="w-full bg-black text-white font-black py-4 rounded-xl shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : "GERAR METADADOS MÁGICOS"}
              </button>
           </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full">
            
            <div className="grid md:grid-cols-2 gap-6">
                
                {/* Visual Hook (Thumbnail Text) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-red-500 font-black uppercase text-sm">
                            <Type className="w-4 h-4" /> Título na Capa (Visual Hook)
                        </div>
                        <CopyBtn text={result.thumbnailText} />
                    </div>
                    <div className="bg-gray-900 text-white p-8 rounded-xl text-center flex items-center justify-center min-h-[120px]">
                        <h2 className="text-2xl font-black uppercase leading-tight tracking-tight">
                            {result.thumbnailText}
                        </h2>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">Use fonte Sans-Serif Bold com fundo contrastante.</p>
                </div>

                {/* Search Terms */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-sm">
                            <Search className="w-4 h-4" /> Termos de Busca (SEO)
                        </div>
                    </div>
                    <div className="space-y-2">
                        {result.searchTerms.map((term, i) => (
                            <div key={i} className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg font-bold text-sm flex justify-between items-center">
                                {term}
                                <CopyBtn text={term} size="sm" />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Dica: Fale esses termos em voz alta durante o vídeo.</p>
                </div>

                {/* Caption */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-800 font-black uppercase text-sm">
                            <Type className="w-4 h-4" /> Legenda Otimizada
                        </div>
                        <CopyBtn text={result.caption} />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-sm whitespace-pre-line text-gray-700 font-medium leading-relaxed border border-gray-100">
                        {result.caption}
                    </div>
                </div>

                {/* Hashtags Strategy */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-gray-800 font-black uppercase text-sm">
                            <Hash className="w-4 h-4" /> Estratégia de Hashtags (Laddering)
                        </div>
                        <button 
                            onClick={() => copyToClipboard([...result.hashtags.broad, ...result.hashtags.niche, ...result.hashtags.specific].join(' '))}
                            className="text-xs font-bold bg-black text-white px-3 py-1 rounded hover:opacity-80 transition"
                        >
                            COPIAR TODAS
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Broad */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Amplas (+10M)</p>
                            <div className="flex flex-wrap gap-2">
                                {result.hashtags.broad.map(t => <TagChip key={t} text={t} />)}
                            </div>
                        </div>
                        {/* Niche */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Nicho (+1M)</p>
                            <div className="flex flex-wrap gap-2">
                                {result.hashtags.niche.map(t => <TagChip key={t} text={t} color="blue" />)}
                            </div>
                        </div>
                        {/* Specific */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Específicas</p>
                            <div className="flex flex-wrap gap-2">
                                {result.hashtags.specific.map(t => <TagChip key={t} text={t} color="green" />)}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <button 
                onClick={() => setResult(null)}
                className="w-full mt-8 bg-gray-200 text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-300 transition"
            >
                Criar para outro vídeo
            </button>
        </div>
      )}
    </div>
  );
};

interface CopyBtnProps {
    text: string;
    size?: 'sm' | 'md';
}

const CopyBtn: React.FC<CopyBtnProps> = ({ text, size = 'md' }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (size === 'sm') {
        return (
            <button onClick={handleCopy} className="text-gray-400 hover:text-black transition">
                {copied ? <Check className="w-3 h-3 text-green-500"/> : <Copy className="w-3 h-3"/>}
            </button>
        );
    }

    return (
        <button onClick={handleCopy} className="text-xs font-bold flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition text-gray-600">
            {copied ? <Check className="w-3 h-3 text-green-500"/> : <Copy className="w-3 h-3"/>}
            {copied ? "COPIADO" : "COPIAR"}
        </button>
    );
}

interface TagChipProps {
    text: string;
    color?: 'gray' | 'blue' | 'green';
}

const TagChip: React.FC<TagChipProps> = ({ text, color = 'gray' }) => {
    const colors = {
        gray: 'bg-gray-100 text-gray-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600'
    };
    return (
        <span className={`${colors[color]} px-2 py-1 rounded text-xs font-bold`}>
            {text}
        </span>
    );
}

export default SEOOptimizer;