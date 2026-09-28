# Regras de qualidade das apps — Apex Wolf Ventures

Documento de referência comum a todas as apps (Mr Clean Wolf, OnTarget/AfinaMira e projetos futuros). Qualquer ecrã, funcionalidade ou versão nova tem de cumprir estas regras antes de ser publicada.

As regras têm um identificador fixo para poderem ser citadas em revisões e mensagens de *commit*: **R** para as regras de ouro de UX (ex.: «R2.3») e **E** para os erros a evitar (ex.: «E4.1»).

**Versão 1 — 28/09/2026.** Parte A com as regras de ouro 1 a 5; Parte B com os erros 1 a 5. Novas regras acrescentam-se no fim de cada parte (A6, B6, …), sem renumerar as existentes.

---

## Parte A — Regras de ouro de UX

### A1. Lei de Jakob — seguir as convenções que o utilizador já conhece

**Princípio.** As pessoas passam a maior parte do tempo noutras apps; esperam que a nossa funcione da mesma maneira. Uma convenção conhecida não precisa de ser aprendida.

**Regras**
- **R1.1** Usar os padrões da plataforma: no iPhone, as *Human Interface Guidelines* da Apple (barra de separadores em baixo, «‹» para voltar em cima à esquerda, «×» ou «Fechar» em cima à direita, folhas que sobem de baixo); na web, os mesmos padrões nas PWA.
- **R1.2** Posição fixa das ações num formulário/folha: ação destrutiva (Apagar) à esquerda, isolada; «Cancelar» e a ação principal à direita, com a principal em último lugar.
- **R1.3** Palavras correntes nos botões («Guardar», «Cancelar», «Apagar», «Voltar»), sempre as mesmas para a mesma ação em todas as apps.
- **R1.4** Controlos nativos sempre que existam (teclado numérico, seletor de data, partilhar, calendário), em vez de réplicas próprias.
- **R1.5** Coerência interna: o mesmo tipo de ecrã tem o mesmo aspeto e as mesmas ações em todo o projeto.

**Verificação:** um utilizador que nunca viu a app consegue voltar atrás, cancelar e guardar sem ler nenhuma explicação.

### A2. Lei de Hick — menos opções, decisões mais rápidas

**Princípio.** O tempo para decidir cresce com o número e a complexidade das opções apresentadas ao mesmo tempo.

**Regras**
- **R2.1** Cada ecrã tem **uma** ação principal evidente; no máximo **3** ações visíveis no rodapé de uma folha.
- **R2.2** Opções raras ou avançadas ficam escondidas por defeito (divulgação progressiva: «Mais», secções que abrem, valores automáticos que se podem alterar).
- **R2.3** Listas de navegação com mais de 7 destinos são divididas em grupos com título (ver R4.2).
- **R2.4** Sugerir a opção recomendada ou mais provável já selecionada (valores por defeito sensatos), para que o caso normal seja só confirmar.
- **R2.5** Evitar perguntas encadeadas em ecrãs sucessivos quando as respostas cabem num único ecrã com poucas opções.

**Verificação:** contar as opções visíveis ao mesmo tempo em cada ecrã; se passarem de 7, agrupar ou esconder.

### A3. Lei da proximidade — o que está junto é lido como relacionado

**Princípio.** Elementos próximos são percebidos como um grupo; o espaço separa assuntos diferentes.

**Regras**
- **R3.1** Espaço **pequeno** dentro de um grupo (rótulo ↔ campo: 5–8 px/pt) e espaço **grande** entre grupos (≥ 2× o espaço interno; normalmente 20–28 px/pt).
- **R3.2** Cada ação fica junto daquilo em que atua (ex.: «Exportar para o calendário» ao lado da data; «Orçamento PDF» junto do preço).
- **R3.3** Texto de ajuda imediatamente abaixo do título ou do campo que explica, nunca no fim de um bloco que trata de outra coisa.
- **R3.4** Opções que alteram um bloco (ex.: «mostrar ao cliente») ficam dentro desse bloco.
- **R3.5** Não usar linhas ou caixas quando o espaço chega para separar; as caixas servem para agrupar, não para decorar.

**Verificação:** tapar os títulos; os grupos devem continuar a perceber-se só pelo espaçamento.

### A4. Lei de Miller — blocos pequenos para a memória de trabalho

**Princípio.** A memória de trabalho retém cerca de 7 (± 2) elementos. A informação é mais fácil de ler e de lembrar em blocos pequenos e com nome.

