const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

type OpenAIRequestBody = {
  messages?: unknown;
  temperature?: number;
  responseFormat?: { type?: string };
  model?: string;
};

const readJsonBody = async (req: any): Promise<OpenAIRequestBody> => {
  if (req.body) {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch (error) {
        return {};
      }
    }
    return req.body as OpenAIRequestBody;
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
  if (!apiKey) {
    sendJson(res, 500, { error: "Missing OPENAI_API_KEY" });
    return;
  }

  const body = await readJsonBody(req);
  const messages = Array.isArray(body.messages) ? body.messages : null;
  if (!messages) {
    sendJson(res, 400, { error: "Invalid messages payload" });
    return;
  }

  const temperature = typeof body.temperature === "number" ? body.temperature : 0.7;
  const responseFormat =
    body.responseFormat?.type === "json_object" ? { type: "json_object" } : undefined;
  const model = body.model === DEFAULT_MODEL ? DEFAULT_MODEL : DEFAULT_MODEL;

  const payload: Record<string, unknown> = {
    model,
    messages,
    temperature,
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
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
    const errorText = data?.error?.message || data?.error || raw || "OpenAI API error";
    sendJson(res, response.status, { error: errorText });
    return;
  }

  const content = data?.choices?.[0]?.message?.content || "";
  sendJson(res, 200, { content });
}
