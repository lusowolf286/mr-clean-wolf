# Mr Clean Wolf — instruções para o Claude

## 1. Regras obrigatórias
Todas as alterações seguem **[docs/REGRAS-DE-QUALIDADE.md](docs/REGRAS-DE-QUALIDADE.md)**: regras de ouro de UX (R1–R5: Jakob, Hick, proximidade, Miller, Von Restorff) e erros a evitar (E1–E5: teclado, margens seguras, estados sem rede/erro, chaves de API, regras da App Store/Google Play).
- Antes de publicar, percorrer a lista de verificação do documento.
- Citar o identificador da regra nos comentários e nas mensagens de *commit* (ex.: «R4.3»).
- Textos da interface em português europeu, formal.

## 2. Estrutura e cuidados
- Alojamento oficial: GitHub Pages (branch `main`), com os links curtos `app.mrcleanwolf.com` na Cloudflare. O projeto «mr-clean-wolf» no Vercel não é usado.
- `gestao/` app de gestão (PWA); `cliente/` área de cliente; `d/` atualização de dados por link; `shared/ios.js` teclado e iOS (incluir em todas as páginas com campos — E1).
- A app iOS (`ios-app/`) embute uma cópia de `gestao/`. Depois de alterar `gestao/`, `shared/` ou `config.js`, atualizar a cópia (`cd ios-app && npm run sync`) e aumentar `CURRENT_PROJECT_VERSION`.
- Ao alterar ficheiros servidos, aumentar a versão da cache em `gestao/sw.js` / `cliente/sw.js`.
- Só a chave pública (*publishable/anon*) do Supabase pode estar em `config.js`; segredos ficam nas *Edge Functions* (E4).
- Base de dados (E4.5): o esquema vive em `supabase/migrations/`. Desde 30/10/2026 a Supabase não dá acesso automático às tabelas novas em `public`, por isso cada tabela nova é criada numa migração que inclui, no mesmo ficheiro, `create table`, `enable row level security`, as regras de acesso e os `GRANT` explícitos — partir de `supabase/modelos/nova_tabela.sql`. O `anon` não recebe acesso a tabelas (só conteúdo público); o `service_role` só onde uma *Edge Function* precisa. Não alterar o esquema só no editor SQL do painel.
- `site/` é o site público www.mrcleanwolf.com (substitui o Carrd). Publicado pela Cloudflare Pages (projeto `mrcleanwolf-site`, pasta de saída `site`, sem compilação): cada *push* para `main` atualiza o site. Uma só página, sem dependências além das fontes Google.

## 3. Registo de aplicação das regras
**28/09/2026 — versão 1**
- R2.3/R4.2: os 13 destinos da gestão agrupados em 5 blocos com título (menu lateral e «Mais»).
- R4.1/R3.1: ficha de serviço dividida em 5 secções numeradas (Marcação, Cliente e viatura, Serviços, Preço, Notas e fotografias).
- R3.2/R2.1: «Adicionar ao calendário» junto da data e «Orçamento PDF» junto do preço; rodapé só com Apagar · Cancelar · Guardar.
- R3.4: «Mostrar ao cliente» dentro da secção de notas e fotografias.
- R1.5/R5.1: nas faturas a emitir, a ação principal («Marcar emitida») passa para primeiro lugar, como nos outros cartões.
- R4.3: telemóvel e NIF mostrados em grupos de 3 algarismos (os valores guardados não mudam).
- R4.1: pedido de marcação na área de cliente em 4 passos numerados.
- E1.2: com o teclado aberto, os botões da folha continuam visíveis (antes ficavam escondidos).
- E3.1–E3.4: «Tentar de novo» sem ligação (gestão, área de cliente, link de dados), aviso quando o carregamento demora mais de 15 s, e repetição de gravações falhadas com os mesmos dados.
- E5.2/E5.6: manifesto de privacidade `PrivacyInfo.xcprivacy` na app iOS; compilação 2.
- Ícones dentro de botões com tamanho definido (antes podiam aparecer desproporcionados).

