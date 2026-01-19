import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { UserProfile } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

// System instruction enforcing step-by-step consultation and brevity
const SYSTEM_INSTRUCTION_BASE = `
Você é o "Arthur", um estrategista de TikTok obsessivo por resultados e retenção.
Sua missão é facilitar a vida do usuário. Sua UX (Experiência do Usuário) deve ser nota 10: leve, fluida e viciante.

MANDAMENTOS DE COMPORTAMENTO:
1. **PROIBIDO TEXTÃO**: Jamais envie respostas longas ou "bíblias" sem que o usuário peça explicitamente um relatório completo.
2. **MODO CONSULTIVO (PASSO A PASSO)**:
   - Não adivinhe o contexto. Construa-o (se você ainda não tiver os dados do perfil).
   - Faça **UMA** pergunta curta de cada vez para entender o cenário.
3. **TOM DE VOZ**: Conversacional, direto, energético e moderno.
4. **DADOS**: Use a tool [googleSearch] para validar suas dicas.
`;

export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  lastMessage: string,
  userProfile?: UserProfile | null
): Promise<{ text: string; sources: { title: string; uri: string }[] }> => {
  if (!apiKey) throw new Error("API Key missing");

  try {
    const modelId = 'gemini-3-flash-preview'; 

    // Dynamic System Instruction based on Profile Presence
    let effectiveSystemInstruction = SYSTEM_INSTRUCTION_BASE;

    if (userProfile && userProfile.niche) {
        effectiveSystemInstruction += `
        
        CONTEXTO DO USUÁRIO (MEMÓRIA PERSISTENTE):
        - Handle: ${userProfile.handle || "Não informado"}
        - Nicho: ${userProfile.niche}
        - Seguidores: ${userProfile.followers}
        - Objetivo Principal: ${userProfile.goal}

        DIRETRIZES DE PERSONALIZAÇÃO:
        1. Como você JÁ SABE o nicho (${userProfile.niche}), NÃO PERGUNTE "qual seu nicho?". Vá direto para a estratégia avançada.
        2. Se o usuário fizer uma pergunta que parece fugir muito do nicho (ex: um perfil de culinária perguntando sobre criptomoedas), confirme sutilmente: "Isso seria para o @${userProfile.handle} ou um novo projeto?".
        3. Se for dentro do universo do usuário, assuma que é para a conta dele e dê dicas específicas para ${userProfile.niche}.
        `;
    } else {
        effectiveSystemInstruction += `
        Se o usuário disser "Me ajuda", "Começar" ou algo genérico, sua resposta deve ser APENAS uma pergunta de qualificação (ex: "Bora! Pra eu te passar a visão certa, qual é o seu nicho hoje?").
        `;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        ...history, // Add previous context
        { role: 'user', parts: [{ text: lastMessage }] }
      ],
      config: {
        systemInstruction: effectiveSystemInstruction,
        tools: [{ googleSearch: {} }], // Grounding enabled
      }
    });

    const text = response.text || "Desculpe, não consegui processar. Vamos tentar de novo?";
    
    // Extract sources if available
    const sources: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
            sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return { text, sources };

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return { text: "Erro ao conectar com Arthur. Verifique sua internet.", sources: [] };
  }
};

