-- Mr Clean Wolf — migração de base (baseline)
-- Reproduz o estado de produção do projeto Supabase «mr-clean-wolf» verificado a 20/10/2026:
-- tabelas do esquema public, restrições, índices, funções, RLS, regras de acesso, permissões
-- explícitas (GRANT), armazenamento de fotografias e tempo real.
--
-- Porquê: a partir de 30/10/2026 a Supabase deixa de dar acesso automático pela Data API às
-- tabelas novas em public. Sem esta migração, um projeto novo, uma preview branch ou um
-- «supabase db reset» recriariam as tabelas sem permissões e a app receberia «permission denied».
-- Regra E4.5 de docs/REGRAS-DE-QUALIDADE.md.
--
-- Em produção esta migração fica apenas registada no histórico (o esquema já existe).
-- Fora do âmbito desta migração (configuração própria de cada ambiente):
--   • tarefa diária «mcw-social-sync» (pg_cron) — ver supabase/social.sql;
--   • lista de gestores (linhas da tabela admins);
--   • supabase/notificacoes.sql — não está aplicado em produção.

-- 1. Tabelas -----------------------------------------------------------------------------

create table if not exists public.admins (
  email text primary key
);

create table if not exists public.docs (
  path       text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.portal (
  cliente_id text primary key,
  email      text,
  nome       text not null,
  dados      jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists portal_email_idx on public.portal (lower(email));

create table if not exists public.agenda (
  id         text primary key,
  dados      jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.pedidos (
  id         uuid primary key default gen_random_uuid(),
  cliente_id text not null,
  email      text not null,
  nome       text,
  dados      jsonb not null,
  estado     text not null default 'pendente',
  resposta   text,
  servico_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pedidos_estado_check check (estado in ('pendente','aceite','recusado'))
);
create index if not exists pedidos_email_idx on public.pedidos (lower(email));

create table if not exists public.atualizacoes (
  id            uuid primary key default gen_random_uuid(),
  token         text not null,
  cliente_id    text not null,
  nome          text,
  estado        text not null default 'enviado',
  dados         jsonb,
  created_at    timestamptz not null default now(),
  respondido_at timestamptz,
  expires_at    timestamptz not null default (now() + interval '30 days'),
  constraint atualizacoes_token_key unique (token),
  constraint atualizacoes_estado_check check (estado in ('enviado','respondido','aplicado','descartado'))
);

create table if not exists public.social_privado (
  id         text primary key,
  dados      jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2. Funções -----------------------------------------------------------------------------

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

create or replace function public.atualizacao_info(p_token text) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when a.id is null then jsonb_build_object('valido', false)
    else jsonb_build_object('valido', a.estado = 'enviado' and a.expires_at > now(),
                            'estado', a.estado, 'nome', split_part(coalesce(a.nome,''), ' ', 1)) end
  from (select 1) x left join public.atualizacoes a on a.token = p_token;
$$;

create or replace function public.atualizacao_responder(p_token text, p_dados jsonb) returns boolean
language plpgsql security definer set search_path = public as $$
declare d jsonb; vs jsonb;
begin
  d := jsonb_strip_nulls(jsonb_build_object(
    'email',  nullif(left(trim(p_dados->>'email'), 120), ''),
    'tel',    nullif(left(trim(p_dados->>'tel'), 30), ''),
    'morada', nullif(left(trim(p_dados->>'morada'), 300), ''),
    'nif',    nullif(left(regexp_replace(coalesce(p_dados->>'nif',''), '\D', '', 'g'), 9), '')));
  select jsonb_agg(v) into vs from (
    select jsonb_build_object('viatura', left(trim(coalesce(e->>'viatura','')), 60),
                              'matricula', upper(left(trim(coalesce(e->>'matricula','')), 15))) v
      from jsonb_array_elements(case when jsonb_typeof(p_dados->'viaturas') = 'array' then p_dados->'viaturas' else '[]'::jsonb end) with ordinality t(e, n)
     where trim(coalesce(e->>'viatura','')) <> '' or trim(coalesce(e->>'matricula','')) <> ''
     order by n limit 6) x;
  if vs is not null then d := d || jsonb_build_object('viaturas', vs); end if;
  if d = '{}'::jsonb then return false; end if;
  update public.atualizacoes set dados = d, estado = 'respondido', respondido_at = now()
   where token = p_token and estado = 'enviado' and expires_at > now();
  return found;
end $$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.atualizacao_info(text) from public;
revoke all on function public.atualizacao_responder(text, jsonb) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.atualizacao_info(text) to anon, authenticated;
grant execute on function public.atualizacao_responder(text, jsonb) to anon, authenticated;

-- 3. Permissões explícitas (E4.5) --------------------------------------------------------
-- anon: nenhum acesso direto às tabelas (só às duas funções do link de atualização de dados).
-- authenticated: limitado pelas regras RLS da secção 4.
-- service_role: só onde o servidor precisa (Edge Function social-sync).

grant usage on schema public to anon, authenticated, service_role;

revoke all on public.admins, public.docs, public.portal, public.agenda,
              public.pedidos, public.atualizacoes, public.social_privado
  from anon, authenticated, service_role;

grant select                         on public.admins       to authenticated;
grant select, insert, update, delete on public.docs         to authenticated;
grant select, insert, update, delete on public.portal       to authenticated;
grant select, insert, update, delete on public.agenda       to authenticated;
grant select, insert, update, delete on public.pedidos      to authenticated;
grant select, insert, update, delete on public.atualizacoes to authenticated;

grant select, insert, update, delete on public.admins, public.docs, public.social_privado to service_role;

-- 4. RLS e regras de acesso ---------------------------------------------------------------

alter table public.admins         enable row level security;
alter table public.docs           enable row level security;
alter table public.portal         enable row level security;
alter table public.agenda         enable row level security;
alter table public.pedidos        enable row level security;
alter table public.atualizacoes   enable row level security;
alter table public.social_privado enable row level security;  -- sem regras: só o service_role

drop policy if exists "gestor vê a sua entrada" on public.admins;
create policy "gestor vê a sua entrada" on public.admins
  for select to authenticated
  using (lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), '')));

drop policy if exists "gestor tudo em docs" on public.docs;
create policy "gestor tudo em docs" on public.docs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "gestor tudo em portal" on public.portal;
create policy "gestor tudo em portal" on public.portal
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "cliente lê o seu portal" on public.portal;
create policy "cliente lê o seu portal" on public.portal
  for select to authenticated
  using (email is not null and lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), '')));

