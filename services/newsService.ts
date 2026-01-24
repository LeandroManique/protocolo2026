import { fetchKnowledgeContext } from "./knowledgeService";

type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const OPENAI_PROXY_URL = "/api/openai";
const CHAT_MODEL = "gpt-4o-mini";

const SYSTEM_INSTRUCTION = `
Voce e um jornalista de dados e estrategista senior de TikTok (persona: "The Analyst").
Seu objetivo e fornecer inteligencia de mercado baseada em padroes recentes e conhecimento geral.

Diretrizes:
1. Seja objetivo, tecnico e direto.
2. Use Markdown com bullets curtos.
3. Idioma: Portugues do Brasil (PT-BR).
4. Nao invente dados. Se houver incerteza, deixe isso claro.
`;

const createChatCompletion = async (options: {
  messages: OpenAIMessage[];
  temperature?: number;
}): Promise<string> => {
  const payload: Record<string, unknown> = {
    model: CHAT_MODEL,
    messages: options.messages,
    temperature: options.temperature ?? 0.6,
  };

  const response = await fetch(OPENAI_PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text().catch(() => "");
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const errorText = data?.error || raw || "Unknown error";
    throw new Error(`OpenAI proxy error: ${response.status} ${errorText}`);
  }

  return data?.content || "";
};

export const generateStrategicAdvice = async (
  prompt: string,
  temperature: number = 0.6
): Promise<string> => {
  try {
    const knowledgeContext = await fetchKnowledgeContext(prompt);
    const text = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: `${SYSTEM_INSTRUCTION}\n\nDIRETRIZ OFICIAL (PRIORIDADE): Use o relatorio oficial do TikTok como regra principal.\n\n${
            knowledgeContext ? `TRECHOS DO RELATORIO:\n${knowledgeContext}` : ""
          }`,
        },
        { role: "user", content: prompt },
      ],
      temperature,
    });

    return text || "Nao foi possivel gerar a analise no momento.";
  } catch (error) {
    console.error("OpenAI News Error:", error);
    return "Erro de conexao com a base de dados. Tente atualizar a pagina.";
  }
};

export const getLatestAlgorithmInsights = async (): Promise<string> => {
  const today = new Date().toLocaleDateString("pt-BR");
  const prompt = `Data de hoje: ${today}.
Gere uma manchete de "ULTIMA HORA" e 3 bullet points tecnicos sobre mudancas recentes no algoritmo do TikTok (foco em SEO, Retencao ou Monetizacao).
Se nao houver mudanca confirmada, descreva a tendencia de comportamento mais forte do momento.`;

  return generateStrategicAdvice(prompt, 0.5);
};

export const getGeneralTrends = async (): Promise<string> => {
  const today = new Date().toLocaleDateString("pt-BR");
  const prompt = `Data de hoje: ${today}.
Liste as trends, formatos ou audios que estao mais fortes nesta semana no TikTok (Brasil ou global).
Retorne um resumo curto estilo "Radar de Oportunidades" com 3 itens acionaveis para criadores usarem hoje.`;

  return generateStrategicAdvice(prompt, 0.5);
};

export const getGrowthHacksForNiche = async (niche: string): Promise<string> => {
  const prompt = `Liste 3 hacks de viralizacao tecnicos e aplicaveis para o nicho de: ${niche}.
Seja direto e pratico, em bullets.`;

  return generateStrategicAdvice(prompt, 0.5);
};