**29/09/2026 — site público (`site/`)**
- R2.1/R5.1: uma só ação principal na entrada («Marcar por e-mail» desde 21/10/2026; antes «Marcar pelo WhatsApp»); o resto em contorno.
- R2.2/R4.2: produtos em 4 grupos; acessórios (21) divididos em 4 subgrupos com título.
- E1.3: calculadora de diluição com teclado decimal e Enter a fechar o teclado; E3.5 mensagem de erro em linguagem corrente.
- E2.1/E2.2/E2.4: margens seguras, testado a 375 × 667 e 1280 × 800 sem deslocamento horizontal; toques ≥ 44 px.

**05/10/2026 — arquivo de clientes (gestão)**
- R2.3: «Arquivar» / «Repor» na ficha do cliente; o filtro «Ativos · Arquivados» só aparece quando há clientes arquivados. Arquivar não apaga nada (serviços, faturas e área de cliente mantêm-se) e é reversível.
- R2.2: clientes arquivados saem da lista e das sugestões de nome ao marcar um serviço; marcar um serviço para um cliente arquivado repõe-o automaticamente.
- R1.5/R2.1: rodapé da ficha com 3 botões (Arquivar · Editar · Fechar), numa só linha a 375 px (E2.2).
- Exportação de clientes (.csv) com a coluna «Arquivado». Cache `cw-gestao-v16`; compilação iOS 3.
- R1.4/R2.4: «Ordenar» na lista de clientes com lista nativa de 6 opções (nome, n.º de cliente, atividade mais recente, mais faturado, mais serviços, mais tempo sem serviço); por defeito alfabética e a escolha fica guardada no aparelho. Cache `cw-gestao-v17`.

**20/10/2026 — calendário do negócio (app iOS)**
- R1.4/R2.4: as marcações vão para o calendário escolhido pelo utilizador na lista nativa do iOS (pedido na primeira sincronização e guardado); mudar em «Exportar → Calendário do iPhone para as marcações». Marcações já sincronizadas mudam para o calendário escolhido na sincronização seguinte. Cache `cw-gestao-v19`; compilação iOS 4.
- R3.2: «Enviar ao cliente por SMS» junto da data, na secção 1 da ficha de serviço: SMS com a data e um link `www.mrcleanwolf.com/m#…` (página `site/m/`) que junta a marcação ao calendário do cliente (calendário do telemóvel ou Google Calendar, com lembrete na véspera). Os dados vão no próprio link; não vai nome, telefone nem preço. E3.5: link incompleto mostra mensagem em linguagem corrente.

**21/10/2026 — número errado retirado (site e `site/m/`)**
- O número +351 296 486 681 estava errado e foi retirado de todo o site, por decisão do dono: botão do cabeçalho, ações principais, lista de contactos, dados estruturados, página da marcação e notas do calendário. Não voltar a usá-lo.
- R2.1/R5.1: as duas ações principais passam a «Marcar por e-mail» (mrcleanwolfservices@gmail.com); o site fica sem telefone até o dono indicar outro.
- E2.2: verificado a 375 × 667 e 1280 × 800, sem deslocamento horizontal nem erros na consola.

**20/10/2026 — permissões explícitas na base de dados (aviso Supabase de 30/10/2026)**
- E4.5: migração de base `supabase/migrations/20260926000000_baseline.sql` com o esquema de produção (7 tabelas, funções, RLS, 13 regras de acesso, `GRANT` explícitos, fotografias e tempo real); permissões comparadas com produção e coincidentes. Registada no histórico de produção a 22/10/2026 com `supabase migration repair --status applied 20260926000000` (só o registo; o SQL não foi executado e o esquema não mudou).
- E4.5: `otimizacao_rls.sql` passa também a migração versionada (`20260929033109`), igual à registada em produção.
- E4.5: modelo `supabase/modelos/nova_tabela.sql` para tabelas novas.
- Produção não foi alterada: as tabelas existentes mantêm as permissões e o projeto já não dava permissões automáticas a tabelas novas criadas pelo `postgres`.

