# Brief: rifare la grafica del pannello nello stile del sito nuovo

Per Claude Code, nel progetto `lucacalifornia` (Next.js 16, App Router, TypeScript).

## 0. Prima di iniziare

1. Leggi questo file per intero, poi `docs/pannello-descrizione.md` (lo stato di oggi).
2. Leggi le skill `tipografia-web` e `design-web` in `~/.claude/skills/`: valgono per
   tutto il lavoro.
3. **Il riferimento è il prototipo** `docs/riferimento/pannello-prototipo.html`
   (anteprima: https://claude.ai/artifact/R8JLvijyzFBpY1KiwnsseW). È il pannello già
   rifatto e funzionante: tutte le schermate, tutti gli stati (pulsante "Stati" in basso
   a destra, con i numeri degli screenshot vecchi), i testi definitivi e il CSS con i
   nomi dei componenti di questo brief. **Il lavoro è portarlo nel progetto 1:1**:
   - il blocco `TOKEN` va in `src/stili/token.css`;
   - ogni sezione CSS diventa il foglio del suo componente;
   - le funzioni `V.<schermata>` diventano le pagine delle rotte;
   - `DATI()` corrisponde a `dati.ts`;
   - le funzioni `aggiornaStato`, `impostaEtichetta`, `aggiungiPr`… diventano Server Actions.

   Quello che nel prototipo è simulato (sessione, API, lettura del QR con la
   fotocamera, download del `.pkpass`) va collegato al codice che esiste già. I testi
   "Simula: …" e la nota della password non vanno portati.
   Riferimento secondario: `docs/riferimento/luca-california-sorgente.html` (il sito).
4. Lavora su un branch `pannello-nuovo-stile`. Commit piccoli, uno per schermata.
5. Parti in plan mode: proponi il piano, aspetta l'ok, poi costruisci.

## 1. Cosa si tocca e cosa no

**La struttura cambia: quattro schede.** Il pannello serve prima di tutto a ricevere e
confermare le richieste dei moduli del sito. La barra in basso diventa:
**Richieste · Stasera · Serate · Squadra**.
- `/pannello` porta a `/pannello/richieste`: è la schermata iniziale. Sulla scheda un
  badge magenta col numero di richieste nuove.
- `Oggi` sparisce: i suoi numeri passano in `Stasera`, le richieste da confermare in `Richieste`.
- **Nuova** `/pannello/stasera`: chi è confermato per la serata di stasera (o la prossima).
- `Porta` **esce dalla barra**. Il lettore QR è un extra che forse non verrà usato:
  vedi la sezione 4, "Extra: la porta".

**Si rifà:** tutto il gruppo `(dentro)` (`/pannello`, `/pannello/richieste`,
`/pannello/richieste/[id]`, `/pannello/stasera` nuova, `/pannello/serate`,
`/pannello/squadra`), più `/pannello/accesso` e `/biglietto/prova`.
`/pannello/porta`, `/staff/scan` e `LettoreQr` restano nel codice ma fuori dalla barra:
solo token nuovi, nessun lavoro in più (vedi "Extra: la porta").

**Non si tocca**, salvo i punti indicati nella sezione 5:
- `/api/conferma`, `/api/verifica`, `/api/pass/*`, la cifratura del token, i certificati;
- la logica di accesso (firma HMAC, blocco dei tentativi, durata della sessione);
- `src/lib/pannello/dati.ts` resta **l'unico punto d'ingresso dei dati**; le schermate
  non leggono dati da nessun'altra parte;
- tutta l'accessibilità che c'è già (`label`, `aria-invalid`, `role="alert"`,
  `radiogroup`, `aria-current`): va mantenuta, non riscritta da zero.

Regole del progetto che restano: TypeScript rigoroso, dati di esempio solo in
`dati.ts` con `DATI_DI_ESEMPIO` dichiarato a schermo, niente segreti nel codice.

## 2. I token

Sostituiscono quelli della sezione 12 di `pannello-descrizione.md`. Mettili in un
file unico (per esempio `src/stili/token.css`) condiviso con il sito, così sito e
pannello restano allineati.

```css
:root{
  /* superfici */
  --bg:#000000;          /* fondo */
  --surface:#141318;     /* riquadri, card */
  --surface-2:#1E1C24;   /* riquadri dentro i riquadri, numeri, filtri spenti */
  --line:#2E2B36;        /* bordi e separatori */
  --nav:#050408;         /* barra in basso */
  /* testo */
  --text:#F5F2EC;        /* bianco caldo, mai #FFFFFF puro su nero */
  --muted:#B3AEBD;       /* secondario, occhielli, etichette */
  --dim:#8E899A;         /* note e dettagli */
  --ink:#000000;         /* testo su fondi chiari e colorati */
  /* accento: solo azioni */
  --magenta:#FF3EA5;
  /* colori delle serate (etichette, dettagli) */
  --milk:#FFB3DA; --acid:#E6FF4D; --cyan:#4DE1FF; --red:#FF4A3D; --sun:#FFB35C;
  /* stati */
  --ok:#2FD37A;          /* confermata, entrato, conferme */
  --wa:#25D366;          /* solo il pulsante WhatsApp */
  --errore:#FFC2D1;      /* testo degli errori */
  --esito-ok:#0B7A2F;    /* lettore: ENTRA (restano quelli di oggi) */
  --esito-no:#8E0B2B;    /* lettore: NO */
  --esito-gia:#8A5A00;   /* lettore: GIÀ DENTRO (nuovo) */
  --link:#7CC7FF;        /* telefono, link nei messaggi */
  /* forme */
  --r-l:26px; --r-m:16px; --r-s:12px; --r-pill:999px;
  /* spaziature: solo questa scala */
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px; --s-5:24px; --s-6:32px; --s-7:48px; --s-8:64px;
  /* movimento */
  --t-veloce:150ms; --t-medio:250ms; --curva:cubic-bezier(.2,.8,.2,1);
  color-scheme: dark;
}
:focus-visible{ outline:3px solid var(--magenta); outline-offset:3px; }
```

**Carattere:** Archivo variabile con l'asse della larghezza (`next/font/google`,
`axes: ['wdth']`), al posto di Anton e Hanken Grotesk.
- Titoli di schermata: peso 900, `font-stretch:125%`, maiuscolo, interlinea 0,92,
  `clamp(28px, 8vw, 40px)`, `text-wrap: balance`.
