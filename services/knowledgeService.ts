type KnowledgeChunk = {
  content: string;
  similarity?: number;
};

const KNOWLEDGE_QUERY_URL = "/api/knowledge/query";

export const fetchKnowledgeContext = async (query: string, limit: number = 4): Promise<string> => {
  if (!query.trim()) return "";

  try {
    const response = await fetch(KNOWLEDGE_QUERY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, limit }),
    });

    if (!response.ok) return "";
    const data = (await response.json()) as { chunks?: KnowledgeChunk[] };
    const chunks = data.chunks ?? [];
    if (!chunks.length) return "";

    return chunks
      .map((chunk, index) => `Trecho ${index + 1}: ${chunk.content}`)
      .join("\n\n");
  } catch (error) {
    return "";
  }
};