**Regras**
- **R4.1** Formulários longos são divididos em secções com título curto (idealmente 3–5 secções, cada uma com ≤ 5 campos). Quando há uma ordem natural, numerar os passos.
- **R4.2** Menus e listas com mais de 7 elementos são agrupados em blocos com título.
- **R4.3** Números longos são mostrados em grupos: telemóvel `912 847 096`, NIF `123 456 789`, códigos `123 456`, valores com separador de milhares (`1 250 €`). Os valores guardados e copiados mantêm-se sem espaços.
- **R4.4** Não exigir que o utilizador se lembre de um valor de um ecrã para outro: mostrar de novo o que ele já indicou (resumos, confirmações).
- **R4.5** Painéis de indicadores: no máximo 6–7 números principais por vista.

**Verificação:** nenhum bloco sem título tem mais de 7 elementos; nenhum número com mais de 4 algarismos aparece sem agrupamento.

### A5. Efeito Von Restorff (isolamento) — o que é diferente é lembrado

**Princípio.** Entre elementos semelhantes, o que se destaca é o que se vê e o que se lembra. Só funciona se o destaque for raro.

**Regras**
- **R5.1** Um só elemento em destaque por ecrã: a ação principal (cor da marca, preenchida). As restantes ações são secundárias (contorno) ou discretas (texto).
- **R5.2** A cor de destaque não é usada para decoração; reservar vermelho/negativo para erros e ações destrutivas, verde/positivo para sucesso.
- **R5.3** Avisos importantes (pendentes, stock a repor, pedidos por responder) usam um marcador distinto e consistente (contador, faixa), nunca apenas texto igual ao resto.
- **R5.4** Não depender só da cor: o destaque combina cor com forma, peso, ícone ou posição (acessibilidade e daltonismo).
- **R5.5** Estados escolhidos (separador ativo, opção selecionada) têm contraste claro face aos não escolhidos.

**Verificação:** olhar para o ecrã durante 2 segundos; o que se lembra deve ser a ação principal ou o aviso que importa.

---

## Parte B — Erros comuns a evitar (vibe coding)

### B1. Formulários que o teclado esconde

**Erro.** O teclado tapa o campo ativo, a lista de sugestões ou o botão de guardar.

**Regras**
- **E1.1** O campo ativo fica sempre visível acima do teclado (no iPhone, no Android e com teclados de terceiros, como SwiftKey ou Gboard).
- **E1.2** Nenhum botão, aviso ou mensagem de erro fica escondido por baixo do teclado: o conteúdo encolhe ou desliza, não desaparece.
- **E1.3** O teclado certo para cada campo (numérico, decimal, e-mail, telefone) e uma forma evidente de o fechar («OK»/«Concluído»).
- **E1.4** Tocar fora do campo ou deslizar o conteúdo fecha o teclado.
- **Web:** `shared/ios.js` (altura do teclado em `--kb` e campo ativo visível). **SwiftUI:** `.scrollDismissesKeyboard`, `safeAreaInset(edge: .bottom)` e barra do teclado com «Concluído».

### B2. Ignorar as margens seguras e os tamanhos de ecrã

**Erro.** Conteúdo cortado pelo entalhe, pela Dynamic Island ou pela barra inicial; ecrãs que só funcionam no telemóvel de quem os fez.

**Regras**
- **E2.1** Respeitar sempre as margens seguras (`env(safe-area-inset-*)` e `viewport-fit=cover` na web; `safeAreaInset` e sem `ignoresSafeArea` no conteúdo em SwiftUI).
- **E2.2** Testar pelo menos num ecrã pequeno (iPhone SE, 375 × 667 pt; Android 360 dp) e num grande (iPhone Pro Max, 430 × 932 pt), na vertical e, quando aplicável, no iPad/computador.
- **E2.3** Conteúdo em *scroll* e ações principais fixas em baixo; nenhum texto cortado com o tamanho de letra aumentado nas definições do telefone.
- **E2.4** Áreas de toque com pelo menos 44 × 44 pt.

### B3. Esquecer os estados sem rede e de erro

**Erro.** Ecrã branco, «a carregar…» infinito, ou dados escritos perdidos quando a rede falha.

**Regras**
- **E3.1** Cada ecrã que depende da rede tem três estados visíveis: a carregar, sem ligação e erro.
- **E3.2** Os estados de erro e sem ligação têm sempre um botão **«Tentar de novo»**.
- **E3.3** Quando existe informação guardada, mostrá-la com o aviso «a mostrar a última informação guardada».
- **E3.4** Uma gravação que falha não perde o que o utilizador escreveu: oferecer «Tentar de novo» com os mesmos dados.
- **E3.5** Mensagens de erro em linguagem corrente, a dizer o que aconteceu e o que fazer.

