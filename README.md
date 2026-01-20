<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1RpVflm2uSWimlva4K0RgxE7RjfQrOgmu

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the following in `.env.local`:
   - `OPENAI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. For Vercel deployments, also set:
   - `OPENAI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `KIWIFY_WEBHOOK_TOKEN`
4. Run the app:
   `npm run dev`

## Supabase schema (run in SQL editor)

```sql
create table if not exists public.subscriptions (
  email text primary key,
  user_id uuid,
  status text,
  plan text,
  current_period_end timestamptz,
  last_event text,
  raw jsonb,
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions read own"
on public.subscriptions
for select
using (auth.jwt() ->> 'email' = email);

create policy "subscriptions link user"
on public.subscriptions
for update
using (auth.jwt() ->> 'email' = email)
with check (auth.jwt() ->> 'email' = email);
```

## Kiwify webhook

Set the webhook URL to:
`https://your-domain.com/api/kiwify/webhook`