- Numeri grandi: peso 900, `font-stretch:112%`.
- Testo: peso 400-700, 15-17px, interlinea 1,5. Mai sotto i 12px (etichette di campo
  comprese).
- Occhielli: 11-12px, peso 800, maiuscolo, spaziatura 0,02-0,08em (non 0,22 come oggi).

**Forme:** si abbandona lo spigolo vivo. Card e riquadri `--r-m`, pulsanti e filtri
`--r-pill`, campi `--r-s`. Superfici piene (`--surface`), non trasparenze bianche.

## 3. I componenti

Costruiscili una volta, in `src/componenti/pannello/`, e usali ovunque:

| Componente | Com'è | Note |
|---|---|---|
| `Testata` | occhiello + titolo `h1` + eventuale azione a destra (`Esci`) | Il titolo usa i gruppi `.ph` della skill tipografia: "Sabato, <due sale>" non va a capo dentro "due sale" |
| `Etichetta` | pillola 11px peso 800: Nuova (acid), Confermata (ok), In attesa (sun), Rifiutata (esito-no, testo bianco), In corso (magenta) | Sempre allineata a sinistra, mai a tutta larghezza |
| `Numero` | riquadro `--surface-2`, numero grande sopra, etichetta sotto | Griglie `repeat(n, minmax(0,1fr))` |
| `CardRichiesta` | `--surface`, nome + ora o etichetta a destra, riassunto, riga secondaria in `--dim` | È un link intero all'id; l'area di tocco è tutta la card |
| `Pulsante` | varianti: `pieno` (magenta, testo nero), `vuoto` (bordo `--line`, testo `--text`), `whatsapp` (`--wa`, testo `#04250F`), `pillola` (bianco, testo nero: "Accendi la fotocamera") | Altezza minima 48px, una riga sola, stato `disabled` con testo che dice cosa sta succedendo |
| `Scelta` | gruppo di pulsanti tipo radio (etichette serate, filtri) | `role="radiogroup"`/`role="radio"`/`aria-checked`, selezionato bianco con testo nero |
| `Campo` | etichetta sopra (11px, maiuscolo), input 46px, `--r-s`, bordo magenta al focus, errore sotto in `--errore` con `role="alert"` | Testo del campo 16px |
| `Avviso` | riga `role="status"` su fondo verde tenue, sparisce da sola dopo 2,6s | Per "Segnata in attesa", "Link creato", "Sul sito ora: …" |
| `Vuoto` | riquadro tratteggiato con una frase che dice cosa succederà | Vedi i testi nella sezione 4 |
| `NotaEsempio` | riga piccola in `--dim` "Dati di esempio" | Sostituisce i riquadri tratteggiati lunghi di oggi, finché c'è `DATI_DI_ESEMPIO` |
| `BarraPannello` | 5 voci uguali, fondo `--nav`, voce attiva in `--text` con lineetta magenta in alto | Altezza minima 52px + zona sicura dell'iPhone |
| `Esito` | tutto schermo, ENTRA / NO / GIÀ DENTRO, "Tocca per il prossimo" in fondo | Un tocco ovunque chiude; animazione breve di entrata, niente con "riduci movimento" |

## 4. Schermata per schermata

