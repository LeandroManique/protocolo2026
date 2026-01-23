const NEWSROOM_URL = "https://newsroom.tiktok.com/?lang=pt";

const decodeHtml = (value: string): string =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();

const normalizeUrl = (href: string): string => {
  const decoded = decodeHtml(href);
  if (decoded.startsWith("http")) return decoded;
  if (decoded.startsWith("/")) return `https://newsroom.tiktok.com${decoded}`;
  return `https://newsroom.tiktok.com/${decoded}`;
};

const extractHeadline = (html: string) => {
  const headlineMatch = html.match(
    /page-home-welcome-article-title[^>]*href="([^"]+)"[^>]*>\s*<h1[^>]*>([^<]+)<\/h1>/i
  );
  const dateMatch = html.match(/article-basic-date-time[^>]*>([^<]+)</i);

  if (headlineMatch) {
    return {
      title: decodeHtml(headlineMatch[2]),
      url: normalizeUrl(headlineMatch[1]),
      date: dateMatch ? decodeHtml(dateMatch[1]) : null,
    };
  }

  const fallbackTitle = html.match(/property="og:title" content="([^"]+)"/i);
  return {
    title: fallbackTitle ? decodeHtml(fallbackTitle[1]) : "Newsroom | TikTok",
    url: NEWSROOM_URL,
    date: null,
  };
};

const sendJson = (res: any, status: number, payload: Record<string, unknown>) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  res.end(JSON.stringify(payload));
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const response = await fetch(NEWSROOM_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      sendJson(res, 502, { error: "Failed to fetch TikTok Newsroom" });
      return;
    }

    const html = await response.text();
    const headline = extractHeadline(html);
    sendJson(res, 200, headline);
  } catch (error) {
    sendJson(res, 500, { error: "Unexpected error" });
  }
}
