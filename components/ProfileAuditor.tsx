import React, { useState, useRef } from 'react';
import { ViewState, ProfileAuditResult } from '../types';
import { auditProfile } from '../services/geminiService';
import { ArrowLeft, Search, CheckCircle, Sparkles, Fingerprint, Upload, Image as ImageIcon, X } from 'lucide-react';

interface ProfileAuditorProps {
  setViewState: (view: ViewState) => void;
}

const ProfileAuditor: React.FC<ProfileAuditorProps> = ({ setViewState }) => {
  const [handle, setHandle] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [niche, setNiche] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProfileAuditResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAudit = async () => {
    // Validation: Require image OR (Handle + Bio)
    if (!selectedImage && (!handle || !bio)) return;
    
    setLoading(true);
    // Pass image if it exists, otherwise pass text fields
    const data = await auditProfile({ 
        handle, 
        name, 
        bio, 
        niche, 
        image: selectedImage || undefined 
    });
    setResult(data);
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 border-green-500';
    if (score >= 50) return 'text-yellow-500 border-yellow-500';
    return 'text-red-500 border-red-500';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <div className="p-4 border-b border-gray-100 flex items-center">
        <button onClick={() => setViewState(ViewState.HOME)} className="p-2 hover:bg-gray-100 rounded-full">
           <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-4 font-black text-xl">Raio-X de Perfil</h2>
      </div>

      {!result ? (
        <div className="flex-1 max-w-lg mx-auto w-full p-6 flex flex-col justify-center animate-fade-in-up">
           <div className="text-center mb-8">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-3xl font-black mb-2">Por que você não cresce?</h1>
              <p className="text-gray-500">
                A maioria perde seguidores em 3 segundos. Mande o print ou escreva sua bio.
              </p>
           </div>

           <div className="space-y-6">
              
              {/* Image Upload Area */}
              <div className="relative group">
                {!selectedImage ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 hover:border-black bg-gray-50 hover:bg-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
                    >
                        <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                             <Upload className="w-6 h-6 text-black" />
                        </div>
                        <p className="font-bold text-sm">Toque para enviar Print</p>
                        <p className="text-xs text-gray-400 mt-1">Nós lemos a imagem para você</p>
                    </div>
                ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-green-500 bg-black aspect-video flex items-center justify-center group">
                        <img src={selectedImage} alt="Print Preview" className="h-full w-full object-contain opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md">
                                <CheckCircle className="w-3 h-3 text-green-400" /> Print Carregado
                            </p>
                        </div>
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-2 right-2 bg-white text-black p-1 rounded-full hover:bg-red-100 hover:text-red-500 transition shadow-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
              </div>

              <div className="flex items-center gap-4">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Ou preencha</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Manual Inputs - Disabled if image selected */}
              <div className={`space-y-4 transition-opacity ${selectedImage ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Seu @ (Handle)</label>
                    <div className="flex items-center bg-gray-900 rounded-xl px-4 py-3 border border-gray-800">
                        <span className="text-gray-400 mr-1 font-bold">@</span>
                        <input 
                            value={handle} 
                            onChange={e => setHandle(e.target.value)}
                            placeholder="usuario" 
                            className="flex-1 bg-transparent text-white outline-none font-bold placeholder-gray-600"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Nome de Exibição</label>
                    <div className="flex items-center bg-gray-900 rounded-xl px-4 py-3 border border-gray-800">
                        <input 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: Ana | Marketing Digital" 
                            className="w-full bg-transparent text-white outline-none font-bold placeholder-gray-600"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Bio Atual</label>
                    <textarea 
                        value={bio} 
                        onChange={e => setBio(e.target.value)}
                        placeholder="Cole sua bio atual aqui..." 
                        className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl p-4 mt-1 h-28 outline-none focus:border-gray-600 transition-colors resize-none placeholder-gray-600 font-medium"
                    />
                </div>
              </div>
              
              {/* Niche is always useful even with image, but we can make it optional if image present */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Seu Nicho {selectedImage && <span className="text-gray-400 font-normal normal-case">(Opcional, tentaremos adivinhar)</span>}</label>
                <div className="flex items-center bg-gray-900 rounded-xl px-4 py-3 border border-gray-800">
                    <input 
                        value={niche} 
                        onChange={e => setNiche(e.target.value)}
                        placeholder="Ex: Fitness, Humor, Vendas..." 
                        className="w-full bg-transparent text-white outline-none font-bold placeholder-gray-600"
                    />
                </div>
              </div>
           </div>

           <button 
              onClick={handleAudit}
              disabled={loading || (!selectedImage && (!handle || !bio))}
              className="mt-8 w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
           >
              {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {selectedImage ? "LENDO IMAGEM..." : "ESCANEEANDO..."}
                </>
              ) : "ANALISAR MEU PERFIL AGORA"}
           </button>
        </div>
      ) : (
        <div className="flex-1 bg-gray-50 overflow-y-auto">
            {/* Score Section */}
            <div className="bg-white p-8 text-center rounded-b-3xl shadow-sm mb-6 animate-fade-in-up">
                <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center mx-auto mb-4 ${getScoreColor(result.score)}`}>
                    <span className={`text-5xl font-black ${getScoreColor(result.score).replace('border', 'text')}`}>
                        {result.score}
                    </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{result.summary}</h3>
                <p className="text-red-600 bg-red-50 p-3 rounded-lg inline-block text-sm font-medium">
                   "{result.roast}"
                </p>
                
                <div className="flex justify-center gap-4 mt-6">
                    <div className={`flex items-center gap-1 text-sm font-bold ${result.checklist.seo ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="w-4 h-4" /> SEO
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold ${result.checklist.clarity ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="w-4 h-4" /> CLAREZA
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold ${result.checklist.cta ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="w-4 h-4" /> CTA
                    </div>
                </div>
            </div>

            {/* Comparison */}
            <div className="max-w-4xl mx-auto px-6 pb-12 grid md:grid-cols-2 gap-8">
                
                {/* OLD */}
                <div className="opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <h4 className="text-center font-bold text-gray-500 mb-4 uppercase tracking-widest text-xs">Versão Atual</h4>
                    <div className="bg-white rounded-[2rem] border-4 border-gray-200 p-6 max-w-xs mx-auto aspect-[9/16] h-auto shadow-sm pointer-events-none select-none relative overflow-hidden">
                        
                        {/* If we have an uploaded image, show it here blurred/filtered maybe? Or just keep the mockup structure */}
                        {selectedImage ? (
                            <div className="absolute inset-0">
                                <img src={selectedImage} className="w-full h-full object-cover" alt="Original" />
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]"></div>
                            </div>
                        ) : null}

                        <div className="relative z-10">
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                     {selectedImage ? <ImageIcon className="w-8 h-8 text-gray-400"/> : null}
                                </div>
                            </div>
                            <div className="text-center mb-4">
                                <p className="font-bold text-lg">@{handle || 'seu.usuario'}</p>
                                <p className="font-semibold text-sm">{name || 'Seu Nome'}</p>
                            </div>
                            <div className="text-center text-sm space-y-1 mb-6">
                                {(bio || 'Sua bio original apareceria aqui...').split('\n').map((line, i) => <p key={i}>{line}</p>)}
                            </div>
                            <div className="flex justify-center gap-2">
                                <div className="bg-red-500 text-white px-8 py-3 rounded-md font-bold text-sm w-full text-center">Seguir</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* NEW */}
                <div>
                    <h4 className="text-center font-bold text-green-600 mb-4 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Versão Otimizada
                    </h4>
                    <div className="bg-white rounded-[2rem] border-4 border-black p-6 max-w-xs mx-auto shadow-2xl relative overflow-hidden ring-4 ring-green-100">
                         {/* Phone Notch Mockup */}
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl"></div>

                        <div className="flex justify-center mb-4 mt-4">
                            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-red-600 rounded-full p-1">
                                <div className="w-full h-full bg-gray-100 rounded-full border-2 border-white"></div>
                            </div>
                        </div>
                        <div className="text-center mb-4">
                            <p className="font-bold text-lg">@{handle || 'seu.usuario'}</p>
                            <p className="font-bold text-sm bg-yellow-100 inline-block px-1 rounded text-black animate-pulse">
                                {result.fixes.name}
                            </p>
                        </div>
                        <div className="text-center text-sm space-y-1 mb-6 font-medium">
                            {result.fixes.bio.split('\n').map((line: string, i: number) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                        <div className="flex justify-center gap-2">
                             <div className="bg-red-500 text-white px-8 py-3 rounded-md font-bold text-sm w-full text-center shadow-md">Seguir</div>
                             <div className="bg-gray-100 p-3 rounded-md"><Fingerprint className="w-5 h-5"/></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm mt-6 border-l-4 border-green-500">
                        <h5 className="font-bold mb-2 text-sm">Por que mudamos isso?</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {result.fixes.explanation}
                        </p>
                    </div>

                    <button 
                        onClick={() => {
                            setResult(null);
                            setSelectedImage(null);
                        }} 
                        className="w-full mt-6 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition"
                    >
                        Analisar outro perfil
                    </button>
                </div>

            </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAuditor;