# Mr Clean Wolf — instruções para o Claude

## 1. Regras obrigatórias
Todas as alterações seguem **[docs/REGRAS-DE-QUALIDADE.md](docs/REGRAS-DE-QUALIDADE.md)**: regras de ouro de UX (R1–R5: Jakob, Hick, proximidade, Miller, Von Restorff) e erros a evitar (E1–E5: teclado, margens seguras, estados sem rede/erro, chaves de API, regras da App Store/Google Play).
- Antes de publicar, percorrer a lista de verificação do documento.
- Citar o identificador da regra nos comentários e nas mensagens de *commit* (ex.: «R4.3»).
- Textos da interface em português europeu, formal.

## 2. Estrutura e cuidados
- `gestao/` app de gestão (PWA); `cliente/` área de cliente; `d/` atualização de dados por link; `shared/ios.js` teclado e iOS (incluir em todas as páginas com campos — E1).
- A app iOS (`ios-app/`) embute uma cópia de `gestao/`. Depois de alterar `gestao/`, `shared/` ou `config.js`, atualizar a cópia (`cd ios-app && npm run sync`) e aumentar `CURRENT_PROJECT_VERSION`.
- Ao alterar ficheiros servidos, aumentar a versão da cache em `gestao/sw.js` / `cliente/sw.js`.
- Só a chave pública (*publishable/anon*) do Supabase pode estar em `config.js`; segredos ficam nas *Edge Functions* (E4).

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

## 4. Última auditoria (E4/E5) — 28/09/2026
- E4: sem segredos no código. `config.js` tem apenas a chave *publishable* (acesso controlado por RLS); tokens de Meta, YouTube e TikTok e a chave *secret* estão nos segredos da *Edge Function* `social-sync`.
- E5: permissões com justificação em português (câmara, fotografias, calendário, Face ID); política de privacidade acessível. Pendentes: a área de cliente cria contas — se um dia for publicada na App Store, tem de permitir apagar a conta dentro da app (E5.4); confirmar no Xcode que `PrivacyInfo.xcprivacy` aparece em *Build Phases → Copy Bundle Resources*.
