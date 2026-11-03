# Regras de qualidade das apps — Apex Wolf Ventures

Documento de referência comum a todas as apps (Mr Clean Wolf, OnTarget/AfinaMira e projetos futuros). Qualquer ecrã, funcionalidade ou versão nova tem de cumprir estas regras antes de ser publicada.

As regras têm um identificador fixo para poderem ser citadas em revisões e mensagens de *commit*: **R** para as regras de ouro de UX (ex.: «R2.3»), **E** para os erros a evitar (ex.: «E4.1»), **L** para a conformidade legal, confiança e acessibilidade (ex.: «L14.1») e **M** para o método de trabalho (ex.: «M1.2»).

**Versão 1 — 28/09/2026.** Parte A com as regras de ouro 1 a 5; Parte B com os erros 1 a 5. Novas regras acrescentam-se no fim de cada parte (A6, B6, …), sem renumerar as existentes.

**Versão 1.1 — 20/10/2026.** Acrescentada a regra E4.5 (permissões explícitas nas tabelas novas do Supabase, por causa da alteração da Supabase de 30/10/2026) e a pergunta 13 da lista de verificação.

**Versão 2 — 03/11/2026.** Acrescentadas a Parte C (L1 a L20: documentos legais, consentimento e dados, práticas comerciais leais, acessibilidade, identificação do negócio) e a Parte D (M1: procurar soluções *open-source* antes de escrever código), e as perguntas 14 a 24 da lista de verificação.

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
- **E4.5** Cada tabela nova no esquema `public` é criada numa migração que inclui, no mesmo ficheiro, a tabela, `enable row level security`, as regras de acesso e os `GRANT` explícitos. Desde 30/10/2026 a Supabase não dá acesso automático pela Data API às tabelas novas; sem `GRANT` a app recebe «permission denied», também em projetos novos, *preview branches* e `supabase db reset`. Dar só o necessário: `authenticated` conforme as regras RLS; `service_role` só quando uma *Edge Function* precisa; `anon` só para conteúdo público, legível sem sessão. O esquema não é alterado só no editor SQL do painel.

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

## Parte C — Conformidade legal, confiança e acessibilidade

As referências legais indicam o enquadramento português e europeu em vigor em novembro de 2026 e servem para orientar o trabalho; não substituem aconselhamento jurídico. Quando uma regra depende de interpretação (por exemplo, se um pedido de marcação é um contrato à distância), a app regista no seu `CLAUDE.md` a interpretação adotada e o motivo. Uma regra que não se aplique a uma app (por exemplo, cookies numa app iOS sem web) fica registada como «não aplicável», com a razão.

**Momento de aplicação.** A Parte C é critério obrigatório de lançamento: aplica-se a uma app ou site antes de ser aberto ao público, de ter clientes reais como utilizadores ou de ser submetido a uma loja. Enquanto um projeto está em beta, para uso pessoal do dono, a Parte C não é aplicada; o `CLAUDE.md` do projeto indica «beta, uso pessoal» e a auditoria completa à Parte C é feita na preparação do lançamento. As Partes A, B e D aplicam-se sempre. (Decisão de 03/11/2026: todos os projetos atuais estão em beta.)

### C1. Política de privacidade

- **L1.1** Toda a app ou site que trate dados pessoais (mesmo que seja só um e-mail, um endereço IP em registos ou fotografias) tem política de privacidade em português. A política fica acessível num toque a partir de qualquer ecrã (rodapé, menu ou ecrã de entrada) e num endereço público, exigido pelas lojas.
- **L1.2** Conteúdo mínimo:
  - responsável pelo tratamento e respetivo contacto;
  - finalidades e fundamento de cada tratamento;
  - destinatários e subcontratantes (C8);
  - transferências para fora do EEE e garantias;
  - prazos de conservação;
  - direitos do titular e como exercê-los: acesso, retificação, apagamento, portabilidade, oposição e retirada do consentimento;
  - direito de queixa à CNPD;
  - se o fornecimento dos dados é obrigatório.
- **L1.3** A política corresponde ao que a app faz realmente. É atualizada sempre que muda um dado recolhido, um subcontratante ou uma finalidade, e indica a data da última atualização.
- *Base:* RGPD (Reg. (UE) 2016/679), arts. 12.º a 14.º; App Store Review Guidelines 5.1.1; política de dados do utilizador do Google Play.

### C2. Termos e condições

