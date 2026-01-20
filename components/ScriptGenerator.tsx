import React, { useState, useRef, useEffect } from 'react';
import { ViewState } from '../types';
import { generateViralScript, refineScript } from '../services/openaiService';
import { ArrowLeft, Check, ChevronRight, Copy, RefreshCw, MessageSquare, Edit2, PlayCircle, BarChart2, Lightbulb, X, Zap, Clock, Users } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ScriptGeneratorProps {
  setViewState: (view: ViewState) => void;
}

// Flow States
enum FlowStep {
  INTRO_INSIGHTS = 0,
  INSIGHTS_GUIDE = 1,
  INPUT_TOPIC = 2,
  INPUT_NICHE = 3,
  INPUT_AUDIENCE = 4,
  INPUT_FOLLOWERS = 5,
  INPUT_DURATION = 6,
  INPUT_FORMAT = 7,
  INPUT_IDEA = 8,
  GENERATING = 9,
  REVIEW_REFINE = 10
}

const FORMAT_INFO: Record<string, { desc: string; insight: string }> = {
  'Vlog / Lifestyle': {
    desc: "Mostre sua rotina ou bastidores sem filtros. Gera conexão imediata pois as pessoas sentem que fazem parte da sua vida.",
    insight: "Regra dos 3 segundos: mude o ângulo ou a cena a cada 3s. Ninguém quer ver a mesma imagem estática (ex: escovando dentes) por muito tempo. Cortou, mudou!"
  },
  'Talking Head (Falando pra câmera)': {
    desc: "O formato clássico de 'Cabeça Falante'. Você ensina, opina ou conta uma história olhando nos olhos da audiência. Constrói autoridade.",
    insight: "Olhe para a LENTE da câmera, não para você na tela. Isso cria contato visual real. E use as mãos! Mãos paradas deixam o vídeo robótico."
  },
  'Tutorial / Hands-on': {
    desc: "Focado em mostrar 'como fazer'. Geralmente filma-se as mãos, a tela ou o objeto. Ideal para demonstrar processos.",
    insight: "Comece pelo FINAL. Mostre o resultado pronto e incrível nos primeiros 2 segundos para gerar desejo, só depois ensine o passo a passo."
  },
  'POV / Atuação': {
    desc: "'Point of View' (Ponto de Vista). Você cria uma pequena cena ou esquete onde o espectador se sente dentro da situação.",
    insight: "O contexto é tudo. A legenda inicial deve explicar a piada instantaneamente (ex: 'POV: Você é o irmão caçula...'). Se tiver que explicar muito, não funciona."
  },
  'Apenas Voz (Voiceover)': {
    desc: "Você narra por cima de imagens, vídeos satisfatórios ou gravações do produto. Perfeito se você tem vergonha da câmera.",
    insight: "O áudio é 70% do vídeo. Grave embaixo de um cobertor grosso ou dentro do guarda-roupa para ter som de estúdio (sem eco/reverb)."
  }
};

