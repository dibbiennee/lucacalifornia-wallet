# FASE 2, versione anteprima — piano di lavoro

> **Per chi esegue:** i passi sono caselle da spuntare. Si esegue un compito alla volta,
> e ogni compito finisce con qualcosa di provabile dal telefono.

**Obiettivo:** far vedere a Luca il giro completo, dalla conferma di una prenotazione
al biglietto nel Wallet alla lettura del QR all'ingresso, senza database e senza
servizi nuovi da configurare.

**Architettura:** il token del QR è **autosufficiente**: contiene la prenotazione
cifrata con AES-256-GCM e una chiave che sta solo sul server. Non serve nessun
archivio per sapere chi è quel biglietto, perché è il biglietto stesso a dirlo, e
nessuno può leggerlo o falsificarlo senza la chiave. Il prezzo di questa scelta è che
non si può sapere se un biglietto è **già** passato: quello richiede un archivio, e in
anteprima si è deciso di non averlo.

**Stack:** quello che c'è già (Next.js 16, TypeScript, passkit-generator), più `jsqr`
per leggere il QR dalla fotocamera. Niente Supabase, niente Vercel KV.

## Vincoli che valgono per tutti i compiti

- Mai dati personali in chiaro nel QR: il contenuto è cifrato, non solo firmato.
- La chiave di cifratura sta in `SEGRETO_BIGLIETTO`, mai nel codice, mai nel browser.
- Niente dati di esempio nel codice di produzione: i dati arrivano dal token o dal modulo.
- TypeScript rigoroso, nessun `any`.
- La pagina di scansione deve funzionare al buio: fondo nero, testi enormi, un tocco per
  passare al prossimo.
- Il codice del biglietto va tenuto pronto da portare nel progetto del sito: tutto in
  `src/lib/pass/`, senza dipendenze da questo progetto.
- iOS non ha `BarcodeDetector`: la fotocamera va letta con `jsqr`, altrimenti sull'iPhone
  di Luca non funziona niente.

---

## Compito 1: il token cifrato

**File:**
- Crea: `src/lib/pass/token.ts`
- Crea: `scripts/prova-token.mjs` (prova a mano, non è una suite di test)

**Interfacce:**
- Produce: `creaToken(dati: DatiBiglietto): string` e
  `leggiToken(token: string): DatiBiglietto | null` (null se manomesso o illeggibile).

- [ ] **Passo 1: scrivere `token.ts`**
  AES-256-GCM da `node:crypto`. Chiave: 32 byte ricavati da `SEGRETO_BIGLIETTO` con
  `scryptSync`, così il segreto può essere una frase qualsiasi. Formato del token:
  `base64url(iv || tag || cifrato)`. Le date viaggiano come stringhe ISO e tornano `Date`.
- [ ] **Passo 2: provare che un token torna uguale a com'è partito**
  `node scripts/prova-token.mjs` deve stampare i dati identici a quelli di partenza.
- [ ] **Passo 3: provare che un token manomesso viene rifiutato**
  Cambiare un carattere in mezzo al token: `leggiToken` deve restituire `null`, non
  buttare un'eccezione.
- [ ] **Passo 4: misurare la lunghezza del token**
  Deve stare sotto i 300 caratteri, altrimenti il QR diventa troppo fitto da leggere
  con la fotocamera di notte.
- [ ] **Passo 5: commit**

## Compito 2: la rotta del biglietto vero

**File:**
- Crea: `src/app/api/pass/[token]/route.ts`
- Modifica: `next.config.ts` (aggiungere la nuova rotta a `outputFileTracingIncludes`)

**Interfacce:**
- Consuma: `leggiToken` dal compito 1, `creaBiglietto` da `src/lib/pass/biglietto.ts`.

- [ ] **Passo 1: scrivere la rotta**
  `GET /api/pass/<token>`: se `leggiToken` torna `null`, risposta 404 con testo chiaro.
  Altrimenti genera il `.pkpass` con le stesse intestazioni della rotta demo.