- **L2.1** Quando há contratação de serviços, contas, marcações ou vendas, existem termos e condições em linguagem clara, com:
  - quem presta o serviço (C16);
  - o que está incluído;
  - preços e pagamentos (C10);
  - marcações e cancelamentos (C3);
  - responsabilidade;
  - lei aplicável e resolução de litígios (C16).
- **L2.2** Quando os termos criam obrigações (por exemplo, ao pedir uma marcação), são aceites de forma explícita, com a ligação visível nesse momento (R3.2). Nenhuma cláusula importante fica escondida.
- **L2.3** Uma app gratuita, sem contas nem vendas, pode usar a licença padrão da Apple (EULA) e dispensar termos próprios. A decisão fica registada no `CLAUDE.md`.
- *Base:* DL 446/85 (cláusulas contratuais gerais); DL 24/2014 (informação pré-contratual).

### C3. Política de reembolso e cancelamento

- **L3.1** Se há pagamentos, marcações ou produtos, a política responde a estas perguntas:
  - como cancelar ou remarcar, e com que antecedência;
  - o que acontece em caso de falta;
  - quando há reembolso, em que prazo e por que meio;
  - como são tratados os produtos encomendados à medida do cliente.
- **L3.2** Nos contratos celebrados à distância ou fora do estabelecimento, respeita-se o direito de livre resolução de 14 dias e as suas exceções (por exemplo, serviço integralmente prestado com acordo prévio expresso do consumidor, ou bens feitos por medida). Esta informação é dada antes da contratação.
- **L3.3** A política é coerente com os termos (C2) e com o que se pratica, e nunca é mais restritiva do que a lei. Nas compras feitas nas lojas de apps, os reembolsos são tratados pela Apple ou pela Google.
- *Base:* DL 24/2014 (direito de livre resolução e respetivas exceções); Lei 24/96 (Lei de Defesa do Consumidor).

### C4. Política de cookies

- **L4.1** Lista de tudo o que a app guarda ou lê no aparelho, incluindo o que vem de terceiros: cookies, `localStorage`, IndexedDB e cache do *service worker*. Para cada elemento: nome, finalidade, duração, quem o define e se é essencial.
- **L4.2** Quando só há armazenamento essencial, a lista pode ser uma secção da política de privacidade.
- *Base:* Lei 41/2004, art. 5.º (redação da Lei 46/2012); RGPD.

### C5. Faixa de consentimento de cookies

- **L5.1** O armazenamento estritamente necessário para o serviço pedido não precisa de consentimento: sessão, preferências escolhidas pelo utilizador, cache para funcionar sem rede. Precisa de consentimento **prévio**:
  - estatísticas com identificadores;
  - publicidade;
  - píxeis de redes sociais;
  - vídeos ou mapas incorporados que definam cookies.
- **L5.2** Sem armazenamento não essencial, não se mostra faixa. É a solução preferida, porque tem menos atrito (R2). Para estatísticas, preferir soluções sem cookies.
- **L5.3** Quando há faixa:
  - «Recusar» é tão visível e tão fácil como «Aceitar», logo no primeiro nível;
  - nada vem pré-assinalado e as escolhas são feitas por finalidade;
  - nada é carregado antes do consentimento;
  - a escolha fica registada;
  - há uma forma permanente de mudar de ideias (ligação «Definições de cookies» no rodapé).
- *Base:* Lei 41/2004, art. 5.º; RGPD, arts. 4.º, n.º 11, e 7.º; Orientações 05/2020 do CEPD sobre o consentimento.

### C6. Consentimentos nos formulários

- **L6.1** Cada formulário diz para que servem os dados e tem a ligação à política de privacidade junto ao botão de envio (R3.2).
- **L6.2** O consentimento só é pedido quando é mesmo o fundamento do tratamento. Nesse caso:
  - há uma caixa por finalidade, nunca pré-assinalada;
  - aceitar não é condição para obter o serviço (por exemplo, a newsletter fica separada do pedido de marcação).
- **L6.3** Fica guardada a prova do consentimento: data, texto aceite e versão. Retirar o consentimento é tão fácil como dá-lo.
- **L6.4** Quando o tratamento é necessário para cumprir o contrato (por exemplo, os dados para executar a marcação), o fundamento não é o consentimento: basta informar para que servem os dados, sem caixa de aceitação.
- *Base:* RGPD, arts. 6.º e 7.º.

### C7. Recolher só os dados necessários