**22/10/2026 — passagem para o Claude Code (pendentes da secção 6 de `MIGRACAO-mr-clean-wolf.md`)**
- E4.5: migração de base registada no histórico de produção (`supabase migration repair`), sem executar SQL.
- E4.5: migração `20261022193000_pg_net_esquema_extensions.sql` (aviso «Extension in Public»): `pg_net` passa para o esquema `extensions`, como indica a Supabase (desativar e reativar; não muda de esquema com `ALTER`). Fila vazia e sem dependências verificadas; a tarefa `mcw-social-sync` usa `net.http_post` e não muda. Aplicada a 22/10/2026 com `supabase db push --linked`: `pg_net` 0.20.4 em `extensions`, permissões do esquema `net` iguais às anteriores, tarefa ativa e aviso de segurança resolvido.
- Proteção contra palavras-passe divulgadas: só existe no plano Pro da Supabase e as apps entram apenas com código de uso único por e-mail (`signInWithOtp`/`verifyOtp`), sem palavras-passe. Aviso aceite como não aplicável; rever se o plano mudar ou se forem usadas palavras-passe.
- E5.2: `privacidade.html` com e-mail de contacto, Cloudflare e Resend (envio dos códigos de acesso, SMTP próprio no Supabase) na lista de subcontratantes; data atualizada.
- E5.2: `PrivacyInfo.xcprivacy` confirmado dentro da app compilada (*Copy Bundle Resources*).
- README e `ios-app/README.md` com os endereços reais, o calendário escolhido pelo utilizador e a compilação de verificação.

**25/10/2026 — atualizar, produtos nas compras e leitura da folha raiz (gestão)**
- R1.1/E3.1: puxar para baixo atualiza a app (gesto próprio no contentor `.app`, porque a app iOS não tem o do navegador): lê a folha, volta a ler todos os dados, pedidos, atualizações de clientes e dashboard; aviso com o número de lançamentos novos. Sem ligação: «Tentar de novo». Não dispara com uma folha aberta nem a meio da lista. No computador, «Sincronizado · Atualizar» no menu lateral.
- E4: *Edge Function* `sheet-sync` (verificação própria: só `admins`) lê a folha «Mr. Clean Wolf Services» (abas «Compras» e «Banco», conta Principal A:C e Avença F:H) com uma conta de serviço Google só de leitura; chave só no segredo `GSHEET_SA_JSON`. Só acrescenta: marca de água por bloco em `config/sheet_sync`, sem duplicar registos iguais (mesma data e conta/loja, valor a menos de 1 €); linhas incompletas voltam a ser lidas até estarem completas. Registos importados com `origem:"folha"`.
- R4.1/R3: compra em 3 secções numeradas; «Produtos e montante» com uma linha por produto (Qtd. · Produto · Preço, total da linha quando a quantidade não é 1), montante = soma enquanto não for alterado à mão e aviso da diferença; E1.3: Enter avança e cria a linha seguinte. Lista mostra os produtos e a pesquisa encontra-os; CSV com a coluna «Produtos». Cache `cw-gestao-v20`; compilação iOS 5.
- 25/10/2026: conta de serviço `mcw-folha@mr-clean-wolf.iam.gserviceaccount.com` (Leitor da folha) e segredo `GSHEET_SA_JSON` configurados; primeira leitura feita no iPhone (compilação 5): 0 compras e 2 movimentos de 24/10/2026 (−222,11 € e 500 €), sem duplicados. Pendente, a pedido do dono: lançamento automático das faturas que chegam a hello@mrcleanwolf.com.

