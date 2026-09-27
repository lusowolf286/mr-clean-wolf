-- Mr Clean Wolf — ligação automática às redes sociais (dashboard)
-- Executar uma vez no Supabase: SQL Editor → New query → colar tudo → Run.
-- Depois de publicada a função "social-sync".

-- 1. Tabela privada para os acessos do TikTok (renovados automaticamente).
--    Sem regras de acesso: só a função no servidor a consegue ler.
create table if not exists public.social_privado (
  id          text primary key,
  dados       jsonb not null,
  updated_at  timestamptz not null default now()
);
alter table public.social_privado enable row level security;
revoke all on public.social_privado from anon, authenticated;
grant select, insert, update, delete on public.docs, public.admins, public.social_privado to service_role;

-- 2. Recolha diária às 05:15 (UTC) — fecha os números do dia anterior.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('mcw-social-sync') where exists (select 1 from cron.job where jobname = 'mcw-social-sync');
select cron.schedule('mcw-social-sync', '15 5 * * *', $$
  select net.http_post(
    url     := 'https://nsivezaolaugdrwojfun.supabase.co/functions/v1/social-sync',
    headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', 'sb_publishable_5TM2ArtrjOgxh8dhkKaYFw_apjCqHWf'),
    body    := '{"acao":"sync"}'::jsonb,
    timeout_milliseconds := 120000
  );
$$);