- **L7.1** Cada campo tem uma finalidade escrita. O que não tem finalidade sai. Os campos opcionais estão assinalados como «(opcional)».
- **L7.2** Não pedir dados antes de serem precisos (por exemplo, o NIF só para faturar). Data de nascimento e morada, da mesma forma, só quando forem necessários. Nunca pedir dados de categorias especiais (saúde, por exemplo).
- **L7.3** Há prazos de conservação definidos e aplicados: no fim do prazo, os dados são apagados ou anonimizados, também nos registos e nas cópias.
- **L7.4** As permissões do telefone e os SDK seguem a mesma regra (E5.3, C8).
- *Base:* RGPD, art. 5.º, n.º 1, alíneas c) e e), e art. 25.º.

### C8. Auditar SDK e serviços de terceiros

- **L8.1** O `CLAUDE.md` de cada app mantém uma tabela com todos os terceiros: bibliotecas, CDN, fontes, estatísticas, autenticação, armazenamento, e-mail e pagamentos. Para cada um:
  - que dados recebe;
  - país e eventual transferência para fora do EEE;
  - se é subcontratante;
  - ligação para a respetiva política.
- **L8.2** Antes de acrescentar um terceiro, responder a duas perguntas: é mesmo necessário? Há alternativa que não envie dados (biblioteca local, auto-alojamento)? Servir localmente bibliotecas e fontes (por exemplo, as Google Fonts) evita enviar sem necessidade o IP do visitante a terceiros.
- **L8.3** Os subcontratantes têm acordo de tratamento de dados (DPA). Fora do EEE, há garantias adequadas: decisão de adequação (por exemplo, o EU-US Data Privacy Framework) ou cláusulas contratuais-tipo.
- **L8.4** Lojas de apps:
  - no iOS, os SDK de terceiros trazem o seu manifesto de privacidade e, quando aplicável, assinatura;
  - a etiqueta de privacidade da App Store e a secção de segurança de dados do Google Play incluem também os dados recolhidos pelos SDK.
- *Base:* RGPD, arts. 28.º e 44.º a 49.º; requisitos de manifestos de privacidade da Apple; secção de segurança dos dados do Google Play.

### C9. Eliminar padrões enganadores (*dark patterns*)

- **L9.1** É proibido:
  - tornar recusar mais difícil do que aceitar;
  - deixar caixas pré-assinaladas;
  - criar urgência ou escassez falsas («só hoje», contadores fictícios);
  - envergonhar quem recusa («Não, prefiro pagar mais»);
  - tornar cancelar mais difícil do que subscrever;
  - fazer perguntas confusas (com dupla negação, por exemplo);
  - disfarçar anúncios de conteúdo.
- **L9.2** As ações destrutivas e de pagamento usam palavras claras e pedem confirmação (R1.2, R5.2), sem esconder a alternativa.
- **L9.3** A ação principal (R5.1) serve a intenção do utilizador, não apenas a do negócio.
- *Base:* DL 57/2008 (práticas comerciais desleais); RGPD, art. 7.º; Regulamento dos Serviços Digitais (Reg. (UE) 2022/2065), art. 25.º, para plataformas em linha.

### C10. Sem custos escondidos

- **L10.1** Os preços mostrados são sempre o preço final que o cliente paga (com IVA, quando aplicável), em euros, e dizem o que incluem e o que não incluem. Custos adicionais (deslocação, produtos à parte, materiais encomendados) são indicados antes do pedido ou da compra.
- **L10.2** Orçamentos e totais mostram cada parcela: serviço, desconto, produtos à parte.
- **L10.3** «A partir de» só quando o valor mínimo é real e as condições estão explicadas.
- *Base:* DL 138/90 (indicação de preços); DL 24/2014; DL 57/2008.

### C11. Sem avaliações falsas

- **L11.1** Só se publicam testemunhos e avaliações reais, de clientes reais, com autorização para publicar. Nunca escritos por nós, comprados, ou atribuídos a pessoas inventadas.
- **L11.2** Quando se mostram avaliações, diz-se como se garante que vêm de clientes (por exemplo, «avaliações do Google», com ligação). As negativas não são escondidas de forma enganadora.
- **L11.3** Classificações agregadas (estrelas, número de avaliações) só a partir de uma fonte verificável.
- *Base:* DL 57/2008, na redação do DL 109-G/2021 (transposição da Diretiva (UE) 2019/2161, «Omnibus»).

