create extension if not exists vector;

create table if not exists public.knowledge_base (
  id bigserial primary key,
  source text not null,
  page int,
  chunk_index int,
  content text not null,
  embedding vector(1536) not null,
  created_at timestamptz default now()
);

create index if not exists knowledge_base_source_idx
  on public.knowledge_base (source);

create index if not exists knowledge_base_embedding_idx
  on public.knowledge_base using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create or replace function public.match_knowledge(
  query_embedding vector(1536),
  match_count int default 5,
  filter_source text default null
)
returns table (
  id bigint,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    knowledge_base.id,
    knowledge_base.content,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from public.knowledge_base
  where filter_source is null or knowledge_base.source = filter_source
  order by knowledge_base.embedding <=> query_embedding
  limit match_count;
$$;

alter table public.knowledge_base enable row level security;
