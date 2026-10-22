# Mr Clean Wolf — apps de gestão e de cliente

Duas aplicações web instaláveis (PWA) para iPhone, iPad e computador:

| App | Endereço | Quem usa |
|---|---|---|
| Gestão | `https://lusowolf286.github.io/mr-clean-wolf/gestao/` | Só o gestor (e-mails na tabela `admins`) |
| Área de cliente | `https://app.mrcleanwolf.com/c` (link curto na Cloudflare para `…/mr-clean-wolf/cliente/`) | Cada cliente, com o e-mail registado na sua ficha |
| Atualização de dados | `https://app.mrcleanwolf.com/d#…` (link único enviado por SMS) | Cliente |

Também neste repositório: a app iOS (`ios-app/`, ver o seu README), o site público (`site/`, publicado pela Cloudflare Pages) e a recolha diária das redes sociais (`supabase/functions/social-sync`).

O código fica no GitHub (público, sem dados). Os dados, as fotografias e as contas ficam no Supabase, em servidores na UE.

---

## 1. Supabase (base de dados)

1. Crie uma conta em <https://supabase.com> e um **novo projeto** na região **Central EU (Frankfurt)**. Guarde a palavra-passe da base de dados.
2. **SQL Editor → New query**: abra `supabase/schema.sql`, troque `o-seu-email@exemplo.pt` pelo seu e-mail, cole tudo e carregue em **Run**.
3. **Importar os dados atuais**: no SQL Editor, numa nova consulta, cole o conteúdo do ficheiro privado `seed.sql` (enviado à parte, **não o coloque no GitHub**) e carregue em **Run**.
4. **Authentication → Sign In / Providers → Email**: confirme que está ativo.
5. **Authentication → Email Templates → Magic Link**: substitua o texto por algo como:

   ```
   <h2>Mr Clean Wolf</h2>
   <p>O seu código de acesso é: <strong>{{ .Token }}</strong></p>
   <p>O código é válido durante 1 hora.</p>
   ```

   Faça o mesmo no modelo **Confirm signup** (é o que recebem os clientes no primeiro acesso).
   As apps usam o **código de 6 dígitos**, não o link (no iPhone, o link abriria fora da app instalada).
   Em **Authentication → Sign In / Providers → Email**, mantenha o comprimento do código (*Email OTP Length*) em 6.
6. **Authentication → Users → Add user → Create new user**: crie o utilizador com o seu e-mail (o mesmo da tabela `admins`).
7. **Pedidos de marcação e dias disponíveis**: no SQL Editor, numa nova consulta, cole `supabase/marcacoes.sql` e carregue em **Run**.
8. **Project Settings → API**: copie o **Project URL** e a chave **anon public**.

> A chave `service_role` nunca deve ser colocada no código nem partilhada.

8. **Envio de e-mails aos clientes**: o servidor de e-mail incluído no Supabase só entrega mensagens aos membros da equipa do projeto e tem um limite de poucas mensagens por hora. Para os clientes receberem o código, configure um servidor SMTP próprio em **Authentication → Emails → SMTP Settings** (por exemplo, Brevo ou Resend, com plano gratuito). Para uso apenas pelo gestor, não é necessário.

## 2. Configurar

Abra `config.js` e preencha:

```js
window.CW_CONFIG = {
  supabaseUrl: "https://abcdefgh.supabase.co",
  supabaseAnonKey: "eyJhbGciOi..."
};
```

## 3. GitHub (publicação)

1. Crie um repositório **público** (o GitHub Pages gratuito exige repositório público; o código não contém dados de clientes).
2. **Add file → Upload files**: arraste o conteúdo desta pasta (todas as pastas e ficheiros, incluindo `config.js`). Confirme em **Commit changes**.
3. **Settings → Pages → Build and deployment**: Source **Deploy from a branch**, Branch **main**, pasta **/(root)**, **Save**.
4. Ao fim de 1–2 minutos a app fica em `https://lusowolf286.github.io/mr-clean-wolf/`.
5. No Supabase, **Authentication → URL Configuration → Site URL**: coloque o endereço da área de cliente.

## 4. Instalar no iPhone / iPad

Abra o endereço no **Safari → Partilhar → Adicionar ao ecrã principal**. A app abre em ecrã completo, com o ícone do lobo, e mostra a última informação guardada quando não há rede.

## 5. Primeira utilização

1. Entre na **gestão** com o seu e-mail e o código recebido.
2. Nas fichas de cliente, preencha o **e-mail** de cada cliente que vai ter acesso.
3. Em **Exportar → Atualizar área de cliente**, gere o histórico de todos os clientes. A partir daí, cada serviço ou cliente gravado atualiza a área de cliente automaticamente.
4. Em cada serviço, a opção **Mostrar anotações e fotografias ao cliente** controla o que o cliente vê.

## 6. Notas

- **Plano gratuito do Supabase**: projetos sem qualquer utilização durante 7 dias são colocados em pausa; reativam-se no painel com um clique. O uso normal da app evita a pausa.
- **Fotografias** carregadas na versão do claude.ai não passam automaticamente para esta versão.
- **Atualizações**: substitua os ficheiros no GitHub; as apps instaladas atualizam-se na abertura seguinte.
- **Privacidade**: rever `privacidade.html` sempre que mudar um subcontratante (por exemplo, o serviço de envio de e-mail) e atualizar a data no topo.
- **Base de dados**: desde 22/10/2026 o esquema é gerido por migrações em `supabase/migrations/` (ver o README dessa pasta e a regra E4.5). Os passos 2 e 7 da secção 1 descrevem a instalação original e não devem ser repetidos no projeto de produção.

## Estrutura

```
config.js              ligação ao Supabase (só a chave publishable)
index.html             encaminha para a área de cliente
privacidade.html       política de privacidade
gestao/                app de gestão (PWA)
cliente/               app de cliente (PWA)
d/                     atualização de dados por link único
shared/                ligação ao Supabase (supa.js) e teclado do iPhone (ios.js)
icons/                 ícones das apps
ios-app/               app iOS (Capacitor) com cópia embutida de gestao/
site/                  site público www.mrcleanwolf.com (Cloudflare Pages)
social/                dashboard das redes sociais
supabase/migrations/   esquema da base de dados (fonte de verdade, E4.5)
supabase/functions/    Edge Function social-sync
supabase/*.sql         scripts originais (histórico)
```
