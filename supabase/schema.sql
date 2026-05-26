create table if not exists public.portfolio_sessions (
  session_id text primary key,
  session_payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists portfolio_sessions_updated_at_idx
  on public.portfolio_sessions (updated_at desc);
