-- MCW-04 (revisão AI-004): updated_at da tabela docs passa a ser atualizado pela base de dados em cada alteração.
-- A app de gestão e a Edge Function sheet-sync gravam com controlo otimista (só gravam se updated_at não mudou desde a
-- leitura). Com este gatilho, qualquer escritor — incluindo tarefas externas que não indiquem updated_at — muda o valor,
-- e uma gravação concorrente é detetada em vez de ser sobrescrita.
-- Não cria tabelas nem altera permissões (E4.5 não se aplica).

create or replace function public.docs_tocar_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists docs_tocar_updated_at on public.docs;
create trigger docs_tocar_updated_at
  before insert or update on public.docs
  for each row execute function public.docs_tocar_updated_at();