drop policy if exists "gestor escreve a agenda" on public.agenda;
create policy "gestor escreve a agenda" on public.agenda
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "todos leem a agenda" on public.agenda;
create policy "todos leem a agenda" on public.agenda
  for select to authenticated using (true);

drop policy if exists "gestor tudo nos pedidos" on public.pedidos;
create policy "gestor tudo nos pedidos" on public.pedidos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "cliente vê os seus pedidos" on public.pedidos;
create policy "cliente vê os seus pedidos" on public.pedidos
  for select to authenticated
  using (lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), '')));

drop policy if exists "cliente anula pedidos pendentes" on public.pedidos;
create policy "cliente anula pedidos pendentes" on public.pedidos
  for delete to authenticated
  using (lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), '')) and estado = 'pendente');

drop policy if exists "cliente cria pedidos" on public.pedidos;
create policy "cliente cria pedidos" on public.pedidos
  for insert to authenticated
  with check (
    lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
    and estado = 'pendente'
    and resposta is null
    and servico_id is null
    and (dados ->> 'd')::date > current_date
    and exists (select 1 from public.portal p
                where p.cliente_id = pedidos.cliente_id
                  and lower(p.email) = lower(coalesce(((select auth.jwt()) ->> 'email'), '')))
    and (select count(*) from public.pedidos x
         where lower(x.email) = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
           and x.estado = 'pendente') < 3
  );

drop policy if exists "gestor tudo nas atualizacoes" on public.atualizacoes;
create policy "gestor tudo nas atualizacoes" on public.atualizacoes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 5. Fotografias (armazenamento privado) -----------------------------------------------

insert into storage.buckets (id, name, public) values ('fotos', 'fotos', false)
  on conflict (id) do nothing;

drop policy if exists "gestor tudo nas fotos" on storage.objects;
create policy "gestor tudo nas fotos" on storage.objects
  for all to authenticated
  using (bucket_id = 'fotos' and public.is_admin())
  with check (bucket_id = 'fotos' and public.is_admin());

drop policy if exists "cliente vê as suas fotos" on storage.objects;
create policy "cliente vê as suas fotos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'fotos'
    and name in (
      select jsonb_array_elements_text(s.value -> 'fotos')
      from public.portal p, jsonb_array_elements(p.dados -> 'servicos') s
      where p.email is not null and lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- 6. Tempo real --------------------------------------------------------------------------

do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.pedidos;
exception when duplicate_object then null; end $$;