Testi: **restano quelli di `pannello-descrizione.md`** salvo dove indicato qui.
Separatori: nei titoli e negli occhielli la virgola al posto del punto mediano
(`STASERA, SABATO 26 SET`, `TAVOLI, 3`, `RICHIESTA, OGGI 18:42`,
`PORTA, SABATO, DUE SALE`, `NOTE PRIVATE, SOLO TU`).

**Accesso.** Come la demo: occhiello, `Entra`, campo, pulsante pieno. Stati invariati.
Aggiungi `Scrivi la password` se si preme Entra col campo vuoto (lato client).

**Richieste** (schermata iniziale).
- Occhiello `QUESTA SETTIMANA`, in alto a destra `Esci` (nuovo, vedi 5).
- Filtri come `Scelta`, sempre letti dall'indirizzo come oggi.
- Card con etichetta di stato a destra, messaggio in corsivo in `--text` attenuato, `Biglietto inviato alle …` in `--dim`.
- Elenco vuoto: con filtro Nuove `Nessuna richiesta nuova. Appena qualcuno prenota dal sito, la trovi qui.`, altrimenti `Nessuna richiesta con questo stato.`

**Singola richiesta.**
- In alto il tasto indietro (nuovo): `‹ Richieste`, oppure `‹ Stasera` se aperta da lì (`?da=stasera`).
- Sotto il nome, l'etichetta dello stato attuale.
- Telefono in `--link` sottolineato.
- Voci come elenco con etichetta piccola sopra e valore sotto.
- Messaggio in un riquadro `--surface` con virgolette curve.
- Blocco della conferma con gli stati di oggi.
- `In attesa` e `Rifiuta` affiancati e funzionanti (vedi 5).

**Stasera** (nuova).
- Occhiello `STASERA, <data>` se la serata è oggi, altrimenti `PROSSIMA SERATA, <data>`
  (fuso `Europe/Rome`); titolo col nome della serata.
- Tre numeri: `tavoli` e `in lista` (richieste confermate per quella serata) e `nuove`,
  che è un link a `/pannello/richieste?stato=nuova`.
- Campo `Cerca un nome` (`type="search"`, etichetta nascosta): filtra l'elenco mentre
  scrivi, senza ricaricare la pagina e senza far perdere il fuoco al campo.
- Sezioni `TAVOLI, n` (nome, sala a destra, gruppo, budget e occasione) e `LISTA, n`
  (nome e sala). Ogni riga apre la richiesta.
- Vuoti: `Ancora nessuno confermato per questa serata.` e, con la ricerca,
  `Nessuno con “<testo>” per stasera.`
- In `dati.ts`: `confermatiPerSerata(codice, data)`. Nessun numero di persone, mai.

**Extra: la porta** (probabilmente non verrà usata). Fuori dalla barra, raggiungibile
solo da indirizzo. In testa l'avviso `Extra, non incluso: il lettore QR alla porta, se
un giorno servirà.` Se Luca lo vorrà, la composizione pronta è questa (risolve il
difetto 1):
1. occhiello `PORTA, SABATO, DUE SALE` e conteggio grande `0 / 49 entrati`;
2. il lettore **dentro la pagina**, in un riquadro nero arrotondato alto almeno 250px, non più `position: fixed`:
   - spento: `INGRESSO` e il pulsante pillola;
   - acceso: riquadro di mira e `Inquadra il QR`;
3. `Se il QR non si legge`, `Cerca a mano nella lista`;
4. `Ultimi ingressi`.

L'esito copre tutto lo schermo sopra la barra, come oggi.

Per ora non si investe altro tempo qui: niente test su iPhone della fotocamera finché
Luca non dice che la usa.

**Serate.**
- Quattro riquadri con `Scelta`.
- Avviso `Sul sito ora: <serata>, <etichetta>.` a ogni cambio.
- Special guest e Capodanno con i moduli brevi della demo (vedi 5).
- La nota lunga diventa `NotaEsempio` finché non c'è il database.

**Squadra.**
- Card PR: nome maiuscolo e prenotazioni a destra; link in monospazio che taglia il dominio e **non taglia mai lo slug finale** (`…satoshiweb.it/marco`); `Copia` a destra; tre numeri.
- `Aggiungi un PR` apre un campo `Nome del PR` e il pulsante `Crea il suo link`.
- Compleanni: `Scrivi su WhatsApp` apre il messaggio già scritto: `Ciao <nome>! Tra poco è il tuo compleanno: ti tengo un tavolo come l'anno scorso?`

**/staff/scan** (extra, come la porta). Solo i token nuovi.

**/biglietto/prova.** Stessa struttura, stile del sito: fondo nero, scheda `--surface` arrotondata, pulsante nero "Aggiungi a Apple Wallet" con il badge ufficiale Apple se disponibile.

## 5. I difetti da chiudere, in ordine

