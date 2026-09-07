create table if not exists public.portfolio_ai_rate_limit_buckets (
  scope text not null,
  bucket_key text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (scope, bucket_key, window_start)
);

create table if not exists public.portfolio_ai_session_locks (
  session_id text primary key,
  expires_at timestamptz not null
);

create or replace function public.portfolio_acquire_ai_lock(p_session_id text, p_ttl_seconds integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare acquired boolean;
begin
  insert into public.portfolio_ai_session_locks (session_id, expires_at)
  values (p_session_id, now() + make_interval(secs => p_ttl_seconds))
  on conflict (session_id) do update set expires_at = excluded.expires_at
    where portfolio_ai_session_locks.expires_at <= now()
  returning true into acquired;
  return coalesce(acquired, false);
end;
$$;

create or replace function public.portfolio_release_ai_lock(p_session_id text)
returns void language sql security definer set search_path = public as $$
  delete from public.portfolio_ai_session_locks where session_id = p_session_id;
$$;

create or replace function public.portfolio_consume_ai_rate_limit(p_scope text, p_key text, p_window_seconds integer, p_limit integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare bucket_start timestamptz; allowed boolean;
begin
  if p_window_seconds <= 0 or p_limit <= 0 then raise exception 'invalid rate limit'; end if;
  bucket_start := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.portfolio_ai_rate_limit_buckets (scope, bucket_key, window_start, count, updated_at)
  values (p_scope, p_key, bucket_start, 1, now())
  on conflict (scope, bucket_key, window_start) do update set count = portfolio_ai_rate_limit_buckets.count + 1, updated_at = now()
    where portfolio_ai_rate_limit_buckets.count < p_limit
  returning true into allowed;
  delete from public.portfolio_ai_rate_limit_buckets where updated_at < now() - interval '24 hours';
  return coalesce(allowed, false);
end;
$$;

revoke all on table public.portfolio_ai_rate_limit_buckets, public.portfolio_ai_session_locks from anon, authenticated;
