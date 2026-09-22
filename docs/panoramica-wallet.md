## Parte 1 — L'idea e perché è fatta così

**Cosa fa e per chi.** Dal `README.md`, prime righe: "Banco di prova del biglietto
Wallet per le serate di Luca California (Room 26, Roma). Progetto a sé stante: non è
il sito, serve solo a vedere il biglietto su un iPhone vero."

Il flusso previsto per il prodotto finito, sempre dal brief riportato nel README e nei
commenti: il cliente prenota una lista o un tavolo dal sito, Luca conferma dal suo
pannello, il cliente riceve via WhatsApp (inviato a mano da Luca) un link per aggiungere
il biglietto al Wallet, e all'ingresso lo staff scansiona il QR per segnare chi è
arrivato. Di questo flusso, in questo repository è realizzato solo il biglietto.

**Modello di business o prezzo.** Non documentato.

**Decisioni chiave e motivo.** In `~/work/04-fonti/inbox/decisioni.md` non compaiono
voci relative a questo progetto. Quanto segue è preso dai commenti nel codice e dal
README, quasi verbatim, con la fonte:

- `src/lib/pass/biglietto.ts`, commento in testa alla funzione: "Unico punto in cui si
  decide che aspetto ha il biglietto: la fase 2 cambierà solo da dove arrivano i dati,
  non questa funzione."
- `src/lib/pass/certificati.ts`: i certificati si leggono "1. variabili d'ambiente in
  base64 (è così su Vercel); 2. file PEM nella cartella certs/ (è così sul Mac mentre
  sviluppi)", e "Il contenuto dei certificati non viene mai stampato nei log: negli
  errori compare solo il nome che manca."
- `src/app/api/pass/demo/route.ts`: "Interruttore spento di default: il biglietto finto
  non deve esistere in produzione, va acceso a mano sul deploy di prova." La rotta
  risponde 404 se manca `ABILITA_PASS_DEMO=1`.
- `next.config.ts`: "Le immagini del pass vivono su disco in assets/pass. Vercel include
  in una funzione solo i file che riesce a tracciare leggendo il codice, e un percorso
  costruito a runtime non lo vede: qui glieli dichiariamo a mano"
  (`outputFileTracingIncludes`).
- `scripts/genera-immagini.mjs`: "La strip (l'immagine larga dietro i campi) NON viene
  sovrascritta se esiste già: lì Luca ci mette la grafica della serata, e il build non
  deve mangiarla."
- `.vercelignore`: "Quando esiste questo file, Vercel ignora .gitignore: qui dentro deve
  esserci TUTTO quello che non deve salire, certificati in testa."
- `README.md`, sezione 1: la CSR è stata generata con `openssl` e non con Accesso
  Portachiavi, perché su quel Mac l'Assistente certificato fallisce con "The specified
  item could not be found in the keychain". Questa strada evita anche l'esportazione in
  `.p12` e la conversione con `-legacy`.
- `src/lib/pass/biglietto.ts`, sul `relevantDate`: "relevantDate è deprecato da iOS 18
  ma serve ai telefoni più vecchi: impostiamo tutte e due le forme."

**Cosa è stato verificato, e come.** Dal README e dalla sessione di lavoro del
22 settembre 2026:

- il `.pkpass` servito dalla produzione passa `openssl smime -verify`, esito
  `Verification successful`;
- la catena dei certificati è Pass Type ID -> Apple WWDR G4 -> Apple Root CA;
- i 10 hash del `manifest.json` corrispondono ai file contenuti;
- un iPhone ha aggiunto il biglietto al Wallet.

## Parte 2 — Stato attuale

- Ultimo commit: **2026-09-22**.
- Commit negli ultimi 90 giorni: **1** (è il primo commit del repository, `d2ae2ae`).
- `git status --short`: nessuna modifica in sospeso, albero pulito.
- Nessun remoto configurato: il repository esiste solo sul Mac.

**Deploy.** `.vercel/project.json` indica il progetto `lucacurellapr`, organizzazione
`team_jWZ5dIMUSSiEkdPb31AtJZOf`. Ultimo deploy: stato `Ready`, ambiente `Production`,
build 26s, indirizzo pubblico `https://lucacurellapr.vercel.app`. L'indirizzo lungo del
singolo deploy risponde 302 (protezione di Vercel), l'alias corto risponde 200.

Variabili d'ambiente impostate in Production: `PASS_TYPE_IDENTIFIER`,
`APPLE_TEAM_IDENTIFIER`, `PASS_SIGNER_CERT_BASE64`, `PASS_SIGNER_KEY_BASE64`,
`PASS_WWDR_BASE64`, `PASS_SIGNER_KEY_PASSPHRASE`, `ABILITA_PASS_DEMO=1`.

**Certificati.** Pass Type ID `pass.it.satoshiweb.lucacalifornia`, Team ID `CYZ7XKRGWR`.
Il certificato del pass scade il **22 ottobre 2027**, il WWDR G4 il 10 dicembre 2030.
I file PEM stanno in `certs/`, esclusa sia da git sia da Vercel.