const DURATION_INFO: Record<string, { title: string; pros: string; cons: string; strategy: string }> = {
    '15s - 30s (Curto)': {
        title: "Viralização Rápida",
        pros: "Altíssima taxa de conclusão (Watchtime). Mais fácil de viralizar para público frio.",
        cons: "Baixa profundidade. Difícil criar conexão forte ou vender produtos complexos.",
        strategy: "Use para Topo de Funil: atrair gente nova com dicas rápidas ou humor."
    },
    '30s - 60s (Médio)': {
        title: "Storytelling Padrão",
        pros: "Tempo ideal para contar uma história com início, meio e fim sem cansar.",
        cons: "Exige uma retenção constante. Se o meio for chato, a pessoa sai.",
        strategy: "Use para Tutoriais e Histórias. A cada 10s insira um novo elemento visual."
    },
    '> 1 Minuto (Longo)': {
        title: "Monetização & SEO",
        pros: "Habilita monetização (RPM). O TikTok está priorizando conteúdos profundos e de busca.",
        cons: "Difícil manter a atenção. Exige roteiro impecável.",
        strategy: "Use se você já tem >10k seguidores ou se o conteúdo é denso (ex: análise, aula)."
    }
};

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ setViewState }) => {
  const [step, setStep] = useState<FlowStep>(FlowStep.INTRO_INSIGHTS);
  const [answers, setAnswers] = useState<any>({});
  const [currentInput, setCurrentInput] = useState('');
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refinement State
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [infoModalFormat, setInfoModalFormat] = useState<string | null>(null);
  const [infoModalDuration, setInfoModalDuration] = useState<string | null>(null);

  const handleNext = async () => {
    // Validation for text inputs
    if (
      (step === FlowStep.INPUT_TOPIC || 
       step === FlowStep.INPUT_NICHE || 
       step === FlowStep.INPUT_AUDIENCE ||
       step === FlowStep.INPUT_FOLLOWERS) && 
      !currentInput.trim()
    ) return;

    // Save Answer
    const keyMap: Record<number, string> = {
      [FlowStep.INPUT_TOPIC]: 'searchTerm',
      [FlowStep.INPUT_NICHE]: 'niche',
      [FlowStep.INPUT_AUDIENCE]: 'audience',
      [FlowStep.INPUT_FOLLOWERS]: 'followers',
      [FlowStep.INPUT_IDEA]: 'initialIdea'
    };

    if (keyMap[step]) {
      setAnswers({ ...answers, [keyMap[step]]: currentInput });
    }

    // Transition Logic
    if (step === FlowStep.INPUT_IDEA) {
        // Start Generation
        setStep(FlowStep.GENERATING);
        setIsProcessing(true);
        const script = await generateViralScript({ ...answers, initialIdea: currentInput });
        setGeneratedScript(script);
        setIsProcessing(false);
        setStep(FlowStep.REVIEW_REFINE);
        setCurrentInput('');
    } else {
        setStep(step + 1);
        setCurrentInput('');
    }
  };

  const handleSelectFormat = (format: string) => {
    setAnswers({ ...answers, format });
    setStep(FlowStep.INPUT_IDEA);
  };

  const handleSelectDuration = (duration: string) => {
    setAnswers({ ...answers, duration });
    setStep(FlowStep.INPUT_FORMAT);
  };

  const handleInsightsResponse = (hasChecked: boolean) => {
    if (hasChecked) {
      setStep(FlowStep.INPUT_TOPIC);
    } else {
      setStep(FlowStep.INSIGHTS_GUIDE);
    }
  };

  const handleRefine = async () => {
    if (!refinementInput.trim() || isRefining) return;
    
    setIsRefining(true);
    const newScript = await refineScript(generatedScript, refinementInput);
    setGeneratedScript(newScript);
    setRefinementInput('');
    setIsRefining(false);
    
    // Scroll top of script to show changes
    if (scriptContainerRef.current) {
        scriptContainerRef.current.scrollTop = 0;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
    alert("Roteiro copiado!");
  };

  // --- RENDER STEPS ---

  // 1. Intro Check
  if (step === FlowStep.INTRO_INSIGHTS) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
         <button onClick={() => setViewState(ViewState.HOME)} className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full"><ArrowLeft /></button>
         
         <div className="bg-blue-50 p-4 rounded-full mb-6">
            <BarChart2 className="w-8 h-8 text-blue-600" />
         </div>
         <h2 className="text-3xl font-black mb-4">Primeira coisa.</h2>
         <p className="text-lg text-gray-600 max-w-md mb-8">
           Você já consultou o <strong>Creator Search Insights</strong> hoje para validar se o seu tema tem demanda real (+800%)?
         </p>
         
         <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={() => handleInsightsResponse(true)} className="bg-black text-white py-4 rounded-xl font-bold hover:scale-105 transition-transform">
                Sim, já tenho o tema
            </button>
            <button onClick={() => handleInsightsResponse(false)} className="bg-gray-100 text-gray-800 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Não / O que é isso?
            </button>
         </div>
      </div>
    );
  }

  // 2. Guide (Modal-like)
  if (step === FlowStep.INSIGHTS_GUIDE) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white animate-fade-in-up">
         <div className="max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Estratégia de Ouro 🏆</h2>
            <p className="mb-6 text-gray-300 leading-relaxed">
                Não adianta ser criativo se ninguém está procurando pelo assunto. O segredo do viral é a <strong>DEMANDA</strong>.
            </p>
            
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-4 mb-8">
                <div className="flex items-center gap-4">
                    <span className="bg-gray-700 w-8 h-8 flex items-center justify-center rounded-full font-bold">1</span>
                    <p>Abra o app do TikTok e digite <strong>"Creator Search Insights"</strong> na busca.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-gray-700 w-8 h-8 flex items-center justify-center rounded-full font-bold">2</span>
                    <p>Clique no banner "Creator Search Insights".</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-gray-700 w-8 h-8 flex items-center justify-center rounded-full font-bold">3</span>
                    <p>Filtre por "Content Gap" (Lacuna de Conteúdo). Procure termos com relevância alta.</p>
                </div>
            </div>

            <button onClick={() => setStep(FlowStep.INPUT_TOPIC)} className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                Pronto, já escolhi o termo <ChevronRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    );
  }

  // 3. Text Inputs
  if ([FlowStep.INPUT_TOPIC, FlowStep.INPUT_NICHE, FlowStep.INPUT_AUDIENCE, FlowStep.INPUT_FOLLOWERS, FlowStep.INPUT_IDEA].includes(step)) {
    
    let title = "";
    let placeholder = "";
    let desc = "";
    let inputType = "text";

    switch(step) {
        case FlowStep.INPUT_TOPIC:
            title = "Qual o termo exato com 'Content Gap' alto?";
            placeholder = "Ex: Organizador de cabos, Como estudar melhor...";
            desc = "Esse será o coração do seu SEO.";
            break;
        case FlowStep.INPUT_NICHE:
            title = "Qual é o seu Nicho?";
            placeholder = "Ex: Tecnologia, Produtividade, Humor...";
            break;
        case FlowStep.INPUT_AUDIENCE:
            title = "Quem é o público alvo?";
            placeholder = "Ex: Estudantes universitários sem tempo.";
            break;
        case FlowStep.INPUT_FOLLOWERS:
            title = "Quantos seguidores você tem?";
            placeholder = "Ex: 500, 10k, 1M...";
            desc = "Isso muda a estratégia (Alcance vs. Monetização).";
            inputType = "text";
            break;
        case FlowStep.INPUT_IDEA:
            title = "Tem alguma ideia base ou crio do zero?";
            placeholder = "Ex: Quero mostrar minha mesa bagunçada antes...";
            desc = "Deixe em branco se quiser que eu crie tudo.";
            break;
    }

    return (
        <div className="min-h-screen bg-white flex flex-col p-6">
            <button onClick={() => setViewState(ViewState.HOME)} className="self-start mb-12"><ArrowLeft /></button>
            <div className="flex-1 max-w-xl mx-auto w-full flex flex-col justify-center animate-fade-in-up">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Passo {step - 1} de 7</span>
                <h2 className="text-4xl font-black mb-4 leading-tight">{title}</h2>
                {desc && <p className="text-gray-500 mb-8">{desc}</p>}
                
                <input 
                    autoFocus
                    type={inputType}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    placeholder={placeholder}
                    className="w-full text-2xl border-b-2 border-gray-200 py-4 focus:outline-none focus:border-black bg-transparent placeholder-gray-300"
                />

                <div className="flex justify-end mt-12">
                     <button 
                        onClick={handleNext}
                        className="bg-black text-white p-4 rounded-full hover:scale-110 transition-transform"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // 4. Duration Selection
  if (step === FlowStep.INPUT_DURATION) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6 relative">
          <button onClick={() => setViewState(ViewState.HOME)} className="self-start mb-12"><ArrowLeft /></button>
          <div className="flex-1 max-w-xl mx-auto w-full flex flex-col justify-center animate-fade-in-up">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Passo 5 de 7</span>
              <h2 className="text-4xl font-black mb-8 leading-tight">Qual o tempo de vídeo?</h2>
              
              <div className="space-y-3">
                  {Object.keys(DURATION_INFO).map((dur) => (
                      <div key={dur} className="flex gap-2">
                           <button 
                              onClick={() => handleSelectDuration(dur)}
                              className="flex-1 text-left p-5 border-2 border-gray-100 rounded-xl font-bold text-lg hover:border-black hover:bg-gray-50 transition-all flex justify-between group items-center"
                          >
                              {dur}
                              <Clock className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                          </button>
                          <button
                              onClick={() => setInfoModalDuration(dur)}
                              className="w-16 flex items-center justify-center border-2 border-yellow-100 bg-yellow-50 text-yellow-500 rounded-xl hover:bg-yellow-100 hover:border-yellow-300 transition-colors"
                          >
                              <Lightbulb className="w-6 h-6" />
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          {/* Duration Modal */}
          {infoModalDuration && (
              <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInfoModalDuration(null)}></div>
                  <div className="bg-white w-full max-w-md rounded-2xl p-6 relative animate-fade-in-up z-10 shadow-2xl">
                      <button 
                          onClick={() => setInfoModalDuration(null)}
                          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                          <X className="w-4 h-4" />
                      </button>
                      
                      <div className="mb-6">
                           <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-4">
                              <Clock className="w-6 h-6" />
                           </div>
                           <h3 className="text-xl font-bold mb-2">{DURATION_INFO[infoModalDuration].title}</h3>
                           <p className="text-sm text-gray-500 font-mono mb-4">{infoModalDuration}</p>
                           
                           <div className="space-y-4">
                               <div className="flex gap-3">
                                   <div className="w-1 bg-green-500 rounded-full"></div>
                                   <div>
                                       <h4 className="font-bold text-green-700 text-sm">Prós</h4>
                                       <p className="text-gray-600 text-sm">{DURATION_INFO[infoModalDuration].pros}</p>
                                   </div>
                               </div>
                               <div className="flex gap-3">
                                   <div className="w-1 bg-red-500 rounded-full"></div>
                                   <div>
                                       <h4 className="font-bold text-red-700 text-sm">Contras</h4>
                                       <p className="text-gray-600 text-sm">{DURATION_INFO[infoModalDuration].cons}</p>
                                   </div>
                               </div>
                           </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl">
                          <h4 className="flex items-center gap-2 font-bold text-yellow-700 text-sm mb-2 uppercase tracking-wide">
                              <Zap className="w-4 h-4" /> Estratégia
                          </h4>
                          <p className="text-yellow-800 text-sm font-medium">
                              "{DURATION_INFO[infoModalDuration].strategy}"
                          </p>
                      </div>

                      <button 
                          onClick={() => {
                              handleSelectDuration(infoModalDuration);
                              setInfoModalDuration(null);
                          }}
                          className="w-full mt-6 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition"
                      >
                          Escolher este tempo
                      </button>
                  </div>
              </div>
          )}
      </div>
    );
  }

  // 5. Format Selection
  if (step === FlowStep.INPUT_FORMAT) {
      return (
        <div className="min-h-screen bg-white flex flex-col p-6 relative">
            <button onClick={() => setViewState(ViewState.HOME)} className="self-start mb-12"><ArrowLeft /></button>
            <div className="flex-1 max-w-xl mx-auto w-full flex flex-col justify-center animate-fade-in-up">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Passo 6 de 7</span>
                <h2 className="text-4xl font-black mb-8 leading-tight">Qual será o formato?</h2>
                
                <div className="space-y-3">
                    {Object.keys(FORMAT_INFO).map((fmt) => (
                        <div key={fmt} className="flex gap-2">
                             <button 
                                onClick={() => handleSelectFormat(fmt)}
                                className="flex-1 text-left p-5 border-2 border-gray-100 rounded-xl font-bold text-lg hover:border-black hover:bg-gray-50 transition-all flex justify-between group items-center"
                            >
                                {fmt}
                                <ArrowRightIcon className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button
                                onClick={() => setInfoModalFormat(fmt)}
                                className="w-16 flex items-center justify-center border-2 border-yellow-100 bg-yellow-50 text-yellow-500 rounded-xl hover:bg-yellow-100 hover:border-yellow-300 transition-colors"
                            >
                                <Lightbulb className="w-6 h-6" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Modal */}
            {infoModalFormat && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInfoModalFormat(null)}></div>
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 relative animate-fade-in-up z-10 shadow-2xl">
                        <button 
                            onClick={() => setInfoModalFormat(null)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        <div className="mb-6">
                             <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-4">
                                <Lightbulb className="w-6 h-6" />
                             </div>
                             <h3 className="text-xl font-bold mb-2">{infoModalFormat}</h3>
                             <p className="text-gray-600 leading-relaxed">
                                {FORMAT_INFO[infoModalFormat].desc}
                             </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl">
                            <h4 className="flex items-center gap-2 font-bold text-yellow-700 text-sm mb-2 uppercase tracking-wide">
                                <Zap className="w-4 h-4" /> Insight de Ouro
                            </h4>
                            <p className="text-yellow-800 text-sm font-medium">
                                "{FORMAT_INFO[infoModalFormat].insight}"
                            </p>
                        </div>

                        <button 
                            onClick={() => {
                                handleSelectFormat(infoModalFormat);
                                setInfoModalFormat(null);
                            }}
                            className="w-full mt-6 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition"
                        >
                            Escolher este formato
                        </button>
                    </div>
                </div>
            )}
        </div>
      );
  }

  // 6. Generating Loader
  if (step === FlowStep.GENERATING) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
            <div className="loader border-t-black mb-6 w-16 h-16 border-4"></div>
            <h2 className="text-2xl font-black mb-2">Arthur está dirigindo...</h2>
            <p className="text-gray-500">Definindo ângulos, luz e texto para "{answers.searchTerm}".</p>
        </div>
      );
  }

  // 7. Review & Refine (The Editor)
  if (step === FlowStep.REVIEW_REFINE) {
      return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => setViewState(ViewState.HOME)} className="hover:bg-gray-100 p-2 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
                    <div>
                        <h2 className="font-bold text-sm">Roteiro Técnico</h2>
                        <p className="text-xs text-gray-500">Direção para: {answers.followers} seguidores</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={copyToClipboard} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition">
                        <Copy className="w-3 h-3" /> COPIAR
                    </button>
                    <button onClick={() => alert("Roteiro aceito! Pode gravar.")} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-600 transition">
                        <Check className="w-3 h-3" /> APROVAR
                    </button>
                </div>
            </div>

            {/* Split Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Script Display */}
                <div ref={scriptContainerRef} className="flex-1 overflow-y-auto p-6 md:p-12 bg-white">
                    <div className="max-w-3xl mx-auto prose prose-lg prose-headings:font-black prose-a:text-blue-600 text-gray-800">
                        {isRefining ? (
                             <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-32 bg-gray-100 rounded-xl w-full"></div>
                             </div>
                        ) : (
                            <ReactMarkdown>{generatedScript}</ReactMarkdown>
                        )}
                    </div>
                    {/* Bottom padding for mobile input visibility */}
                    <div className="h-32 md:hidden"></div> 
                </div>

                {/* Refinement Panel */}
                <div className="w-full md:w-96 bg-gray-100 border-l border-gray-200 flex flex-col">
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                                <PlayCircle className="w-4 h-4 text-blue-500"/> Nota do Diretor:
                            </h3>
                            <p className="text-sm text-gray-600">
                                Estruturei o roteiro em ATOS para facilitar sua gravação. Se precisar mudar uma cena ou simplificar a fala, me avise abaixo.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="relative">
                            <textarea
                                value={refinementInput}
                                onChange={(e) => setRefinementInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleRefine();
                                    }
                                }}
                                placeholder="Ex: 'Mude a cena 2 para algo mais simples' ou 'Deixe o gancho mais polêmico'..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pr-10 text-sm focus:ring-2 focus:ring-black focus:outline-none resize-none h-24"
                            />
                            <button 
                                onClick={handleRefine}
                                disabled={isRefining || !refinementInput.trim()}
                                className="absolute bottom-3 right-3 p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                            >
                                {isRefining ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Edit2 className="w-4 h-4"/>}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-2">
                            Refinando com Inteligência Artificial
                        </p>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  return null;
};

// Simple icon helper
const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export default ScriptGenerator;
