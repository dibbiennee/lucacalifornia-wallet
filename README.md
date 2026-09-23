# Biglietto Apple Wallet, Luca California

Banco di prova del biglietto Wallet per le serate di Luca California (Room 26, Roma).
Progetto a sé stante: non è il sito, serve solo a vedere il biglietto su un iPhone vero.

Stack: Next.js (App Router), TypeScript, `passkit-generator` 3, deploy su Vercel.

---

## A che punto siamo

**Fase 1, fatta e provata.** Biglietto aggiunto a un iPhone vero il 22 settembre 2026,
firma verificata contro la catena di Apple.

**Fase 2, versione anteprima.** Il giro completo si può far vedere:

| Pagina | Cosa fa |
|---|---|
| `/` | Indice dei tre passi |
| `/pannello` | La conferma, come la farà Luca: scegli serata e tipo, esce il messaggio WhatsApp già scritto |
| `/api/pass/<token>` | Il biglietto vero di quella prenotazione |
| `/staff/scan` | La porta: inquadri il QR e sai subito se passa |
| `/wallet-test` | Biglietto di prova con dati finti, acceso da `ABILITA_PASS_DEMO` |

**Come sta insieme senza database.** Il token dentro il QR **è** la prenotazione:
i dati viaggiano cifrati con AES-256-GCM e una chiave che sta solo sul server.
Chi inquadra il QR vede una sequenza illeggibile, e senza la chiave non se ne può
fabbricare uno. Per questo non serve nessun archivio per sapere chi è quel biglietto.

**Quello che questa versione non fa, e va detto a Luca:**

- **Non sa se un biglietto è già passato.** Scansionandolo due volte dice verde due
  volte. Il "già entrato alle 00:42" richiede un archivio, e arriva col Supabase del sito.
- **Non conserva le prenotazioni.** Il pannello non salva: fa vedere il gesto.
- **La pagina della porta è aperta**, difesa solo dal firewall. Quando si deciderà chi
  ci entra, si aggiungono password e blocco dei tentativi.

## 1. Preparare i certificati

Serve una volta sola, e va rifatto una volta l'anno (vedi "Rinnovo").
Tutto finisce in `certs/`, che è esclusa da git e da Vercel.

Questa è la strada con `openssl`, ed è quella usata davvero.
**Non passare da Accesso Portachiavi**: su questo Mac l'Assistente certificato
fallisce con "The specified item could not be found in the keychain", e comunque
quella strada aggiunge l'esportazione in `.p12` e la conversione, che qui non servono.

### 1.1 Registrare il Pass Type ID

