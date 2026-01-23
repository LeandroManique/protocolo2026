import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ViewState, UserProfile } from '../types';
import { sendChatMessage } from '../services/openaiService';
import { ArrowLeft, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  setViewState: (view: ViewState) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ setViewState }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      // Load user profile
      const savedProfile = localStorage.getItem('arthur_user_profile');
      let profile: UserProfile | null = null;
      if (savedProfile) {
          profile = JSON.parse(savedProfile);
          setUserProfile(profile);
      }

      // Initialize chat with personalized message
      if (profile && profile.niche) {
        setMessages([
            { 
              id: '1', 
              role: 'model', 
              text: `Fala ${profile.handle ? profile.handle : 'Criador'}! Já estou sintonizado no seu nicho de **${profile.niche}**. \n\nQual é o próximo passo para o objetivo de **${profile.goal}**?` 
            }
        ]);
      } else {
        setMessages([
            { 
              id: '1', 
              role: 'model', 
              text: 'Fala! Sou o Arthur. Bora dominar o algoritmo. Pra eu te ajudar de verdade, me conta: **qual é o seu nicho hoje?**' 
            }
        ]);
      }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        // Prepare history for API
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const response = await sendChatMessage(history, userMsg.text, userProfile);
        
        const botMsg: ChatMessage = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: response.text,
            sources: response.sources
        };
        setMessages(prev => [...prev, botMsg]);

    } catch (error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Ocorreu um erro de conexão. Tente novamente." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => setViewState(ViewState.HOME)} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <div className="ml-4">
            <h2 className="font-bold text-lg text-black">Arthur</h2>
            <p className="text-xs text-green-600 font-medium flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Online
                {userProfile && userProfile.niche && (
                    <span className="ml-2 text-gray-300 font-normal">| {userProfile.niche}</span>
                )}
            </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-5 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-black text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}>
              <div
                className={`prose prose-sm max-w-none prose-p:leading-relaxed prose-li:my-0 prose-ul:my-2 prose-headings:text-current ${
                  msg.role === 'user' ? 'prose-invert text-white' : 'text-gray-800'
                }`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              
              {/* Sources Footnote */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100/50 text-[10px] opacity-70">
                    <p className="font-semibold mb-1">Fontes (30 dias):</p>
                    <div className="flex flex-wrap gap-2">
                        {msg.sources.slice(0, 3).map((source, idx) => (
                            <a 
                                key={idx} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="underline hover:text-blue-500 transition truncate max-w-[150px]"
                            >
                                {source.title || 'Link'}
                            </a>
                        ))}
                    </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center space-x-2">
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={userProfile ? `Fale sobre ${userProfile.niche}...` : "Responda o Arthur..."}
            className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-4 text-gray-800 focus:ring-2 focus:ring-black focus:outline-none transition-all placeholder-gray-400 shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:hover:bg-black"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
