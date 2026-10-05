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
- R2.1/R5.1: uma só ação principal na entrada («Marcar pelo WhatsApp»); o resto em contorno.
- R2.2/R4.2: produtos em 4 grupos; acessórios (21) divididos em 4 subgrupos com título.
- R4.3: telefone mostrado como `+351 296 486 681`.
- E1.3: calculadora de diluição com teclado decimal e Enter a fechar o teclado; E3.5 mensagem de erro em linguagem corrente.
- E2.1/E2.2/E2.4: margens seguras, testado a 375 × 667 e 1280 × 800 sem deslocamento horizontal; toques ≥ 44 px.

**05/10/2026 — arquivo de clientes (gestão)**
- R2.3: «Arquivar» / «Repor» na ficha do cliente; o filtro «Ativos · Arquivados» só aparece quando há clientes arquivados. Arquivar não apaga nada (serviços, faturas e área de cliente mantêm-se) e é reversível.
- R2.2: clientes arquivados saem da lista e das sugestões de nome ao marcar um serviço; marcar um serviço para um cliente arquivado repõe-o automaticamente.
- R1.5/R2.1: rodapé da ficha com 3 botões (Arquivar · Editar · Fechar), numa só linha a 375 px (E2.2).
- Exportação de clientes (.csv) com a coluna «Arquivado». Cache `cw-gestao-v16`; compilação iOS 3.
- R1.4/R2.4: «Ordenar» na lista de clientes com lista nativa de 6 opções (nome, n.º de cliente, atividade mais recente, mais faturado, mais serviços, mais tempo sem serviço); por defeito alfabética e a escolha fica guardada no aparelho. Cache `cw-gestao-v17`.

## 4. Última auditoria (E4/E5) — 29/09/2026
- Supabase (conector): RLS ativo em todas as tabelas; nada legível sem sessão; um cliente só vê os seus dados (testado). Avisos de funções *SECURITY DEFINER* e de `social_privado` sem regras são intencionais. 5 regras de acesso otimizadas com `(select auth.jwt())` — `supabase/otimizacao_rls.sql`, aplicado a 29/09/2026.
- E4: sem segredos no código. `config.js` tem apenas a chave *publishable* (acesso controlado por RLS); tokens de Meta, YouTube e TikTok e a chave *secret* estão nos segredos da *Edge Function* `social-sync`.
- E5: permissões com justificação em português (câmara, fotografias, calendário, Face ID); política de privacidade acessível. Pendentes: a área de cliente cria contas — se um dia for publicada na App Store, tem de permitir apagar a conta dentro da app (E5.4); confirmar no Xcode que `PrivacyInfo.xcprivacy` aparece em *Build Phases → Copy Bundle Resources*.
