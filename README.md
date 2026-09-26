# Mr Clean Wolf — apps de gestão e de cliente

Duas aplicações web instaláveis (PWA) para iPhone, iPad e computador:

| App | Endereço (depois de publicada) | Quem usa |
|---|---|---|
| Gestão | `https://<utilizador>.github.io/<repositório>/gestao/` | Só o gestor (e-mails na tabela `admins`) |
| Área de cliente | `https://<utilizador>.github.io/<repositório>/cliente/` | Cada cliente, com o e-mail registado na sua ficha |

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
4. Ao fim de 1–2 minutos a app fica em `https://<utilizador>.github.io/<repositório>/`.
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
- **Privacidade**: complete os campos entre parênteses retos em `privacidade.html` e valide o texto antes de dar acesso aos clientes.

## Estrutura

```
config.js              ligação ao Supabase (preencher)
index.html             encaminha para a área de cliente
privacidade.html       política de privacidade (rascunho a completar)
gestao/                app de gestão (PWA)
cliente/               app de cliente (PWA)
shared/supa.js         ligação da app de gestão ao Supabase
icons/                 ícones das apps
supabase/schema.sql    tabelas e regras de acesso
```