## Parte 3 — Sotto il cofano

**Stack.** Next.js 16.3.6 (App Router), React 19.2.0, TypeScript 5.9.3,
`passkit-generator` 3.6.1 per generare e firmare il `.pkpass`, `sharp` 0.35.4 (solo in
sviluppo) per generare le immagini. Servizi esterni: Vercel per l'hosting, portale
Apple Developer per i certificati. Supabase è citato come previsto per la fase 2, ma non
è presente fra le dipendenze né nel codice.

**Dimensione.** 11 file di codice fra `src/` e `scripts/`, 585 righe in totale.
Un solo endpoint: `/api/pass/demo`.

**Dipendenze.** `npm outdated` elenca 6 pacchetti con una versione più recente
disponibile: `@types/node` (24.10.1 -> 26.6.2), `@types/react` e `@types/react-dom`
(19.2.x -> 19.3.0), `react` e `react-dom` (19.2.0 -> 19.3.0), `typescript`
(5.9.3 -> 7.0.2). `npm audit --omit=dev` riporta **2 vulnerabilità di gravità bassa**.

**Test.** Non esistono. Gli script disponibili sono `dev`, `build`, `start`, `immagini`,
`tipi`; non c'è uno script `test`. `npm run tipi` esegue il controllo dei tipi con
`tsc --noEmit`. Le verifiche fatte finora sono state manuali (curl sulla rotta, unzip
del `.pkpass`, `openssl smime -verify`, prova su iPhone).

**Protezioni sulle funzioni.**
- Bordo: regola del firewall Vercel attiva, "Limite sulle API, 60 ogni 60s per IP,
  blocco 1m, su /api/". Verificata con 70 richieste consecutive: dalla 58ª in poi
  la risposta è 403.
- Blocco dei tentativi (`~/.claude/strumenti/blocco-tentativi.js`): non presente. In
  fase 1 nessun endpoint accetta una password.

**Contenuto nel sorgente (regola SSR).** La pagina `/wallet-test` in produzione contiene
**429 caratteri** di testo ripulito da `script` e `style`. La soglia indicata nel
CLAUDE.md globale per una pagina normale è 900. La pagina ha `robots: noindex, nofollow`
nei metadati.

**Segreti nel codice.** Ricerca di chiavi e password in chiaro su `src/`, `scripts/` e i
file di configurazione: nessuna corrispondenza. Nella storia di git compare un solo file
`.env*`, cioè `.env.example`, che contiene i due identificativi Apple (non segreti) e i
campi dei certificati vuoti. `.env.local`, `certs/` e `.vercel/` non sono mai stati
committati.

## Parte 4 — I buchi che solo Edoardo può riempire

**Decisioni da prendere con Luca, prima di scrivere la tabella delle prenotazioni:**

1. ~~Un biglietto per prenotazione con il numero di persone, o uno a testa?~~
   **Risolta il 22 settembre 2026.** Il numero di persone **non si chiede per il
   tavolo** (richiesta esplicita di Luca, scritta nel brief del sito). **Per la lista
   forse sì**, da confermare con lui. Quindi all'ingresso l'esito resta binario, verde
   "Entra" o rosa "già entrato", senza conteggio parziale del gruppo.
2. Chi si iscrive in lista riceve il biglietto subito dal sito, oppure solo dopo la
   conferma manuale di Luca? Per i tavoli la conferma manuale è data per scontata nel
   brief, per la lista no.
3. Ogni serata ha la sua grafica dentro il biglietto (la "strip"), oppure resta
   un'immagine fissa uguale per tutte? Oggi c'è una foto della sala in bassa
   risoluzione, tenuta apposta: in anteprima i contenuti non devono essere definitivi.
4. Il biglietto deve potersi aggiornare da solo dopo l'invio (tavolo cambiato, serata
   spostata)? Richiede un pezzo in più, non previsto nel brief.

**Domande di contesto:**

5. Esiste già un progetto Supabase per il sito di Luca California, e con quale forma
   della tabella delle prenotazioni? Serve per decidere se estenderla o crearne una.
6. Quante persone a serata e quante serate a settimana, come numeri veri: nel repository
   non c'è nessuna cifra.
7. Chi scansiona all'ingresso, con che telefono, e quante persone contemporaneamente?
   La pagina di scansione non è ancora stata scritta.
8. Il progetto Vercel `lucacurellapr` è nato come banco di prova e l'indirizzo è
   pubblico con il biglietto demo acceso. Va spento, lasciato acceso, o assorbito nel
   progetto del sito vero?

**Deciso il 22 settembre 2026, dopo aver letto il brief del sito:**

- Il logo del biglietto dice **LUCA CALIFORNIA**, anche se il brief del sito scrive che
  "il logo resta Luca Curella". Scelta consapevole: questa è un'anteprima, e in questa
  fase testi, numeri e dati non devono essere definitivi.
- Il codice del biglietto andrà **portato dentro il progetto del sito, non riscritto**
  (lo dice il brief del sito, fase 3). Sta tutto in `src/lib/pass/`, e l'unica cosa che
  cambierà è da dove arrivano i dati.
