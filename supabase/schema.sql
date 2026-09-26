-- Mr Clean Wolf — estrutura da base de dados (Supabase / PostgreSQL)
-- Executar uma vez no Supabase: SQL Editor → New query → colar tudo → Run.

-- 1. Gestores com acesso total (substitua pelo seu e-mail)
create table if not exists public.admins (
  email text primary key
);
insert into public.admins (email) values ('o-seu-email@exemplo.pt')
  on conflict do nothing;

-- 2. Dados da app de gestão (mesma organização da versão atual: coleção/ano → registos)
create table if not exists public.docs (
  path       text primary key,          -- ex.: 'servicos/2026', 'clientes/todos', 'config/custos'
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- 3. Área de cliente: um resumo por cliente, gerado pela app de gestão
create table if not exists public.portal (
  cliente_id text primary key,
  email      text,                      -- e-mail com que o cliente entra
  nome       text not null,
  dados      jsonb not null,            -- viaturas e diário de serviços visíveis ao cliente
  updated_at timestamptz not null default now()
);
create index if not exists portal_email_idx on public.portal (lower(email));

-- 4. Função auxiliar: o utilizador autenticado é gestor?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 5. Permissões de acesso às tabelas (as regras abaixo limitam cada utilizador ao que lhe cabe)
grant usage on schema public to authenticated;
grant select on public.admins to authenticated;
grant select, insert, update, delete on public.docs   to authenticated;
grant select, insert, update, delete on public.portal to authenticated;

-- 6. Regras de acesso (Row Level Security)
alter table public.admins enable row level security;
alter table public.docs   enable row level security;
alter table public.portal enable row level security;

drop policy if exists "gestor vê a sua entrada" on public.admins;
create policy "gestor vê a sua entrada" on public.admins
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "gestor tudo em docs" on public.docs;
create policy "gestor tudo em docs" on public.docs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "gestor tudo em portal" on public.portal;
create policy "gestor tudo em portal" on public.portal
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "cliente lê o seu portal" on public.portal;
create policy "cliente lê o seu portal" on public.portal
  for select to authenticated
  using (email is not null and lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- 7. Fotografias (armazenamento privado)
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', false)
  on conflict (id) do nothing;

drop policy if exists "gestor tudo nas fotos" on storage.objects;
create policy "gestor tudo nas fotos" on storage.objects
  for all to authenticated
  using (bucket_id = 'fotos' and public.is_admin())
  with check (bucket_id = 'fotos' and public.is_admin());

-- o cliente só vê as fotografias que constam do seu diário (serviços marcados como visíveis)
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

-- 8. Atualizações em tempo real na app de gestão
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;
