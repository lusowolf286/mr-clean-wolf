# Clean Wolf — app iOS (gestão)

App nativa para iPhone e iPad com a app de gestão. Os dados continuam no Supabase, sincronizados com a versão web.

Diferenças em relação à versão web:
- **Agenda → calendário**: as marcações são gravadas diretamente no calendário predefinido do iPhone; voltar a exportar atualiza as mesmas marcações, sem duplicar.
- **PDF e CSV**: abrem a folha de partilha do iOS (Mail, WhatsApp, Ficheiros, AirDrop).
- Bibliotecas embutidas: a app abre mesmo sem rede.

## Instalar no iPhone (Mac com Xcode, Apple ID gratuito)

1. Instale o **Xcode** a partir da App Store do Mac (gratuito).
2. Descarregue o projeto: <https://github.com/lusowolf286/mr-clean-wolf> → **Code → Download ZIP** e descomprima.
3. Abra `ios-app/ios/App/App.xcodeproj` (duplo clique). Aguarde que o Xcode descarregue o pacote **Capacitor** (barra de estado no topo; precisa de rede).
4. **Xcode → Settings → Accounts → +** → **Apple ID** → entre com o seu Apple ID.
5. Na lista à esquerda, clique em **App** (ícone azul) → alvo **App** → separador **Signing & Capabilities**:
   - **Automatically manage signing**: ativo;
   - **Team**: o seu nome **(Personal Team)**;
   - se aparecer erro no **Bundle Identifier**, troque para `pt.mrcleanwolf.gestao.paulo` (tem de ser único).
6. Ligue o iPhone ao Mac por cabo e, no iPhone, carregue em **Confiar**.
7. No iPhone: **Definições → Privacidade e segurança → Modo de programador** → ativar (o iPhone reinicia).
8. No topo do Xcode, escolha o seu iPhone como destino e carregue em **▶** (Run).
9. Na primeira vez, no iPhone: **Definições → Geral → VPN e gestão de dispositivos** → o seu Apple ID → **Confiar**. Abra a app **Clean Wolf**.

Para o iPad, repita os passos 6 a 9 com o iPad ligado.

### Limitações do Apple ID gratuito
- A app deixa de abrir **ao fim de 7 dias**. Para renovar: ligue o iPhone ao Mac, abra o projeto e carregue em **▶**. Os dados não se perdem (estão no Supabase).
- Máximo de 3 apps instaladas desta forma por aparelho.
- Com o **Apple Developer Program** (99 USD/ano) a app dura 1 ano e pode ser distribuída por TestFlight.

## Atualizar a app (para quem mantém o código)

A app embute uma cópia da pasta `gestao/`. Depois de alterar a app web:

```
cd ios-app
npm install
npm run sync
```

Isto recria `www/` e copia-a para `ios/App/App/public`. Depois, no Xcode, **▶** para reinstalar.