1. [developer.apple.com > Identifiers](https://developer.apple.com/account/resources/identifiers/list/passTypeId), `+`, scegli **Pass Type IDs**.
2. Description `Luca California`, Identifier `pass.it.satoshiweb.lucacalifornia`.
3. Register. I Pass Type ID non si cancellano più, quindi scegli bene il nome.

### 1.2 Generare chiave privata e CSR

Dalla cartella del progetto. La password non va sulla riga di comando apposta:
`openssl` la chiede e non resta nella cronologia della shell.

```bash
openssl req -new -newkey rsa:2048 -keyout certs/signerKey.pem -out certs/LucaCalifornia.certSigningRequest -subj "/CN=Luca California Pass/emailAddress=edodbnmarketing@gmail.com/C=IT"
```

Chiede due volte una password: quella diventa `PASS_SIGNER_KEY_PASSPHRASE`.
Poi stringi i permessi della chiave:

```bash
chmod 600 certs/signerKey.pem
```

**`signerKey.pem` non si può rigenerare.** Se la perdi, il certificato di Apple
diventa carta straccia e devi rifare tutto. Tienine una copia nel gestore password.

### 1.3 Farsi emettere il certificato

1. Apri l'identifier sul portale, **Create Certificate**. Se non lo trovi lì:
   **Certificates > `+` > Pass Type ID Certificate**, poi scegli l'identifier.
2. Carica `certs/LucaCalifornia.certSigningRequest`, **Continue**, **Download**.
3. Sposta il `pass.cer` scaricato in `certs/` e convertilo:

```bash
openssl x509 -inform DER -in certs/pass.cer -out certs/signerCert.pem
```

### 1.4 Scaricare il certificato Apple WWDR (G4)

È il certificato intermedio di Apple: senza, l'iPhone non si fida della firma.

```bash
curl -o certs/AppleWWDRCAG4.cer https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer && openssl x509 -inform DER -in certs/AppleWWDRCAG4.cer -out certs/wwdr.pem
```

### 1.5 Controllare che sia tutto coerente

```bash
openssl x509 -in certs/signerCert.pem -noout -subject -issuer -enddate
```

Nel `subject` devi leggere `Pass Type ID: pass.it.satoshiweb.lucacalifornia` e,
nel campo `OU`, il **Team ID** (`CYZ7XKRGWR`): non serve cercarlo altrove.
L'`issuer` deve essere il WWDR G4.

Che il certificato combaci con la chiave si controlla confrontando i moduli,
senza bisogno della password:

```bash
openssl x509 -in certs/signerCert.pem -noout -modulus | openssl md5; openssl req -in certs/LucaCalifornia.certSigningRequest -noout -modulus | openssl md5
```

Le due righe devono essere identiche.

Alla fine in `certs/` servono tre file: `signerCert.pem`, `signerKey.pem`, `wwdr.pem`.
Gli altri (`.cer`, `.certSigningRequest`) puoi tenerli lì, non danno fastidio.

## 2. Variabili d'ambiente

Copia `.env.example` in `.env.local` e compila. In locale i certificati li legge
direttamente da `certs/`, quindi bastano quattro righe:

```
PASS_TYPE_IDENTIFIER=pass.it.satoshiweb.lucacalifornia
APPLE_TEAM_IDENTIFIER=CYZ7XKRGWR
PASS_SIGNER_KEY_PASSPHRASE=la-password-della-chiave
SEGRETO_BIGLIETTO=una-frase-lunga-almeno-16-caratteri
ABILITA_PASS_DEMO=1
```

| Variabile | A cosa serve |
|---|---|
| `PASS_TYPE_IDENTIFIER` | Il Pass Type ID registrato su Apple |
| `APPLE_TEAM_IDENTIFIER` | Il Team ID dell'account sviluppatore |
| `PASS_SIGNER_KEY_PASSPHRASE` | La password scelta al passo 1.2, protegge `signerKey.pem` |
| `PASS_SIGNER_CERT_BASE64` | Solo su Vercel: `signerCert.pem` in base64 |
| `PASS_SIGNER_KEY_BASE64` | Solo su Vercel: `signerKey.pem` in base64 |
| `PASS_WWDR_BASE64` | Solo su Vercel: `wwdr.pem` in base64 |
| `SEGRETO_BIGLIETTO` | Chiave con cui si cifrano i token del QR. Se cambia, i biglietti già consegnati non si aprono più |
| `ABILITA_PASS_DEMO` | `1` accende `/api/pass/demo`. Senza, risponde 404 |

Il codice cerca prima la variabile in base64, e solo se manca legge il file da `certs/`.

---

## 3. Provare in locale

```bash
npm install && npm run immagini && npm run dev
```

Poi apri `http://localhost:3000/wallet-test`.

Sul Mac il file si scarica e basta: **il biglietto si apre solo su iPhone**.
Per controllare che sia fatto bene senza avere il telefono sotto mano:

```bash
curl -sD - -o /tmp/prova.pkpass http://localhost:3000/api/pass/demo | head -5
```

Deve rispondere `200` con `content-type: application/vnd.apple.pkpass`. Il `.pkpass`
è uno zip: `unzip -o /tmp/prova.pkpass -d /tmp/prova` e guarda `pass.json`.

---

## 4. Provare sull'iPhone

iOS accetta un `.pkpass` **solo da Safari** e **solo da un indirizzo https**.
`localhost` non funziona, e nemmeno Chrome sull'iPhone.

### Deploy su Vercel (è quello che usiamo)

Prima di tutto: `.vercelignore` tiene fuori `certs/` e i file `.env*.local`.
Quando quel file esiste, Vercel **ignora** il `.gitignore`, quindi ogni cosa da
non pubblicare deve essere elencata lì dentro.

```bash
npx vercel link --yes
```

Se non esiste un progetto con il nome della cartella, **lo crea**: il messaggio
"Retrieving project" non vuol dire che ne ha trovato uno già tuo.

Poi le variabili in produzione. I PEM viaggiano in base64 su una riga sola, e la
password passa da un tubo per non finire né a video né nella cronologia:

```bash
base64 -i certs/signerCert.pem | tr -d '\n' | npx vercel env add PASS_SIGNER_CERT_BASE64 production
```

```bash
base64 -i certs/signerKey.pem | tr -d '\n' | npx vercel env add PASS_SIGNER_KEY_BASE64 production
```

```bash
base64 -i certs/wwdr.pem | tr -d '\n' | npx vercel env add PASS_WWDR_BASE64 production
```

Servono anche `PASS_TYPE_IDENTIFIER`, `APPLE_TEAM_IDENTIFIER`,
`PASS_SIGNER_KEY_PASSPHRASE` e `ABILITA_PASS_DEMO=1`. Poi:

```bash
npx vercel --prod --yes
```

**Usa l'indirizzo corto**, tipo `lucacurellapr.vercel.app`, non quello lungo con
la sigla in mezzo: gli indirizzi lunghi sono protetti da login e dall'iPhone
finiresti sulla pagina di accesso di Vercel. Le variabili vengono lette al deploy,
quindi se ne cambi una devi ripubblicare.

### Alternativa: tunnel dal Mac

I certificati restano solo sul tuo computer.

```bash
brew install cloudflared
```

```bash
npm run build && npm start
```

```bash
cloudflared tunnel --url http://localhost:3000
```

Ti stampa un indirizzo `https://qualcosa.trycloudflare.com` valido finché lasci
il comando acceso. Usa `npm start` e non `npm run dev`: il server di sviluppo
rifiuta le richieste che arrivano da un dominio esterno.

### Controllare senza telefono

```bash
curl -sD - -o /tmp/prova.pkpass https://TUO-INDIRIZZO/api/pass/demo | head -5
```

Deve rispondere `200` con `content-type: application/vnd.apple.pkpass`. Il
`.pkpass` è uno zip, quindi la firma si può verificare davvero:

```bash
cd /tmp && unzip -oq prova.pkpass -d prova && cd prova && openssl smime -verify -inform DER -in signature -content manifest.json -noverify
```

Deve stampare `Verification successful`.

### Cosa deve succedere

Tocchi "Aggiungi a Apple Wallet", iOS mostra l'anteprima del biglietto e il
pulsante **Aggiungi** in alto a destra. Se invece fa storie:

| Sintomo | Causa quasi sempre |
|---|---|
| "Safari non può scaricare questo file" | Non stai usando Safari, oppure l'indirizzo non è https |
| Finisci su una pagina di login Vercel | Stai usando l'indirizzo lungo del deploy invece dell'alias corto |
| "Impossibile aggiungere il pass" | `PASS_TYPE_IDENTIFIER` o `APPLE_TEAM_IDENTIFIER` non corrispondono al certificato |
| Errore 500 dalla rotta | Manca un certificato, o la password della chiave è sbagliata: il messaggio dice quale |
| Errore 404 dalla rotta | Manca `ABILITA_PASS_DEMO=1` |

## 5. Immagini del pass

Le genera `npm run immagini` (gira anche dentro `npm run build`), a partire dal
marchio descritto come path SVG in `scripts/genera-immagini.mjs`.

| File | Misura | Cos'è |
|---|---|---|
| `icon.png` / `@2x` / `@3x` | 29, 58, 87 | Icona nelle notifiche, marchio bianco su piastrella blu |
| `logo.png` / `@2x` / `@3x` | 50, 100, 150 | Marchio bianco trasparente, in alto a sinistra |
| `strip.png` / `@2x` / `@3x` | 375x123, 750x246, 1125x369 | Fascia dietro i campi, **segnaposto blu da sostituire** |

Per mettere la grafica vera della serata, sovrascrivi i file `strip*.png` in
`assets/pass/`: lo script non li tocca se esistono già.

---

## 5.bis Da anteprima a sito vero

Un interruttore solo, `SITO_PUBBLICO`, comanda insieme il `noindex` delle
pagine e `robots.txt`. Senza, il sito dice a tutti di stare fuori.

```bash
npx vercel env add SITO_PUBBLICO production
```

Scrivi `1` quando chiede il valore. **Poi ripubblica**, e non è un dettaglio:
la variabile viene letta **quando il sito viene costruito**, non quando gira.
Cambiarla su Vercel senza ripubblicare non produce nessun effetto, e si
perde mezza giornata a chiedersi perché Google continua a ignorare il sito.

```bash
npx vercel --prod
```

Misurato con Lighthouse sul telefono, a interruttore spento e acceso:

| | anteprima | pubblico |
|---|---|---|
| Accessibilità | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 69 | **100** |
| Agentic Browsing | 100 | 100 |
| controlli falliti | 1 | **0** |

L'unico controllo che falliva era "pagina esclusa dalle ricerche". Tutto il
resto era già a posto.

---

## 6. Rinnovo dei certificati

Il certificato del pass **scade il 22 ottobre 2027**. Quando scade, i biglietti
già nel Wallet restano, ma non se ne possono generare di nuovi: la rotta risponde 500.

Un mese prima rifai i passi da 1.2 a 1.3 con una CSR nuova, poi riconverti in
base64 e aggiorna le variabili su Vercel, e ripubblica.
Il WWDR G4 dura fino al 10 dicembre 2030.

Per ricontrollare la scadenza in qualsiasi momento:

```bash
openssl x509 -in certs/signerCert.pem -noout -enddate
```

## 7. Com'è fatto

```
assets/pass/            immagini del .pkpass (generate)
certs/                  certificati, fuori da git
scripts/
  genera-immagini.mjs   marchio SVG -> PNG con sharp
src/lib/
  serate.ts             le quattro serate e il calcolo della prossima data
  pass/
    tipi.ts             prenotazione, biglietto, elenco dei locali
    token.ts            cifratura e lettura del token del QR
    configurazione.ts   Pass Type ID e Team ID dalle variabili d'ambiente
    certificati.ts      legge i PEM da base64 o da certs/
    immagini.ts         legge le immagini da assets/pass
    biglietto.ts        costruisce e firma il .pkpass
    demo.ts             dati finti, solo per /api/pass/demo
src/app/
  page.tsx              indice dei tre passi
  pannello/page.tsx     la conferma
  staff/scan/page.tsx   la porta
  wallet-test/page.tsx  il biglietto di prova
  api/pass/demo/route.ts
  api/pass/[token]/route.ts
  api/conferma/route.ts
  api/verifica/route.ts
```

L'aspetto del biglietto sta tutto in `biglietto.ts`, e da dove arrivano i dati sta
in `token.ts`. Quando questo codice verrà portato nel progetto del sito, `src/lib/`
si sposta così com'è: non dipende da nient'altro di questo progetto.

Per provare il token senza costruire il progetto:

```bash
SEGRETO_BIGLIETTO=una-frase-lunga-abbastanza node scripts/prova-token.ts
```

---

## 8. Da fare prima di usarlo per davvero

- **Proteggere le funzioni**, prima di dare il link in giro:
  `python3 ~/.claude/strumenti/proteggi-api.py` nella cartella del progetto
  (60 richieste al minuto per IP su `/api/`), più il blocco dei tentativi dentro
  la verifica del token quando ci sarà (`~/.claude/strumenti/blocco-tentativi.js`).
- Cancellare `src/lib/pass/demo.ts` e la rotta demo.
- Spegnere `ABILITA_PASS_DEMO`.
