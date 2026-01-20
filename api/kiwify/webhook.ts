import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const KIWIFY_WEBHOOK_TOKEN = process.env.KIWIFY_WEBHOOK_TOKEN;

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

const safeParseJson = (value: string | null): any => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
};

const readBody = async (req: any): Promise<{ rawBody: string; body: any }> => {
  if (typeof req.body === "string") {
    return { rawBody: req.body, body: safeParseJson(req.body) };
  }
  if (Buffer.isBuffer(req.body)) {
    const rawBody = req.body.toString("utf8");
    return { rawBody, body: safeParseJson(rawBody) };
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const rawBody = chunks.length ? Buffer.concat(chunks).toString("utf8") : "";
  const parsedBody = safeParseJson(rawBody);
  if (rawBody) {
    return { rawBody, body: parsedBody };
  }

  if (req.body && typeof req.body === "object") {
    // Best-effort fallback if body parsing already consumed the stream.
    const fallbackRaw = JSON.stringify(req.body);
    return { rawBody: fallbackRaw, body: req.body };
  }

  return { rawBody: "", body: {} };
};

const sendJson = (res: any, status: number, payload: Record<string, unknown>) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const normalizeSignature = (value: unknown): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) {
    return normalizeSignature(value[0]);
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/^sha256=/i, "");
  if (!trimmed) return null;
  if (/^[0-9a-f]+$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return trimmed;
};

const pickHeader = (req: any, name: string): string | null => {
  const value = req.headers?.[name];
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  if (typeof value === "string") return value;
  return null;
};

const verifyHmacSignature = (rawBody: string, signature: string, secret: string): boolean => {
  if (!rawBody) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  const hex = digest.toString("hex");
  const base64 = digest.toString("base64");
  const signatureBuffer = Buffer.from(signature);

  if (signature.length === hex.length) {
    return timingSafeEqual(Buffer.from(hex), signatureBuffer);
  }
  if (signature.length === base64.length) {
    return timingSafeEqual(Buffer.from(base64), signatureBuffer);
  }
  return false;
};

const extractEmail = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === "string") {
    const match = value.match(EMAIL_REGEX);
    return match ? match[0] : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractEmail(item);
      if (found) return found;
    }
  }
  if (typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.toLowerCase().includes("email")) {
        const direct = extractEmail(value[key]);
        if (direct) return direct;
      }
    }
    for (const key of Object.keys(value)) {
      const nested = extractEmail(value[key]);
      if (nested) return nested;
    }
  }
  return null;
};

const extractFirstString = (value: any, keys: string[]): string | null => {
  if (!value || typeof value !== "object") return null;
  for (const key of keys) {
    if (key in value) {
      const candidate = value[key];
      if (typeof candidate === "string") return candidate;
      if (candidate && typeof candidate === "object" && typeof candidate.name === "string") {
        return candidate.name;
      }
    }
  }
  for (const nestedKey of Object.keys(value)) {
    const nestedValue = value[nestedKey];
    const found = extractFirstString(nestedValue, keys);
    if (found) return found;
  }
  return null;
};

const extractEventName = (body: any): string | null => {
  const direct =
    body?.event || body?.type || body?.evento || body?.event_name || body?.action || null;
  if (typeof direct === "string") return direct;
  return extractFirstString(body, ["event", "type", "evento", "event_name", "action"]);
};

const deriveStatus = (eventName: string | null, body: any): string => {
  const candidate = (eventName ?? "").toLowerCase();
  const fallback = extractFirstString(body, ["status", "subscription_status", "payment_status"]);
  const fallbackNormalized = (fallback ?? "").toLowerCase();
  const combined = `${candidate} ${fallbackNormalized}`;

  if (
    combined.includes("aprov") ||
    combined.includes("approved") ||
    combined.includes("paid") ||
    combined.includes("renew") ||
    combined.includes("renov")
  ) {
    return "active";
  }
  if (combined.includes("atras") || combined.includes("past_due") || combined.includes("overdue")) {
    return "past_due";
  }
  if (
    combined.includes("cancel") ||
    combined.includes("refund") ||
    combined.includes("reembolso") ||
    combined.includes("chargeback")
  ) {
    return "canceled";
  }
  return "inactive";
};

const extractPeriodEnd = (body: any): string | null => {
  const value = extractFirstString(body, [
    "next_charge_date",
    "current_period_end",
    "expires_at",
    "expiration_date",
    "due_date",
    "renew_at",
  ]);
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString();
  }
  return null;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    sendJson(res, 500, { error: "Missing Supabase env vars" });
    return;
  }

  const { rawBody, body } = await readBody(req);
  const headerToken =
    pickHeader(req, "x-kiwify-token") ||
    (pickHeader(req, "authorization") || "").replace("Bearer ", "");
  const queryToken = req.query?.token;
  const signature =
    normalizeSignature(pickHeader(req, "x-kiwify-signature")) ||
    normalizeSignature(req.query?.signature) ||
    normalizeSignature(body?.signature);
  const bodyToken = body?.token || body?.webhook_token;

  if (KIWIFY_WEBHOOK_TOKEN) {
    const tokenMatch = [headerToken, queryToken, bodyToken].some(
      (token) => token && token === KIWIFY_WEBHOOK_TOKEN
    );
    const signatureTokenMatch = signature && signature === KIWIFY_WEBHOOK_TOKEN;
    const signatureMatch =
      !!signature && verifyHmacSignature(rawBody, signature, KIWIFY_WEBHOOK_TOKEN);
    if (!tokenMatch && !signatureTokenMatch && !signatureMatch) {
      sendJson(res, 401, { error: "Invalid webhook token" });
      return;
    }
  }

  const email = extractEmail(body);
  if (!email) {
    sendJson(res, 400, { error: "Email not found in payload" });
    return;
  }

  const eventName = extractEventName(body);
  const status = deriveStatus(eventName, body);
  const plan = extractFirstString(body, ["plan", "offer", "product", "product_name"]);
  const periodEnd = extractPeriodEnd(body);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const payload = {
    email,
    status,
    plan,
    current_period_end: periodEnd,
    last_event: eventName,
    raw: body,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("subscriptions").upsert(payload, {
    onConflict: "email",
  });

  if (error) {
    sendJson(res, 500, { error: error.message });
    return;
  }

  sendJson(res, 200, { ok: true });
}
