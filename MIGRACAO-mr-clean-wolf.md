# Mr Clean Wolf — passagem para o Claude Code

> Documento de arranque. Ler integralmente antes da primeira alteração. Complementa (não substitui) o `CLAUDE.md` e o `docs/REGRAS-DE-QUALIDADE.md` do repositório.
> Levantamento feito a 20/10/2026, sobre o último *commit* `557560d` («Gestão: cache v19»).

## 1. O que é

Sistema de gestão do negócio de detalhe automóvel **Mr. Clean Wolf Services** (marca da Apex Wolf Ventures), explorado em nome de Paulo Renato Simas Amaral, Estrada Regional 15, 9630-103 Lomba da Fazenda, Nordeste, São Miguel. O repositório tem seis peças. **Passam para o Claude Code as peças 1.1 a 1.4 e 1.6. O site público (1.5) fica fora da migração e não deve ser alterado nas sessões do Claude Code.** Exceção a ter presente: a página `site/m/` é usada pela gestão, através da mensagem SMS de marcação, e não pode ser apagada nem mudada de endereço.

| N.º | Peça | Pasta | Utilizador | Publicação |
|---|---|---|---|---|
| 1.1 | App de gestão (PWA, iPad e iPhone) | `gestao/` | Só o gestor (e-mails na tabela `admins`) | GitHub Pages |
| 1.2 | Área de cliente (PWA separada) | `cliente/` | Cada cliente, com código de 6 dígitos por e-mail | GitHub Pages · link curto `app.mrcleanwolf.com/c` |
| 1.3 | Atualização de dados por link único (enviado por SMS) | `d/` | Cliente | GitHub Pages · link curto `app.mrcleanwolf.com/d#…` |
| 1.4 | App iOS nativa «Clean Wolf» (Capacitor, embute cópia de `gestao/`) | `ios-app/` | Gestor | Xcode, Apple ID gratuito |
| 1.5 | *(fora da migração)* Site público www.mrcleanwolf.com + página `site/m/` (marcação → calendário do cliente) | `site/` | Público | Cloudflare Pages, projeto `mrcleanwolf-site` |
| 1.6 | Recolha diária das redes sociais (Instagram, Facebook, YouTube, TikTok) para o *dashboard* | `supabase/functions/social-sync`, `social/` | Servidor | *Edge Function* Supabase |

## 2. Repositório e ambiente local

- GitHub: `lusowolf286/mr-clean-wolf` — **público** (exigência do GitHub Pages gratuito; não contém dados de clientes). Ramo único `main`.
- No Mac «lusoWOLF»: clonar para `~/Developer/mr-clean-wolf` (confirmar se já existe uma cópia local e se tem alterações por enviar antes de clonar de novo).
- Stack: HTML/CSS/JS sem compilação nas PWA e no site; Capacitor + Swift na app iOS (`npm install && npm run sync` em `ios-app/`).
- Xcode: foi usado o **Xcode-beta**. Equipa de assinatura `HSVTNKP7TG` (Personal Team).

## 3. Infraestrutura e identificadores

| Serviço | Dados |
|---|---|
| Supabase | Projeto `nsivezaolaugdrwojfun`, região Frankfurt, plano gratuito (pausa ao fim de 7 dias sem uso) |
| Tabelas `public` | `admins`, `docs`, `portal`, `agenda`, `pedidos`, `atualizacoes`, `social_privado` — RLS ativo em todas |
| SQL no repositório | `schema.sql`, `marcacoes.sql`, `atualizacoes.sql`, `notificacoes.sql`, `social.sql`, `otimizacao_rls.sql` (aplicado a 29/09/2026) |
| Segredos | Tokens Meta/YouTube/TikTok e chave *secret* **só** nos segredos da *Edge Function* `social-sync` (E4.1, E4.3). `config.js` tem apenas a chave *publishable* |
| Cloudflare | Conta `4225e52ad761479a67677fa2c354ecc3`; DNS de `mrcleanwolf.com`; redirecionamentos `app.mrcleanwolf.com/c` e `/d` (usados pelas apps) |
| App iOS | Bundle `pt.mrcleanwolf.gestao`, nome «Clean Wolf», versão 1.0 (compilação 4) |
| Caches PWA | `cw-gestao-v19` em `gestao/sw.js`; ver também `cliente/sw.js` |
| Vercel | Projeto «mr-clean-wolf» **não é usado** (por apagar manualmente no painel) |

## 4. Regras de trabalho específicas (além do `CLAUDE.md`)

