import { createClient } from "@supabase/supabase-js";

const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_SOURCE = "tiktok_trends_2026";

const readJsonBody = async (req: any): Promise<any> => {
  if (req.body) {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch (error) {
        return {};
      }
    }
    return req.body;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (!chunks.length) {
    return {};
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    return {};
  }
};

const sendJson = (res: any, status: number, payload: Record<string, unknown>) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
    sendJson(res, 500, { error: "Missing env vars" });
    return;
  }

  const body = await readJsonBody(req);
  const query = typeof body.query === "string" ? body.query.trim() : "";
  const limit = typeof body.limit === "number" ? Math.min(Math.max(body.limit, 1), 8) : 4;
  const source = typeof body.source === "string" ? body.source : DEFAULT_SOURCE;

  if (!query) {
    sendJson(res, 200, { chunks: [] });
    return;
  }

  const embeddingResponse = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: query }),
  });

  const embeddingRaw = await embeddingResponse.text().catch(() => "");
  let embeddingData: any = null;
  try {
    embeddingData = embeddingRaw ? JSON.parse(embeddingRaw) : null;
  } catch (error) {
    embeddingData = null;
  }

  if (!embeddingResponse.ok) {
    const errorText = embeddingData?.error?.message || embeddingData?.error || embeddingRaw || "Embedding error";
    sendJson(res, embeddingResponse.status, { error: errorText });
    return;
  }

  const embedding = embeddingData?.data?.[0]?.embedding;
  if (!embedding) {
    sendJson(res, 500, { error: "Invalid embedding response" });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: embedding,
    match_count: limit,
    filter_source: source,
  });

  if (error) {
    sendJson(res, 500, { error: error.message });
    return;
  }

  sendJson(res, 200, { chunks: data || [] });
}
