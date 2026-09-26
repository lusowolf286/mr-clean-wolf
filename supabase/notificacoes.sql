-- Mr Clean Wolf — notificação no telemóvel quando chega um pedido de marcação (via app ntfy)
-- Substitua TOPICO_PRIVADO pelo tópico secreto (não o publique no GitHub) e execute no SQL Editor.
create extension if not exists pg_net;

create or replace function public.notificar_pedido() returns trigger
language plpgsql security definer set search_path = public as $$
declare per text := case new.dados->>'periodo' when 'manha' then 'manhã' when 'tarde' then 'tarde' else 'período indiferente' end;
begin
  perform net.http_post(
    url  := 'https://ntfy.sh/',
    body := jsonb_build_object(
      'topic', 'TOPICO_PRIVADO',
      'title', 'Novo pedido de marcação',
      'message', 'Para ' || to_char((new.dados->>'d')::date, 'DD/MM/YYYY') || ', ' || per || '. Abra a app para aceitar ou recusar.',
      'tags', jsonb_build_array('calendar'),
      'priority', 4));
  return new;
end $$;

drop trigger if exists pedido_notificacao on public.pedidos;
create trigger pedido_notificacao after insert on public.pedidos
  for each row execute function public.notificar_pedido();