export const generateViralScript = async (answers: any): Promise<string> => {
    if (!apiKey) throw new Error("API Key missing");
  
    const prompt = `
    ATUE COMO UM DIRETOR DE CRIAÇÃO DE UMA AGÊNCIA DE PUBLICIDADE DE ELITE (FOCADO EM TIKTOK).
    
    DADOS DO CLIENTE (USUÁRIO):
    - Termo (Search Insights): "${answers.searchTerm}"
    - Nicho: ${answers.niche}
    - Público: ${answers.audience}
    - Seguidores Atuais: ${answers.followers}
    - Duração Desejada: ${answers.duration}
    - Formato: ${answers.format}
    - Ideia Inicial: ${answers.initialIdea || "Nenhuma, crie do zero"}
  
    DIRETRIZES ESTRATÉGICAS (Baseado no nº de seguidores):
    ${parseInt(answers.followers) > 10000 
      ? "- Como o usuário tem +10k, priorize retenção acima de 1 minuto para monetização (RPM). Crie arcos narrativos mais densos." 
      : "- Como o usuário é pequeno/médio, priorize ALCANCE e VELOCIDADE. Gancho agressivo e cortes rápidos."}

    OBJETIVO:
    Criar um roteiro TÉCNICO, com direção de cena, posicionamento de câmera e fala exata.
    
    IMPORTANTE: Adicione uma linha em branco ou espaçamento claro entre cada ATO para facilitar a leitura.

    FORMATO OBRIGATÓRIO DE SAÍDA (Markdown):
    
    ## 🎬 Roteiro Técnico: ${answers.searchTerm}
    
    ---

    **ATO 1: O GANCHO (0-3s)**
    *A parte mais importante. Se falhar aqui, o vídeo morre.*
    
    - 🎥 **CENA/VISUAL**: [Descreva exatamente: Plano médio? Close-up? Onde o celular está apoiado? O que o usuário está vestindo ou segurando?]
    - ⚡ **AÇÃO**: [Movimento exato. Ex: "Bata a mão na mesa", "Vire subitamente para a câmera", "Dê um zoom in manual"]
    - 🗣️ **FALA**: "[Texto exato, curto e impactante]"

    <br>

    **ATO 2: A RETENÇÃO/CONTEXTO (3-15s)**
    *Conecte o gancho ao desejo do usuário.*
    
    - 🎥 **CENA**: [Mudança de ângulo ou B-Roll]
    - 🗣️ **FALA**: "[Desenvolvimento do problema/solução]"

    <br>

    **ATO 3: O CONTEÚDO (O "Ouro")**
    *A entrega da promessa.*
    
    - 🎥 **DIREÇÃO**: [Como demonstrar isso visualmente? Não apenas fale, mostre.]
    - 🗣️ **FALA**: "[Explicação passo a passo ou narrativa]"

    <br>

    **ATO 4: CTA ESTRATÉGICO (Final)**
    
    - 🗣️ **FALA**: "[Chamada para ação alinhada ao objetivo de ${answers.followers} seguidores]"

    ---
    💡 **Nota do Diretor**: [Uma dica técnica sobre iluminação ou áudio para este vídeo específico]
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_BASE,
          tools: [{ googleSearch: {} }],
        }
      });
  
      return response.text || "Não foi possível gerar o roteiro.";
    } catch (error) {
      console.error("Gemini Script Error:", error);
      return "Erro na geração do roteiro. Tente novamente.";
    }
  };

  export const refineScript = async (currentScript: string, feedback: string): Promise<string> => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
    ROTEIRO ATUAL:
    ${currentScript}

    SOLICITAÇÃO DE AJUSTE DO USUÁRIO (DIRETOR):
    "${feedback}"

    INSTRUÇÃO:
    Reescreva o roteiro mantendo a estrutura TÉCNICA (Cena, Ação, Fala), mas aplicando EXATAMENTE o ajuste pedido.
    Se o usuário pediu para mudar o tom, mude o tom. Se pediu para encurtar, encurte.
    MANTENHA O ESPAÇAMENTO ENTRE OS ATOS (linhas em branco) para clareza visual.
    Mantenha a formatação clara.
    `;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview', 
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_BASE
          }
        });
    
        return response.text || "Erro ao ajustar roteiro.";
      } catch (error) {
        console.error("Gemini Refine Error:", error);
        return "Erro ao ajustar roteiro.";
      }
  };

  export const fetchWeeklyStrategyUpdate = async (): Promise<string> => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = "Quais são as 3 principais TRENDS ou MUDANÇAS no algoritmo do TikTok desta última semana? Responda em formato de 'Boletim Rápido' (Bullet points, leitura escaneável, direto ao ponto). Nada de textos longos.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: "Você é o curador do 'Código Fonte'. Entregue apenas o ouro, formatado para leitura rápida em celular.",
                tools: [{ googleSearch: {} }]
            }
        });
        return response.text || "Sem atualizações hoje.";
    } catch (error) {
        console.error("Gemini Strategy Error", error);
        return "Erro ao buscar estratégias.";
    }
  };

  export const auditProfile = async (profileData: { handle: string, name: string, bio: string, niche: string, image?: string }): Promise<any> => {
    if (!apiKey) throw new Error("API Key missing");

    let parts = [];
    let promptText = "";

    if (profileData.image) {
        // Strip base64 header if present for the API call
        const cleanBase64 = profileData.image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
        
        parts.push({
            inlineData: {
                mimeType: "image/jpeg",
                data: cleanBase64
            }
        });
        promptText = `
        Analise este PRINT (Screenshot) de um perfil de TikTok.
        Primeiro, extraia visualmente o Handle, Nome e Bio da imagem.
        Em seguida, forneça um "Raio-X" brutalmente honesto.
        
        Se o nicho não foi fornecido: ${profileData.niche}, tente deduzir pelo conteúdo da imagem.
        `;
    } else {
        promptText = `
        Analise este perfil de TikTok com base nos dados de texto e forneça um "Raio-X" brutalmente honesto.
        
        DADOS:
        Handle: ${profileData.handle}
        Nome: ${profileData.name}
        Bio: ${profileData.bio}
        Nicho: ${profileData.niche}
        `;
    }

    promptText += `
    Retorne JSON seguindo este schema:
    {
      "score": number (0-100),
      "summary": "Uma frase de impacto resumindo a situação",
      "roast": "Uma crítica ácida e direta sobre o erro principal",
      "fixes": {
        "name": "Sugestão de Nome Otimizado para SEO",
        "bio": "Sugestão de Bio Perfeita (com quebra de linha usando \\n)",
        "explanation": "Por que essa mudança vai converter mais?"
      },
      "checklist": {
        "seo": boolean (true se o nome/bio tem palavras-chave),
        "cta": boolean (true se tem chamada para ação),
        "clarity": boolean (true se dá para entender o nicho em 3s)
      }
    }
    `;

    parts.push({ text: promptText });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: parts }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              roast: { type: Type.STRING },
              fixes: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  bio: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                }
              },
              checklist: {
                type: Type.OBJECT,
                properties: {
                  seo: { type: Type.BOOLEAN },
                  cta: { type: Type.BOOLEAN },
                  clarity: { type: Type.BOOLEAN }
                }
              }
            }
          }
        }
      });
      
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Audit Error", error);
      return null;
    }
  }

  export const generateVideoMetadata = async (topic: string, niche: string): Promise<any> => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
    Gere metadados de SEO para um vídeo de TikTok com alto potencial viral.
    
    TEMA: ${topic}
    NICHO: ${niche}

    OBJETIVO: Maximizar a indexação na barra de pesquisa (Search SEO) e alcance.

    Retorne JSON:
    {
      "thumbnailText": "Texto curto (max 5 palavras), impactante e polêmico para colocar na CAPA do vídeo (Thumbnail Hook).",
      "caption": "Legenda completa. Comece com uma pergunta/gancho, use 2-3 linhas de espaço, e termine com um CTA. Use palavras-chave no texto.",
      "hashtags": {
        "broad": ["3 hashtags gigantes do nicho (+10M)"],
        "niche": ["3 hashtags médias (+1M)"],
        "specific": ["3 hashtags muito específicas do tema"]
      },
      "searchTerms": ["3 termos exatos que as pessoas digitam na busca para achar esse vídeo"]
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        thumbnailText: { type: Type.STRING },
                        caption: { type: Type.STRING },
                        hashtags: {
                            type: Type.OBJECT,
                            properties: {
                                broad: { type: Type.ARRAY, items: { type: Type.STRING } },
                                niche: { type: Type.ARRAY, items: { type: Type.STRING } },
                                specific: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        },
                        searchTerms: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("SEO Gen Error", error);
        return null;
    }
  };