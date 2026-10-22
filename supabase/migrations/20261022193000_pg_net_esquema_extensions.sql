-- E4.5 · Aviso de segurança «Extension in Public» (lint 0014): pg_net passa de public para extensions.
-- O pg_net não pode mudar de esquema com ALTER EXTENSION; o procedimento indicado pela Supabase
-- é desativar e voltar a ativar no esquema extensions. As funções continuam em net.* (a tarefa
-- mcw-social-sync chama net.http_post e não muda) e o event trigger issue_pg_net_access da Supabase
-- repõe as permissões do esquema net. Perde-se só o registo de respostas antigas (net._http_response).
-- Aplicar fora das 05:15 UTC (hora da tarefa mcw-social-sync), com a fila net.http_request_queue vazia.

drop extension if exists pg_net;
create extension pg_net with schema extensions;
