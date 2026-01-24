import { createClient } from "@supabase/supabase-js";
import pdf from "pdf-parse";

const INPUT = process.argv[2];
const SOURCE = process.argv[3] || "tiktok_trends_2026";

if (!INPUT) {
  console.error("Uso: node scripts/ingest_report.mjs <caminho-ou-link-pdf> [source]");
  process.exit(1);
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltam variaveis de ambiente (OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).");
  process.exit(1);
}

const toDownloadUrl = (value) => {
  if (!value.startsWith("http")) return value;
  const driveMatch = value.match(/\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }
  return value;
};

const fetchBuffer = async (value) => {
  if (!value.startsWith("http")) {
    const fs = await import("node:fs/promises");
    return fs.readFile(value);
  }
  const response = await fetch(toDownloadUrl(value));
  if (!response.ok) {
    throw new Error(`Falha ao baixar PDF: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const normalizeText = (value) =>
  value.replace(/\s+/g, " ").replace(/\u0000/g, "").trim();

const chunkWords = (words, size) => {
  const chunks = [];
  for (let i = 0; i < words.length; i += size) {
    const slice = words.slice(i, i + size);
    if (slice.length < 40) continue;
    chunks.push(slice.join(" "));
  }
  return chunks;
};

const createEmbeddings = async (inputs) => {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: inputs }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(raw);
  }
  const data = JSON.parse(raw);
  return data.data.map((item) => item.embedding);
};

const buffer = await fetchBuffer(INPUT);
const parsed = await pdf(buffer);
const rawText = parsed.text || "";
const pages = rawText.includes("\f") ? rawText.split("\f") : [rawText];

const chunks = [];
let chunkIndex = 0;

pages.forEach((pageText, pageNumber) => {
  const clean = normalizeText(pageText);
  if (!clean) return;
  const words = clean.split(" ");
  const pageChunks = chunkWords(words, 600);
  pageChunks.forEach((content) => {
    chunks.push({
      source: SOURCE,
      page: pageNumber + 1,
      chunk_index: chunkIndex++,
      content,
    });
  });
});

console.log(`Chunks gerados: ${chunks.length}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error: deleteError } = await supabase.from("knowledge_base").delete().eq("source", SOURCE);
if (deleteError) {
  console.warn("Aviso: nao foi possivel limpar a base anterior.", deleteError.message);
}

const BATCH_SIZE = 40;
for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
  const batch = chunks.slice(i, i + BATCH_SIZE);
  const embeddings = await createEmbeddings(batch.map((chunk) => chunk.content));
  const rows = batch.map((chunk, idx) => ({
    ...chunk,
    embedding: embeddings[idx],
  }));

  const { error } = await supabase.from("knowledge_base").insert(rows);
  if (error) {
    throw new Error(error.message);
  }
  console.log(`Inserido ${Math.min(i + BATCH_SIZE, chunks.length)} / ${chunks.length}`);
}

console.log("Ingestao concluida.");
