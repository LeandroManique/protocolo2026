import React, { useEffect, useState } from 'react';
import { ViewState } from '../types';
import { fetchWeeklyStrategyUpdate } from '../services/geminiService';
import { ArrowLeft, FileText, Lock, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface StrategiesFeedProps {
  setViewState: (view: ViewState) => void;
}

const StrategiesFeed: React.FC<StrategiesFeedProps> = ({ setViewState }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching from the "Google Doc" (actually fetching live data via Gemini)
    const loadData = async () => {
        const update = await fetchWeeklyStrategyUpdate();
        setContent(update);
        setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9FB] flex flex-col font-sans">
      <div className="bg-white px-6 py-4 flex items-center border-b border-gray-200 sticky top-0 z-10">
        <button onClick={() => setViewState(ViewState.HOME)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <div className="ml-4 flex-1">
            <h2 className="font-bold text-lg text-black flex items-center gap-2">
               Estratégias e Tendências
            </h2>
            <p className="text-xs text-gray-500">Conectado: "Arthur_Docs_Oficial.docx"</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Globe className="w-3 h-3" />
            ONLINE
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        {loading ? (
           <div className="space-y-6 animate-pulse">
             <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
             <div className="space-y-3">
               <div className="h-4 bg-gray-200 rounded w-3/4"></div>
               <div className="h-4 bg-gray-200 rounded w-full"></div>
               <div className="h-4 bg-gray-200 rounded w-5/6"></div>
             </div>
           </div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs font-mono uppercase">Ultima_Atualizacao.md</span>
                    </div>
                    <span className="text-xs text-gray-400">Editado recentemente</span>
                </div>
                <div className="p-8 prose prose-black max-w-none prose-headings:font-black prose-a:text-blue-600">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        )}
      </div>
      
      <div className="p-6 text-center">
        <p className="text-gray-400 text-xs">
            Este documento é gerado dinamicamente com base nas últimas 168 horas do algoritmo.
        </p>
      </div>
    </div>
  );
};

export default StrategiesFeed;