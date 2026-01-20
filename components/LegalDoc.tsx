import React from 'react';
import { ViewState } from '../types';
import { ArrowLeft, ShieldCheck, Scale, AlertTriangle } from 'lucide-react';

interface LegalDocProps {
  setViewState: (view: ViewState) => void;
  type: 'terms' | 'privacy';
}

const LegalDoc: React.FC<LegalDocProps> = ({ setViewState, type }) => {
  const isTerms = type === 'terms';

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900 animate-fade-in-up selection:bg-black selection:text-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center sticky top-0 z-10 backdrop-blur-md bg-white/90">
        <button onClick={() => setViewState(ViewState.HOME)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="ml-4 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            {isTerms ? <Scale className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {isTerms ? 'Termos de Uso' : 'Política de Privacidade'}
        </h2>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full p-8 md:p-12">
        <div className="prose prose-sm max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-wide prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600">
            
            {/* Header of Doc */}
            <div className="mb-10 pb-8 border-b border-gray-100">
                <div className="inline-block bg-black text-white text-[10px] font-bold px-2 py-1 mb-3 uppercase tracking-widest">Documento Oficial</div>
                <h1 className="text-4xl font-black mb-2 tracking-tighter">Protocolo 2026 // v2.6</h1>
                <p className="text-xs font-mono text-gray-400 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Vigência Imediata • Última Atualização: {new Date().toLocaleDateString('pt-BR')}
                </p>
            </div>

            {isTerms ? (
                <>
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
                        <h4 className="flex items-center gap-2 text-red-700 font-bold uppercase text-xs mb-1">
                            <AlertTriangle className="w-4 h-4" /> Aviso Legal Importante
                        </h4>
                        <p className="text-red-800 text-xs m-0">
                            Este software é uma ferramenta de suporte à decisão. O usuário reconhece que o sucesso em plataformas de terceiros (TikTok/ByteDance) independe da vontade dos desenvolvedores deste software.
                        </p>
                    </div>

                    <h3>1. Aceitação Irrestrita</h3>
                    <p>
                        Ao acessar e utilizar a plataforma "Arthur - O Estrategista" (o "Software"), o usuário concorda, sem ressalvas, com estes Termos de Uso. O Software utiliza Inteligência Artificial Generativa (OpenAI GPT-4o mini) para processar dados e fornecer insights.
                    </p>

                    <h3>2. Obrigação de Meio e Ausência de Garantia</h3>
                    <p>
                        Declaramos expressamente que o Serviço constitui uma obrigação de meio, e não de fim. <strong>Não há, em hipótese alguma, garantia de resultados</strong> como: viralização, número específico de visualizações, crescimento de seguidores ou monetização financeira. As estratégias fornecidas baseiam-se em padrões algorítmicos que podem ser alterados pelas plataformas sociais sem aviso prévio.
                    </p>

                    <h3>3. Propriedade Intelectual</h3>
                    <p>
                        <strong>3.1 Do Usuário:</strong> Todo o conteúdo final criado pelo usuário (vídeos, legendas) a partir dos roteiros gerados pertence exclusivamente ao usuário. <br/>
                        <strong>3.2 Do Software:</strong> O código-fonte, a interface visual, a marca "Arthur", o conceito "Protocolo 2026" e os prompts de engenharia são propriedade intelectual exclusiva dos desenvolvedores, protegidos pela Lei de Direitos Autorais e Propriedade Industrial. É vedada a engenharia reversa.
                    </p>

                    <h3>4. Limitação de Responsabilidade (Hold Harmless)</h3>
                    <p>
                        O usuário concorda em isentar os desenvolvedores de qualquer responsabilidade por danos diretos, indiretos, incidentais, especiais ou consequenciais (incluindo danos por perda de lucros, interrupção de negócios ou perda de informações) decorrentes do uso ou da incapacidade de usar o Software, ou de falhas ("alucinações") da Inteligência Artificial.
                    </p>

                    <h3>5. Diretrizes de Comunidade e Uso Ético</h3>
                    <p>
                        É estritamente proibido utilizar o Software para gerar conteúdo que: (a) viole direitos de terceiros; (b) promova discurso de ódio, violência ou discriminação; (c) dissemine desinformação (Fake News); ou (d) viole os Termos de Serviço do TikTok. A violação resultará no bloqueio imediato do acesso.
                    </p>
                </>
            ) : (
                <>
                    <h3>1. Privacidade por Design (Privacy by Design)</h3>
                    <p>
                        O "Arthur" foi arquitetado sob o princípio de <em>Data Minimization</em>. Não mantemos banco de dados centralizado de usuários. Seus dados de perfil (Handle, Nicho, Metas) são armazenados localmente no seu dispositivo (Local Storage), garantindo que você tenha controle total sobre suas informações.
                    </p>

                    <h3>2. Processamento de Dados via API</h3>
                    <p>
                        Para a funcionalidade de IA, os inputs de texto e imagens (prints) são enviados de forma criptografada para a API da OpenAI (GPT-4o mini). Estes dados são processados de forma <em>stateless</em> (sem estado) para gerar a resposta imediata e não são utilizados pelos desenvolvedores para treinamento de modelos proprietários ou vendidos a terceiros.
                    </p>

                    <h3>3. Dados Sensíveis e Imagens</h3>
                    <p>
                        No recurso "Raio-X de Perfil", as imagens enviadas são analisadas em tempo real e descartadas após a extração dos dados analíticos. Não armazenamos prints de perfis em nossos servidores.
                    </p>

                    <h3>4. Direitos do Titular (LGPD/GDPR)</h3>
                    <p>
                        O usuário pode, a qualquer momento, revogar o acesso aos seus dados locais simplesmente limpando o cache do navegador ou utilizando a função de "Logout/Limpeza" (quando disponível). Não realizamos rastreamento cruzado (cross-site tracking) nem utilizamos cookies de publicidade comportamental.
                    </p>
                </>
            )}
            
            <div className="mt-16 pt-8 border-t border-gray-200">
                <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest mb-2">
                    Jurídico & Compliance
                </p>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 text-center leading-relaxed">
                    Ao continuar utilizando o sistema, você ratifica a leitura e concordância com este instrumento.
                    <br />
                    <strong>Foro de Eleição:</strong> Comarca da Capital do Estado de São Paulo, Brasil, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default LegalDoc;
