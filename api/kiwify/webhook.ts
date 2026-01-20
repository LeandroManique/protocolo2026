import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const KIWIFY_WEBHOOK_TOKEN = process.env.KIWIFY_WEBHOOK_TOKEN;

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

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

  const body = await readJsonBody(req);
  const headerToken =
    (req.headers["x-kiwify-token"] as string | undefined) ||
    (req.headers["x-kiwify-signature"] as string | undefined) ||
    (req.headers["authorization"] as string | undefined)?.replace("Bearer ", "");
  const queryToken = req.query?.token;
  const bodyToken = body?.token || body?.webhook_token;

  if (KIWIFY_WEBHOOK_TOKEN) {
    const tokenMatch = [headerToken, queryToken, bodyToken].some(
      (token) => token && token === KIWIFY_WEBHOOK_TOKEN
    );
    if (!tokenMatch) {
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
