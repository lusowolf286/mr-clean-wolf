-- Mr Clean Wolf — pedidos de marcação e dias disponíveis
-- Executar uma vez no Supabase: SQL Editor → New query → colar tudo → Run.

-- 1. Dias disponíveis (definidos pelo gestor, lidos pela área de cliente). Não contém dados pessoais.
create table if not exists public.agenda (
  id         text primary key,          -- 'config'
  dados      jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2. Pedidos de marcação feitos pelos clientes
create table if not exists public.pedidos (
  id         uuid primary key default gen_random_uuid(),
  cliente_id text not null,
  email      text not null,
  nome       text,
  dados      jsonb not null,            -- d (data), periodo, sv, servicos, viatura, matricula, notas
  estado     text not null default 'pendente' check (estado in ('pendente','aceite','recusado')),
  resposta   text,
  servico_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pedidos_email_idx on public.pedidos (lower(email));

grant select, insert, update, delete on public.agenda  to authenticated;
grant select, insert, update, delete on public.pedidos to authenticated;

alter table public.agenda  enable row level security;
alter table public.pedidos enable row level security;

-- 3. Regras: agenda
drop policy if exists "todos leem a agenda" on public.agenda;
create policy "todos leem a agenda" on public.agenda for select to authenticated using (true);
drop policy if exists "gestor escreve a agenda" on public.agenda;
create policy "gestor escreve a agenda" on public.agenda for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 4. Regras: pedidos
drop policy if exists "gestor tudo nos pedidos" on public.pedidos;
create policy "gestor tudo nos pedidos" on public.pedidos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "cliente vê os seus pedidos" on public.pedidos;
create policy "cliente vê os seus pedidos" on public.pedidos for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- o cliente só cria pedidos em seu nome, para a sua ficha, com data futura e no máximo 3 pendentes
drop policy if exists "cliente cria pedidos" on public.pedidos;
create policy "cliente cria pedidos" on public.pedidos for insert to authenticated
  with check (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and estado = 'pendente' and resposta is null and servico_id is null
    and (dados ->> 'd')::date > current_date
    and exists (select 1 from public.portal p where p.cliente_id = pedidos.cliente_id and lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    and (select count(*) from public.pedidos x where lower(x.email) = lower(coalesce(auth.jwt() ->> 'email', '')) and x.estado = 'pendente') < 3
  );

-- o cliente pode anular um pedido ainda pendente
drop policy if exists "cliente anula pedidos pendentes" on public.pedidos;
create policy "cliente anula pedidos pendentes" on public.pedidos for delete to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and estado = 'pendente');

-- 5. Novos pedidos aparecem de imediato na app de gestão
do $$ begin
  alter publication supabase_realtime add table public.pedidos;
exception when duplicate_object then null; end $$;