### C12. Sem alegações sem fundamento

- **L12.1** Cada afirmação factual tem prova guardada; caso contrário, sai. Inclui resultados, duração de uma proteção, «o melhor», «n.º 1», «100 %», «ecológico», «sem riscos» e certificações.
- **L12.2** Para características de produtos, usa-se a especificação do fabricante, com a fonte e as condições (por exemplo, «até 3 anos de proteção, segundo o fabricante, com manutenção adequada»).
- **L12.3** Alegações ambientais genéricas («amigo do ambiente», «verde») só com comprovação reconhecida.
- **L12.4** Fotografias de antes e depois são reais, do próprio trabalho, sem retoque que altere o resultado.
- *Base:* DL 57/2008; Código da Publicidade (DL 330/90); Diretiva (UE) 2024/825 (alegações ambientais).

### Acessibilidade (C13 a C15)

O Ato Europeu de Acessibilidade (Diretiva (UE) 2019/882, transposta pelo DL 82/2022, aplicável desde 28/06/2025) obriga certos serviços ao consumidor, incluindo o comércio eletrónico, a cumprir requisitos de acessibilidade. As microempresas prestadoras de serviços estão isentas. Aplicamos C13 a C15 em todas as apps como regra de qualidade, independentemente dessa isenção. A referência técnica é a WCAG 2.2, nível AA.

### C13. Texto alternativo

- **L13.1** Texto alternativo em todas as imagens:
  - imagens com conteúdo: `alt` que diz o que mostram ou para que servem (por exemplo, «Interior de um Renault Clio depois da limpeza»);
  - imagens decorativas: `alt=""`;
  - botões só com ícone: `aria-label` (no SwiftUI, `accessibilityLabel`).
- **L13.2** Gráficos e diagramas têm um resumo em texto: o número principal ou a tendência.
- **L13.3** As fotografias carregadas pelo utilizador recebem um texto alternativo útil, gerado a partir do contexto (data e viatura, por exemplo).
- *Base:* WCAG 2.2, critério 1.1.1.

### C14. Contraste de cores

- **L14.1** Contraste mínimo face ao fundo:
  - texto normal: 4,5:1;
  - texto grande (24 px, ou 18,66 px em negrito): 3:1;
  - ícones, contornos de campos e indicação de foco: 3:1.
- **L14.2** O contraste é medido com a fórmula da WCAG sempre que se escolhe uma cor de texto, incluindo texto discreto, legendas e texto sobre imagens. Texto de controlos desativados está isento; texto apenas secundário não está.
- **L14.3** Verificar em todos os temas que a app tenha (claro e escuro).
- *Base:* WCAG 2.2, critérios 1.4.3 e 1.4.11.

### C15. Navegação por teclado

- **L15.1** Tudo o que se faz com o rato ou com o dedo também se faz com o teclado. Os elementos interativos são `button`, `a`, `input` ou `select` (nunca `div` com clique), por uma ordem de tabulação lógica.
- **L15.2** O foco está sempre visível (`:focus-visible`) e nunca fica tapado por barras fixas.
- **L15.3** Janelas e folhas:
  - ao abrir, o foco entra na janela;
  - enquanto está aberta, o foco fica dentro dela;
  - `Esc` fecha;
  - ao fechar, o foco volta ao elemento que a abriu.
- **L15.4** Nas páginas com navegação longa, há uma ligação «Saltar para o conteúdo». No iOS, testar com o Acesso total ao teclado e com o VoiceOver.
- *Base:* WCAG 2.2, critérios 2.1.1, 2.1.2, 2.4.3, 2.4.7 e 2.4.11.

### C16. Identificação do negócio

- **L16.1** Os sites e apps com presença comercial mostram, no rodapé ou numa página «Informação legal»:
  - nome ou firma;
  - endereço geográfico;
  - endereço de e-mail;
  - número de identificação fiscal;
  - registos e autorizações, quando existam.
- **L16.2** Há uma ligação visível para o Livro de Reclamações Eletrónico (livroreclamacoes.pt).
- **L16.3** Há informação sobre a resolução alternativa de litígios de consumo (RAL): entidade ou entidades competentes e respetivo sítio na Internet, confirmados na lista da Direção-Geral do Consumidor.
- **L16.4** Nas lojas de apps, os dados do programador estão corretos. Para distribuir na UE, é feita a declaração de estatuto de comerciante, e os respetivos dados de contacto ficam visíveis na página da app.
- *Base:* DL 7/2004, art. 10.º (comércio eletrónico); DL 156/2005, na redação do DL 74/2017 (Livro de Reclamações); Lei 144/2015, art. 18.º (RAL); Regulamento dos Serviços Digitais, art. 30.º.