**26/10/2026 — faturas por e-mail**
- Grupo Google Workspace «Faturas Mr Clean Wolf» (faturas@apexwolfventures.com; também **faturas@mrcleanwolf.com**, domínio alias): externos podem enviar, sem moderação nem retenção por spam; membro único paulorenatosimasamaral@gmail.com.
- Tarefa agendada «Lançar faturas MCW do e-mail» (de hora a hora, na nuvem): lê as mensagens enviadas para essa morada (Gmail só leitura), cria a compra com os produtos linha a linha (`origem:"email"`) e o movimento «Compras» no banco, sem duplicar o que já exista (mesma data e valor a menos de 1 €; nesse caso só junta os produtos). Mensagens tratadas ficam em `config/faturas_email`. Faturas que não se leiam com segurança ficam «a rever».
- Primeira fatura tratada à mão: A Loja do Detalhe, encomenda FCPJPXPUJ, 24/10/2026, 222,11 € (6 produtos + portes) juntos à compra existente.
- Anexos PDF (26/10/2026): a tarefa lê-os pelo Zapier (Gmail «Get Attachment by Filename» → Google Drive «Upload File» para a pasta «Faturas MCW», id `1BYjGqK418Ix0tV6yudQdFkAow0aWeJ-C`); uma segunda cópia convertida em documento Google (OCR) dá o texto e vai para o lixo depois de lida. O link do PDF fica no campo `fatura_pdf` da compra. Testado com FR A/68775.
- R3.4/E4: na ficha da compra, secção 3, botão «Ver fatura (PDF)» quando há `fatura_pdf` (só links `https://drive.google.com/`; abre no navegador); na lista, etiqueta «PDF». Cache `cw-gestao-v21`; compilação iOS 6.

**31/10/2026 — correções da revisão cruzada (AI Hub, AI-004/AI-004-R)**
- MCW-04: gravações atómicas por documento anual (`mutate` em `shared/supa.js`, controlo otimista por `updated_at`, até 6 tentativas). A app e a `sheet-sync` deixam de sobrescrever alterações feitas entretanto noutro dispositivo; a `sheet-sync` só acrescenta registos. E3.5: conflito persistente dá mensagem clara e «Tentar de novo».
- MCW-01/C-01: o NIF identifica o cliente; o nome pode repetir-se. NIF repetido é recusado ao gravar a ficha. Serviços gravados com `cliId` (identificador da ficha); com nome repetido, a ficha do serviço pede a escolha pelo NIF (R3: logo abaixo do nome). Serviços antigos sem `cliId` são ligados automaticamente quando o nome é de um só cliente; os ambíguos não aparecem em nenhuma área de cliente até serem escolhidos. Estatísticas e painel contam por ficha; homónimos mostram o NIF. Mudar o nome do cliente atualiza os serviços.
- MCW-02: apagar um cliente retira também o resumo da área de cliente (`portal`).
- MCW-03: sem sessão e sem rede, a gestão não abre a cópia local (E3.2: «Tentar de novo»); a cópia local é apagada ao terminar sessão.
- MCW-05/C-03: remover uma fotografia só a apaga depois de gravar; fotografias carregadas numa edição cancelada são apagadas ao fechar; apagar o serviço ou a compra apaga as suas fotografias.
- MCW-06: editar ou apagar uma compra (ou um serviço pago) atualiza ou apaga o movimento do banco ligado (`ref`), se este não tiver sido alterado à mão; caso contrário, aviso para rever.
- MCW-07/MCW-08/C-02 (`sheet-sync`): linhas vazias atrás da marca de água ficam pendentes e voltam a ser lidas; só é duplicado o mesmo valor ao cêntimo na mesma data e loja/conta (nomes de loja contidos um no outro contam como a mesma); valores próximos ou mesmo valor noutra loja entram com «A rever» (R5.1: etiqueta na lista; desaparece ao gravar a ficha).
- MCW-09/E3.3: «Atualizar» só diz «Atualizado» quando os dados vieram do servidor; caso contrário, «a mostrar a última informação guardada».
- MCW-10: exportação CSV neutraliza texto começado por `=`, `+`, `-`, `@`.
- E4.5/MCW-04: migração `20261031230000_docs_updated_at_automatico.sql` — gatilho que atualiza `docs.updated_at` em cada gravação, para o controlo otimista detetar também escritores externos. Sem tabelas novas nem alterações de permissões.
- Cache `cw-gestao-v22`; compilação iOS 7. Produção a 31/10/2026: integrado em `main` (GitHub Pages publicado); migração `20261031230000` aplicada e registada no histórico (gatilho ativo em `docs`); `sheet-sync` publicada (versão 3, `verify_jwt` desligado como antes — verificação própria de `admins`; sem sessão responde 403). Dados verificados antes: 52 clientes sem nomes nem NIF repetidos; 247 de 252 serviços ligados à ficha automaticamente na primeira abertura (5 sem ficha correspondente, como antes). Avisos de segurança do Supabase sem novidades. App iOS: compilação 7 feita no Xcode a 31/10/2026 a partir de `main` (sem erros; 2 avisos da biblioteca Capacitor, `WKProcessPool` obsoleto) e instalada no iPhone. As alterações locais não aprovadas do Codex de 26/10/2026 que estavam na cópia do Mac ficaram guardadas em `git stash` (não foram incluídas).
- 31/10/2026 (C-02/MCW-04): tarefa agendada «Lançar faturas MCW do e-mail» atualizada com a mesma regra da app — só é a mesma compra/movimento com valor igual ao cêntimo, data até 3 dias e mesma loja (nomes contidos um no outro contam como a mesma); parecidos (diferença < 1 € ou mesmo valor noutra loja) são lançados com `rever:true` e nota «A rever: …». Cada gravação é um único `UPDATE` com `jsonb_set` sobre o item (nunca o documento inteiro); `updated_at` fica a cargo do gatilho.

