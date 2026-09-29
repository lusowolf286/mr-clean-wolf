-- Mr Clean Wolf — otimização das regras de acesso (29/09/2026)
-- Recomendação do Supabase (lint 0003 auth_rls_initplan): (select auth.jwt()) é calculado uma vez por consulta,
-- em vez de uma vez por linha. O resultado das regras é exatamente o mesmo.

alter policy "gestor vê a sua entrada" on public.admins
  using (lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), '')));

alter policy "cliente lê o seu portal" on public.portal
  using (email is not null and lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), '')));

alter policy "cliente vê os seus pedidos" on public.pedidos
  using (lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), '')));

alter policy "cliente anula pedidos pendentes" on public.pedidos
  using (lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), '')) and estado = 'pendente');

alter policy "cliente cria pedidos" on public.pedidos
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