### C17. Consentimento parental para menores

- **L17.1** Quando um serviço em linha se baseia no consentimento e pode ser usado por menores, abaixo dos 13 anos (idade fixada em Portugal) o consentimento é dado pelos responsáveis parentais.
- **L17.2** Se a app não se destina a menores, isso fica dito nos termos ou na política. A idade só é perguntada quando o serviço o exige (C7). Nesses casos, basta uma declaração simples (por exemplo, «Tenho 18 anos ou mais»).
- **L17.3** Nas lojas, o questionário de classificação etária é respondido com rigor. As apps para crianças cumprem as regras próprias (Kids Category da Apple, programa Famílias do Google Play).
- *Base:* RGPD, art. 8.º; Lei 58/2019, art. 16.º.

### C18. Ligação para cancelar a subscrição

- **L18.1** Todo o e-mail ou SMS de marketing tem uma forma simples e gratuita de deixar de receber: uma ligação de um clique ou «responda STOP». Funciona sem iniciar sessão e tem efeito imediato.
- **L18.2** Comunicações de marketing a pessoas singulares só com consentimento prévio. Exceção: clientes existentes, para produtos ou serviços semelhantes, desde que a oposição seja oferecida na recolha do contacto e em cada mensagem.
- **L18.3** Mensagens de serviço (código de acesso, confirmação de marcação) não são marketing e não levam conteúdo promocional.
- **L18.4** Nos envios de e-mail em volume, incluir o cabeçalho `List-Unsubscribe` com cancelamento num clique (exigido pelo Gmail e pelo Yahoo).
- *Base:* Lei 41/2004, art. 13.º-A; RGPD, art. 21.º.

### C19. Licenças das imagens

- **L19.1** Só se usam imagens próprias, encomendadas com cedência de direitos, ou de bancos de imagens com licença que permita o uso, incluindo o comercial. O repositório guarda a origem e o comprovativo da licença de cada imagem (em `docs/licencas/` ou numa lista no `CLAUDE.md`).
- **L19.2** As condições da licença são cumpridas (atribuição, quando exigida; nada de uso em logótipos, quando proibido). Pessoas identificáveis só com autorização.
- **L19.3** O mesmo vale para ícones, fontes e ilustrações (por exemplo, a licença OFL das fontes e a atribuição de ícones). Nas imagens geradas por IA, verificar os termos da ferramenta e não imitar marcas nem obras protegidas.
- *Base:* Código do Direito de Autor e dos Direitos Conexos; Código Civil, art. 79.º (direito à imagem).

### C20. Opção para apagar os dados

- **L20.1** Quem tem conta ou dados pessoais nas nossas apps pode pedir o apagamento de forma simples:
  - dentro da app, quando há conta (E5.4);
  - numa página web pública (exigida pelo Google Play) ou pelo e-mail indicado na política.
- **L20.2** O pedido é respondido no prazo de um mês. O apagamento abrange também cópias, fotografias e dados nos subcontratantes. A resposta explica o que se conserva por obrigação legal (por exemplo, as faturas, pelo prazo fiscal).
- **L20.3** Apagar a conta termina a sessão e apaga a cópia local no aparelho.
- *Base:* RGPD, arts. 12.º, n.º 3, e 17.º; App Store Review Guidelines 5.1.1(v); requisito de eliminação de conta do Google Play.

---

## Parte D — Método de trabalho

### D1. Não reinventar: procurar antes de escrever

**Princípio.** Uma funcionalidade que ainda não fizemos já foi resolvida por outros, quase sempre com mais casos-limite tratados do que uma primeira versão nossa. Procurar primeiro poupa tempo e erros.

**Regras**
- **M1.1** Antes de implementar uma funcionalidade desconhecida, procurar no GitHub projetos *open-source* e bibliotecas que já a resolvam. Ferramentas: `gh search repos`, `gh search code`, tópicos, listas «awesome». Exemplos: faixa de consentimento, OCR de faturas, sincronização de calendário, assinatura de PDF.
- **M1.2** Comparar pelo menos duas ou três abordagens quanto a:
  - licença compatível com o uso (MIT, Apache e BSD sem problemas; GPL e AGPL exigem cuidado);
  - manutenção (último *commit*, versões, *issues* em aberto);
  - adoção;
  - tamanho e dependências;
  - avisos de segurança;
  - privacidade (se envia dados a terceiros — C8);
  - acessibilidade (C13 a C15);
  - encaixe na nossa tecnologia (HTML/JS sem compilação, SwiftUI, Supabase).