### B4. Chaves de API dentro da app

**Erro.** Chaves secretas (de serviços pagos, de administrador da base de dados, de redes sociais) no código da app, onde qualquer pessoa as pode extrair.

**Regras**
- **E4.1** Nenhuma chave secreta no código da app, no repositório ou no histórico do Git. Ficam no servidor (ex.: segredos das *Edge Functions* do Supabase) e a app chama o servidor.
- **E4.2** Só podem estar na app chaves **públicas por desenho**, cujo acesso é controlado no servidor (ex.: a chave *publishable/anon* do Supabase com regras RLS ativas em todas as tabelas).
- **E4.3** A chave `service_role`/*secret* do Supabase nunca sai do servidor.
- **E4.4** Se uma chave secreta chegar a ser publicada, considerá-la comprometida: revogá-la e criar outra (apagar o ficheiro não chega).

### B5. Não auditar contra as regras da App Store e do Google Play

**Erro.** A app é rejeitada, ou retirada, por falhas que se podiam ver antes de a submeter.

**Regras**
- **E5.1** Antes de cada submissão, rever as *App Store Review Guidelines* e as políticas do Google Play e registar o resultado.
- **E5.2** Privacidade: política de privacidade acessível dentro da app; manifesto de privacidade (`PrivacyInfo.xcprivacy`) e «etiqueta» de privacidade/secção de segurança de dados preenchidas de acordo com o que a app faz.
- **E5.3** Permissões: pedir só as necessárias, no momento em que são usadas, com texto de justificação claro em português (`NS…UsageDescription`).
- **E5.4** Contas: se a app permite criar conta, tem de permitir apagá-la a partir da própria app.
- **E5.5** Conteúdo e funcionamento: sem ecrãs de teste, textos provisórios ou ligações partidas; funcionalidade própria (não apenas um site embrulhado); ícones, nome e capturas de ecrã de acordo com as regras.
- **E5.6** Versões: aumentar a versão visível e o número de compilação a cada entrega.


---

## Lista de verificação antes de publicar

| # | Pergunta | Regras |
|---|---|---|
| 1 | Voltar, cancelar e guardar estão onde o utilizador espera? | R1.1–R1.3 |
| 2 | Há uma única ação principal e, no máximo, 3 ações no rodapé? | R2.1, R5.1 |
| 3 | Algum menu ou grupo de opções tem mais de 7 elementos sem título? | R2.3, R4.2 |
| 4 | Cada ação e cada texto de ajuda estão junto daquilo a que se referem? | R3.2–R3.4 |
| 5 | Os formulários longos estão em secções com título, separadas por espaço? | R3.1, R4.1 |
| 6 | Telemóveis, NIF, códigos e valores aparecem agrupados? | R4.3 |
| 7 | O destaque é raro e não depende só da cor? | R5.2–R5.4 |
| 8 | Com o teclado aberto, o campo ativo e os botões continuam visíveis? | E1.1–E1.2 |
| 9 | Foi testado num ecrã pequeno e num grande, dentro das margens seguras? | E2.1–E2.2 |
| 10 | Sem rede ou com erro, há mensagem clara e botão «Tentar de novo»? | E3.1–E3.4 |
| 11 | Há alguma chave secreta no código ou no repositório? | E4.1–E4.3 |
| 12 | A versão cumpre as regras da App Store / Google Play (privacidade, permissões, contas)? | E5.1–E5.6 |

## Como aplicar em cada tecnologia

- **Web / PWA (HTML, CSS, JS):** secções com título (`.sec`) para dividir formulários e menus; `btn pri` só na ação principal; `fmtTel`/`fmtNif` para mostrar números agrupados; `shared/ios.js` em todas as páginas com campos; faixa de erro com botão «Tentar de novo».
- **iOS (SwiftUI):** componentes nativos (`NavigationStack`, `toolbar`, `confirmationDialog`, `swipeActions`); um `HUDPrimaryButton` por ecrã; espaço pequeno dentro dos grupos e grande entre grupos; textos novos sempre com tradução PT-PT em `Localizable.xcstrings`.

## Registo de aplicação

Cada app regista no seu `CLAUDE.md` as alterações feitas por causa destas regras, com o identificador da regra, e o resultado da última auditoria (B5).