- [ ] **Passo 2: aggiungere la rotta al tracciamento dei file**
  Senza questo le immagini non salgono nella funzione e su Vercel il pass esce rotto.
  È già successo con `/api/pass/demo`.
- [ ] **Passo 3: provare in locale con un token generato a mano**
  `curl -sD -` deve dare `200` e `application/vnd.apple.pkpass`.
- [ ] **Passo 4: provare che un token inventato dà 404**
- [ ] **Passo 5: commit**

## Compito 3: la conferma, come la farà Luca

**File:**
- Crea: `src/app/pannello/page.tsx` (modulo: nome, serata, data, tipo, sala)
- Crea: `src/app/api/conferma/route.ts`

**Interfacce:**
- Produce: `POST /api/conferma` riceve i campi, risponde
  `{ linkBiglietto: string; linkWhatsapp: string }`.

- [ ] **Passo 1: scrivere la rotta di conferma**
  Costruisce `DatiBiglietto`, chiama `creaToken`, compone il link assoluto al biglietto
  e il link `https://wa.me/<numero>?text=<messaggio già scritto>` con dentro quel link.
- [ ] **Passo 2: scrivere la pagina**
  Tutte le scelte a bottoni, non a tendina, come nel brief del sito. Dopo la conferma
  mostra il messaggio pronto e il pulsante "Apri WhatsApp".
- [ ] **Passo 3: provare il giro dal telefono**
  Compilare, confermare, aprire il link del biglietto da Safari, aggiungerlo al Wallet.
- [ ] **Passo 4: commit**

## Compito 4: la lettura del QR all'ingresso

**File:**
- Crea: `src/app/staff/scan/page.tsx`
- Crea: `src/app/api/verifica/route.ts`
- Modifica: `package.json` (dipendenza `jsqr`)

**Interfacce:**
- Produce: `POST /api/verifica` riceve `{ token }`, risponde
  `{ esito: "valido" | "non valido"; nome?: string; tipo?: string; serata?: string }`.

- [ ] **Passo 1: aggiungere `jsqr`**
- [ ] **Passo 2: scrivere la rotta di verifica**
  La chiave resta sul server: il browser manda il token e riceve solo l'esito.
- [ ] **Passo 3: scrivere la pagina di scansione**
  `getUserMedia` con `facingMode: "environment"`, fotogrammi su `<canvas>`, `jsqr` su
  ogni fotogramma. Esito a schermo intero: verde con nome e tipo, rosso se non valido.
  Un tocco qualsiasi riparte con la scansione successiva.
- [ ] **Passo 4: provare dal telefono, con la luce spenta**
  Scansionare il biglietto vero dal Wallet di un altro telefono, o dallo schermo del Mac.
- [ ] **Passo 5: commit**

## Compito 5: rifinitura e consegna

- [ ] **Passo 1: spegnere la rotta demo**
  Ora che c'è il biglietto vero, `ABILITA_PASS_DEMO` non serve più acceso.
- [ ] **Passo 2: aggiornare il README** con le variabili nuove e il giro completo.
- [ ] **Passo 3: pubblicare e riprovare tutto dal telefono**
- [ ] **Passo 4: commit**

---

## Cosa questa versione NON fa, e va detto a Luca

- **Non sa se un biglietto è già passato.** Scansionandolo due volte dice verde due
  volte. Per il "già entrato alle 00:42" serve un archivio, che si aggiunge quando il
  sito avrà Supabase.
- **Non conserva le prenotazioni.** Il modulo di conferma non salva niente: serve a far
  vedere il gesto che farà Luca, non a gestire una serata vera.
- **La pagina di scansione è aperta**, difesa solo dal firewall. Quando si deciderà chi
  ci entra, si aggiungono password e blocco dei tentativi.
