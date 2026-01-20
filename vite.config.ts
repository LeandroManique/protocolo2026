import path from "path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

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

const openaiDevProxy = (apiKey: string): Plugin => ({
  name: "openai-dev-proxy",
  configureServer(server) {
    server.middlewares.use("/api/openai", async (req, res) => {
      if (req.method !== "POST") {
        sendJson(res, 405, { error: "Method not allowed" });
        return;
      }

      if (!apiKey) {
        sendJson(res, 500, { error: "Missing OPENAI_API_KEY" });
        return;
      }

      const body = await readJsonBody(req);
      const messages = Array.isArray(body?.messages) ? body.messages : null;
      if (!messages) {
        sendJson(res, 400, { error: "Invalid messages payload" });
        return;
      }

      const temperature = typeof body?.temperature === "number" ? body.temperature : 0.7;
      const responseFormat =
        body?.responseFormat?.type === "json_object" ? { type: "json_object" } : undefined;

      const payload: Record<string, unknown> = {
        model: DEFAULT_MODEL,
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
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react(), openaiDevProxy(env.OPENAI_API_KEY)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