- **M1.3** Antes de começar, registar a decisão em três a cinco linhas no `CLAUDE.md` da app: opções vistas, opção escolhida e porquê.
- **M1.4** Usar a biblioteca escolhida, com a versão fixada e, quando possível, servida localmente (L8.2), ou adaptar o padrão. Copiar código só com licença compatível e mantendo o aviso de direitos de autor.
- **M1.5** Escrever de raiz só quando nenhuma opção serve (por licença, peso ou privacidade), e registar porquê.

**Verificação:** cada funcionalidade nova tem no `CLAUDE.md` a comparação feita, ou a razão para ter sido escrita de raiz.

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
| 13 | As tabelas novas foram criadas numa migração com RLS, regras de acesso e `GRANT` explícitos, sem acesso do `anon` a dados privados? | E4.5 |
| 14 | Há política de privacidade em português, acessível num toque e de acordo com o que a app faz? | L1 |
| 15 | Onde há contratação, há termos e política de reembolso e cancelamento, aceites no momento certo? | L2, L3 |
| 16 | Todo o armazenamento no aparelho está listado, e o não essencial tem consentimento prévio, ou não há faixa por não ser preciso? | L4, L5 |
| 17 | Cada formulário diz para que servem os dados, sem caixas pré-assinaladas e só com campos necessários? | L6, L7 |
| 18 | Todos os terceiros (bibliotecas, CDN, fontes, serviços) estão listados e justificados, e servidos localmente quando possível? | L8 |
| 19 | Não há padrões enganadores, custos escondidos, avaliações falsas nem alegações sem prova? | L9 a L12 |
| 20 | As imagens têm texto alternativo, o contraste é de pelo menos 4,5:1 e tudo funciona com o teclado? | L13 a L15 |
| 21 | Estão visíveis a identificação do negócio, o Livro de Reclamações Eletrónico e a informação sobre RAL? | L16 |
| 22 | Estão tratados os menores, o cancelamento de subscrições e as licenças das imagens? | L17 a L19 |
| 23 | É possível pedir o apagamento dos dados (e da conta, dentro da app)? | L20 |
| 24 | Numa funcionalidade nova, foram procuradas e comparadas soluções *open-source* antes de escrever código? | M1 |

## Como aplicar em cada tecnologia

- **Web / PWA (HTML, CSS, JS):** secções com título (`.sec`) para dividir formulários e menus; `btn pri` só na ação principal; `fmtTel`/`fmtNif` para mostrar números agrupados; `shared/ios.js` em todas as páginas com campos; faixa de erro com botão «Tentar de novo».
- **Supabase:** esquema em `supabase/migrations/`; cada tabela nova parte do modelo `supabase/modelos/nova_tabela.sql` (tabela + RLS + regras + `GRANT` no mesmo ficheiro); depois de aplicar, ver os avisos de segurança do painel e testar com e sem sessão iniciada.
- **Conformidade (C1 a C20):** páginas legais (`privacidade.html`, `termos.html`) em cada app ou site com presença pública; tabela de terceiros e registo de imagens no `CLAUDE.md`; contraste medido com a fórmula da WCAG antes de escolher uma cor de texto; folhas e janelas com foco preso, `Esc` e devolução do foco.
- **Método (M1):** `gh search repos "<funcionalidade>" --sort stars` e `gh search code`; comparação registada no `CLAUDE.md` antes do primeiro *commit* da funcionalidade.
- **iOS (SwiftUI):** componentes nativos (`NavigationStack`, `toolbar`, `confirmationDialog`, `swipeActions`); um `HUDPrimaryButton` por ecrã; espaço pequeno dentro dos grupos e grande entre grupos; textos novos sempre com tradução PT-PT em `Localizable.xcstrings`.

## Registo de aplicação

Cada app regista no seu `CLAUDE.md` as alterações feitas por causa destas regras, com o identificador da regra, e o resultado da última auditoria (B5 e Parte C), incluindo as regras «não aplicáveis» e a razão.
