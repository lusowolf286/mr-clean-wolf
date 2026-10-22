# Migrações da base de dados (Supabase)

Esta pasta é a fonte de verdade do esquema da base de dados. Um projeto novo, uma *preview branch* ou um `supabase db reset` recriam a base de dados aplicando estes ficheiros por ordem.

| Versão | Ficheiro | Estado em produção |
|---|---|---|
| 20260926000000 | `baseline.sql` | Esquema já existente; registada no histórico a 22/10/2026 (sem executar) |
| 20260929033109 | `otimizacao_rls_auth_initplan.sql` | Aplicada a 29/09/2026 |
| 20261022193000 | `pg_net_esquema_extensions.sql` | Aplicada a 22/10/2026 |

## Regras (E4.5)

- Cada tabela nova em `public` é criada **numa migração** que inclui `create table`, `enable row level security`, as regras de acesso e os `GRANT` explícitos. Modelo: [`../modelos/nova_tabela.sql`](../modelos/nova_tabela.sql).
- O papel `anon` não recebe acesso a tabelas, salvo conteúdo público.
- Nada de alterações de esquema só no editor SQL do painel: se for preciso, transformar logo em migração.

## Registar a migração de base no histórico de produção

O esquema de produção já existe, por isso a migração de base **não deve ser executada** em produção; só registada. Feito a 22/10/2026 (não repetir):

```sh
supabase link --project-ref nsivezaolaugdrwojfun
supabase migration repair --status applied 20260926000000
```

## Ficheiros antigos

Os ficheiros `supabase/*.sql` fora desta pasta são os scripts originais, executados manualmente no editor SQL. Ficam como histórico; o seu conteúdo está consolidado em `baseline.sql`. Exceções: `social.sql` (tarefa diária `mcw-social-sync`, configuração do ambiente) e `notificacoes.sql` (não aplicado em produção).