| # | Difetto | Cosa fare |
|---|---|---|
| 1 | Barra da cinque con `Oggi` e `Porta` | Barra a quattro (sezione 1), `/pannello/stasera` nuova, `/pannello` → `/pannello/richieste`, badge delle nuove. |
| 2 | Nessun tasto indietro | `‹ Richieste` nella singola richiesta; torna all'elenco **mantenendo il filtro** che c'era. |
| 3 | Non si esce dal pannello | `Esci` in Richieste → nuova rotta `POST /api/pannello/esci` che cancella il cookie → `/pannello/accesso`. |
| 4 | Elenchi vuoti senza testo | Testi della sezione 4. |
| 5 | `Copia` fallisce in silenzio | Se `navigator.clipboard` fallisce, prova col metodo di riserva (textarea + `execCommand('copy')`); se fallisce anche quello, avviso `Non riesco a copiare: tieni premuto il link per copiarlo a mano.` |
| 6 | Messaggio WhatsApp "sei dentro per SABATO di sabato…" | Il pannello manda a `/api/conferma` il **nome della serata** (`DUE SALE`, `MILKSHAKE`, `COMMERCIALE`, `BÁILAME`), non il giorno. È una modifica solo al corpo inviato, non alla rotta. |
| 7 | La conferma inventa la data (prossima domenica 23:30) | Calcola la **prossima occorrenza del giorno della serata** della richiesta, fuso `Europe/Rome`. L'orario resta 23:30 finché Luca non conferma gli orari veri: mettilo in una costante unica `ORARIO_INIZIO` con un commento. |
| 8 | Cinque pulsanti senza gestore | Aggiungi in `dati.ts` le funzioni `aggiornaStato(id, stato)`, `aggiungiOspite(nome)`, `pubblicaPacchetti()`, `aggiungiPr(nome)`, chiamate da Server Actions. Oggi aggiornano i dati di esempio in memoria e lo dichiarano (`NotaEsempio`); con Supabase cambiano solo loro. `Rifiuta` chiede conferma prima di agire. |
| 9 | Interruttori delle serate che non arrivano al sito | Stessa strada: `impostaEtichetta(codice, etichetta)` in `dati.ts`. Il sito legge le etichette da `serate()`. Arriva davvero al sito solo col database: fino ad allora l'avviso dice `Anteprima: la scelta non è ancora salvata.` |
| 10 | Porta: lettore coperto, non sa chi è già passato | Solo se Luca userà la porta: composizione della sezione 4 ed esito `GIÀ DENTRO`. Altrimenti resta com'è, fuori dalla barra. |

Non fare adesso (dipendono dal database, restano in `docs/da-fare.md`): tracciamento
dei link dei PR, provvigioni vere, blocco dei tentativi condiviso fra istanze.

## 6. Accessibilità e telefono

- Aree di tocco almeno 44×44 (48 per i pulsanti pieni). La barra in basso non copre mai l'elemento con il focus (`scroll-padding-bottom`).
- Contrasto 4,5:1 per ogni testo, verificato con `audit-design.py`.
- Il pannello si usa di notte, con una mano: le azioni principali stanno nella metà bassa dello schermo.
- `prefers-reduced-motion`: niente animazioni di entrata, esiti senza transizione.
- Manifest invariato (`start_url`, `scope`, `standalone`), aggiorna solo `theme_color` e `background_color` a `#000000`.

## 7. Verifica prima di dire che è finito

1. `npm run build` pulito, nessun errore TypeScript.
2. Screenshot Playwright a 390×844 (scala 2) della **stessa lista** di
   `docs/pannello-screenshot/` (01-22, più i nuovi stati: elenchi vuoti, GIÀ DENTRO,
   avvisi), salvati in `docs/pannello-screenshot-nuovo/`. Mettili affiancati ai
   vecchi in un unico foglio di confronto.
3. `python3 ~/.claude/skills/design-web/scripts/audit-design.py http://localhost:3000 /pannello/richieste /pannello/stasera /pannello/serate /pannello/squadra --larghezze 360 390 430`, dopo aver fatto l'accesso nel contesto del browser (aggiungi allo script il cookie di sessione, oppure fai l'accesso con Playwright prima di lanciarlo). Zero errori.
4. `controlla-testi.py` sulle stesse pagine, con Archivo caricato. Zero problemi.
5. Prova a mano su iPhone con Safari:
   - accesso;
   - conferma di una richiesta, fino al WhatsApp aperto;
   - biglietto aggiunto al Wallet;
   - ricerca in Stasera con la tastiera del telefono aperta;
   - `Esci`.
6. Aggiorna `docs/pannello-descrizione.md` con i testi e i comportamenti nuovi.

Consegna: il link di anteprima Vercel del branch, il foglio di confronto degli
screenshot, e l'elenco dei difetti chiusi con quelli rimasti.