- **4.1** Alterar `gestao/`, `shared/` ou `config.js` ⇒ subir a versão da cache em `sw.js`, correr `cd ios-app && npm run sync` e aumentar `CURRENT_PROJECT_VERSION`. Depois do *sync*, repor ficheiros de configuração do Capacitor que a cópia automática altere (ver *commit* `c0c9fde`).
- **4.2** `shared/ios.js` em todas as páginas com campos (teclado do iPhone, incluindo SwiftKey — E1).
- **4.3** Política do negócio: sem mensagens diretas com clientes dentro da app; as faturas são emitidas em software certificado pela AT, fora da app (a app só regista «faturas a emitir»).
- **4.4** Regras de preço já fixadas pelo dono: mão de obra 10 €/h; um carro completo nunca passa de 3 horas, seja qual for o tamanho; revestimentos cerâmicos, DLUX e consumíveis encomendados por pedido do cliente são cobrados ao custo, sem margem; a lavagem de manutenção é o chamariz (≈ 10 % de margem sobre a mão de obra basta). Descontos: «família» 10 %; «first customer» 15 % **permanente** para os clientes desde a abertura (não é desconto de primeiro serviço). Cerâmicos e ceras exigem descontaminação prévia.
- **4.5** Identidade: dourado e bronze (premium) com tons bordeaux (desportivo), palete antracite com textura, Syne/Manrope; logótipo lobo em traço com «MR» pequeno sobre «CLEAN WOLF» em negrito à direita.
- **4.6** Alterações à base de dados (E4.5): só por migrações em `supabase/migrations/`, partindo de `supabase/modelos/nova_tabela.sql` — cada tabela nova leva no mesmo ficheiro `create table`, RLS, regras de acesso e `GRANT` explícitos (desde 30/10/2026 a Supabase deixou de dar acesso automático). Nunca alterar o esquema só no editor SQL do painel; nunca a chave `service_role` no repositório.

## 5. Coisas que vivem fora do repositório

- **5.1** Artifacts antigos no claude.ai: «Clean Wolf Gestão» (versão inicial com base de dados partilhada do artifact), «Mr Clean Wolf — UI e logotipo», «Mr Clean Wolf — Logótipo e App». Considerar **obsoletos**; os dados passaram para o Supabase. As fotografias carregadas na versão do claude.ai não foram migradas.
- **5.2** Configuração do Supabase feita no painel: modelos de e-mail «Magic Link»/«Confirm signup» com `{{ .Token }}`, OTP de 6 dígitos, *Site URL*.
- **5.3** Tarefa agendada «Renovar apps no iPhone» (domingos 19:55, Açores) que reinstala esta app e o OnTarget via Xcode no Mac (Apple ID gratuito: expira ao fim de 7 dias).

## 6. Pendentes e pontos a confirmar

1. **Alterações do Supabase de 30/10/2026** — já feito a 20/10/2026 (*commit* `1b3db1c`): migração de base com o esquema de produção e `GRANT` explícitos, `otimizacao_rls.sql` versionada e modelo para tabelas novas; produção não foi alterada. Falta: registar a migração de base no histórico de produção (`supabase migration repair --status applied 20260926000000`, ver `supabase/migrations/README.md`) e decidir os dois avisos de segurança pendentes — extensão `pg_net` no esquema `public` e proteção contra palavras-passe divulgadas desligada (Auth).
2. O número `+351 296 486 681` estava errado e foi retirado a 21/10/2026 (*commit* `5e9dbef`); as marcações no site passaram a ser por e-mail. Não deve voltar a aparecer em nenhuma peça.
3. **E5.4** — a área de cliente cria contas; se for publicada na App Store, tem de permitir apagar a conta dentro da app.
4. Confirmar no Xcode que `PrivacyInfo.xcprivacy` está em *Build Phases → Copy Bundle Resources*.
5. Confirmar se o SMTP próprio (Brevo/Resend) está configurado no Supabase; sem ele, os códigos de acesso só chegam a membros da equipa do projeto.
6. Rever `privacidade.html` (o README referia campos por completar) antes de alargar o acesso a clientes.
7. Apagar o projeto Vercel não usado (o conector não tinha autorização de equipa).
8. Atualizar o `README.md`: ainda descreve endereços genéricos `<utilizador>.github.io` e o calendário «predefinido» do iPhone (agora é o calendário escolhido pelo utilizador).

## 7. Vantagens do Claude Code a aproveitar

- Corre no próprio Mac: `xcodebuild` e `xcrun devicectl` funcionam diretamente (já não é preciso automatizar o Xcode por cliques nem transferir *commits* por *bundle*). A renovação semanal pode passar a um script `ios-app/renovar.sh`.
- Supabase CLI local (`supabase start`) para testar migrações antes de as aplicar ao projeto remoto.
- Playwright para a matriz de testes das PWA (gestão, cliente, `d/`): 360 × 780, 375 × 667, 430 × 932, 820 × 1180 e 1440 × 900, claro e escuro (sem deslocamento horizontal, sem erros na consola, toques ≥ 44 px).

## 8. Primeira sessão — instrução sugerida

```
Lê CLAUDE.md, docs/REGRAS-DE-QUALIDADE.md e MIGRACAO-mr-clean-wolf.md antes de qualquer alteração.

1. Confirma que a cópia local está igual a origin/main. Se houver alterações locais ou commits por enviar, mostra-mos antes de fazer o que quer que seja.
2. Supabase (prazo 30/10/2026): segue supabase/migrations/README.md para registar a migração de base no histórico de produção (supabase migration repair --status applied 20260926000000). Mostra-me os comandos antes de os correr. Não alteres o esquema de produção.
3. Explica-me os dois avisos de segurança pendentes (pg_net no esquema public; proteção contra palavras-passe divulgadas) e propõe o que fazer em cada um, sem aplicar.
4. Confirma que a app iOS compila: cd ios-app && npm install && npm run sync, depois xcodebuild. Não instales no iPhone sem eu pedir.
5. Resume os restantes pendentes da secção 6 do ficheiro de migração, por prioridade.

Regras: não alteres a pasta site/ (fora da migração; a página site/m/ é usada pelos SMS e não pode mudar). O número 296 486 681 está errado e não pode voltar a aparecer. Nada é publicado sem o meu acordo. Cita as regras (R/E) nos commits. Textos em português europeu formal.
```
