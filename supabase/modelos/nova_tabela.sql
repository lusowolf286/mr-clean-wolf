-- Modelo para uma tabela nova no esquema public (regra E4.5 de docs/REGRAS-DE-QUALIDADE.md)
--
-- Desde 30/10/2026 a Supabase não dá acesso automático pela Data API às tabelas novas em public.
-- Sem os GRANT abaixo, supabase-js devolve «permission denied».
--
-- Como usar: copiar para supabase/migrations/AAAAMMDDHHMMSS_<nome>.sql, substituir «nova_tabela»
-- e escrever as regras RLS. Tabela, RLS, regras e GRANT ficam sempre no MESMO ficheiro.

-- 1. Tabela
create table if not exists public.nova_tabela (
  id         uuid primary key default gen_random_uuid(),
  dados      jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. RLS (obrigatório em todas as tabelas — E4.2)
alter table public.nova_tabela enable row level security;

-- 3. Regras de acesso (exemplo: só o gestor)
drop policy if exists "gestor tudo em nova_tabela" on public.nova_tabela;
create policy "gestor tudo em nova_tabela" on public.nova_tabela
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 4. Permissões explícitas (E4.5) — dar só o necessário
grant select, insert, update, delete on public.nova_tabela to authenticated;

-- Só se uma Edge Function (chave secret) precisar desta tabela:
-- grant select, insert, update, delete on public.nova_tabela to service_role;

-- Só para conteúdo público, legível sem sessão iniciada (e com regra RLS para anon):
-- grant select on public.nova_tabela to anon;

-- 5. Depois de aplicar: confirmar com sessão iniciada que a app lê e grava, e sem sessão que não lê.
