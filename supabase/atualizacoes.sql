-- Mr Clean Wolf — pedidos de atualização de dados (e-mail, telefone, morada, NIF)
-- Executar uma vez no Supabase: SQL Editor → New query → colar tudo → Run.
-- O cliente responde por um link com código único, sem precisar de conta.

create table if not exists public.atualizacoes (
  id           uuid primary key default gen_random_uuid(),
  token        text not null unique,
  cliente_id   text not null,
  nome         text,
  estado       text not null default 'enviado' check (estado in ('enviado','respondido','aplicado','descartado')),
  dados        jsonb,
  created_at   timestamptz not null default now(),
  respondido_at timestamptz,
  expires_at   timestamptz not null default now() + interval '30 days'
);

grant select, insert, update, delete on public.atualizacoes to authenticated;
alter table public.atualizacoes enable row level security;

drop policy if exists "gestor tudo nas atualizacoes" on public.atualizacoes;
create policy "gestor tudo nas atualizacoes" on public.atualizacoes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Leitura pública mínima: só o primeiro nome e se o link ainda é válido
create or replace function public.atualizacao_info(p_token text) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when a.id is null then jsonb_build_object('valido', false)
    else jsonb_build_object('valido', a.estado = 'enviado' and a.expires_at > now(),
                            'estado', a.estado, 'nome', split_part(coalesce(a.nome,''), ' ', 1)) end
  from (select 1) x left join public.atualizacoes a on a.token = p_token;
$$;

-- Resposta do cliente: só uma vez, dentro do prazo, com campos limitados
create or replace function public.atualizacao_responder(p_token text, p_dados jsonb) returns boolean
language plpgsql security definer set search_path = public as $$
declare d jsonb;
begin
  d := jsonb_strip_nulls(jsonb_build_object(
    'email',  nullif(left(trim(p_dados->>'email'), 120), ''),
    'tel',    nullif(left(trim(p_dados->>'tel'), 30), ''),
    'morada', nullif(left(trim(p_dados->>'morada'), 300), ''),
    'nif',    nullif(left(regexp_replace(coalesce(p_dados->>'nif',''), '\D', '', 'g'), 9), '')));
  if d = '{}'::jsonb then return false; end if;
  update public.atualizacoes set dados = d, estado = 'respondido', respondido_at = now()
   where token = p_token and estado = 'enviado' and expires_at > now();
  return found;
end $$;

revoke all on function public.atualizacao_info(text) from public;
revoke all on function public.atualizacao_responder(text, jsonb) from public;
grant execute on function public.atualizacao_info(text) to anon, authenticated;
grant execute on function public.atualizacao_responder(text, jsonb) to anon, authenticated;