**02/11/2026 — reservas da validação independente (AI Hub, AI-009-R)**
- MCW-01: o NIF também é verificado ao aplicar os dados enviados pelo cliente no link de atualização (`atualAplicar`); um NIF que pertença a outra ficha não é aplicado (E3.5: mensagem com o cliente em causa).
- C-03: uma fotografia cujo carregamento termina depois de a ficha fechar (gravada ou cancelada) é apagada, porque já não entra no registo.
- MCW-04/sheet-sync: cada linha importada tem um identificador fixo (bloco, linha e conteúdo); duas leituras simultâneas da folha gravam o registo uma só vez, e um registo já existente nunca é substituído.
- MCW-06: o movimento do banco ligado só é atualizado automaticamente se mantiver o valor e a data com que foi criado.
- Cache `cw-gestao-v23`; compilação iOS 8. Depois da integração: publicar de novo a `sheet-sync` e compilar a versão 8.

## 4. Última auditoria (E4/E5) — 29/09/2026
- 20/10/2026, avisos de segurança do Supabase: além dos intencionais (funções *SECURITY DEFINER* do link de dados e `is_admin`; `social_privado` sem regras), havia dois pendentes de decisão, resolvidos a 22/10/2026 — extensão `pg_net` movida para `extensions`; proteção contra palavras-passe divulgadas aceite como não aplicável (plano gratuito, entrada só por código).
- 31/10/2026 (E4): política de palavras-passe reforçada por precaução (mínimo 8 caracteres, letras e algarismos — *Authentication → Email*); não afeta a entrada por código. Tarefa agendada semanal «Vigilância de fugas de palavras-passe» (segundas, 08:52): alertas de fuga no Gmail, abusos de `/otp`, `/verify`, `/token` nos registos de autenticação e avisos de segurança novos.
- Supabase (conector): RLS ativo em todas as tabelas; nada legível sem sessão; um cliente só vê os seus dados (testado). Avisos de funções *SECURITY DEFINER* e de `social_privado` sem regras são intencionais. 5 regras de acesso otimizadas com `(select auth.jwt())` — `supabase/otimizacao_rls.sql`, aplicado a 29/09/2026.
- E4: sem segredos no código. `config.js` tem apenas a chave *publishable* (acesso controlado por RLS); tokens de Meta, YouTube e TikTok e a chave *secret* estão nos segredos da *Edge Function* `social-sync`.
- E5: permissões com justificação em português (câmara, fotografias, calendário, Face ID); política de privacidade acessível. Pendentes: a área de cliente cria contas — se um dia for publicada na App Store, tem de permitir apagar a conta dentro da app (E5.4); confirmar no Xcode que `PrivacyInfo.xcprivacy` aparece em *Build Phases → Copy Bundle Resources*.
