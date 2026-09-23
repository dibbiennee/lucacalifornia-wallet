# Luca California: contenuti, struttura e materiali

Documento di trasferimento. Serve a ricostruire il sito da zero altrove, quindi
contiene **tutto quello che non è grafica**: i testi veri, le pagine, i campi dei
moduli, le regole date dal cliente, il sistema del biglietto Apple Wallet e i
materiali esistenti.

**Non contiene:** colori, tipografia, spaziature, CSS, scelte visive. Quelle si
rifanno da capo.

**Non contiene nessun segreto:** niente chiavi, password o certificati. Ci sono
solo i nomi delle variabili d'ambiente da compilare.

Stato al 23 settembre 2026. Il sito è online in anteprima su
`https://lucacalifornia.satoshiweb.it` con il `noindex` attivo.

---

## 1. Di cosa si tratta

Luca Curella, in arte **Luca California**, è un PR di Roma. Mette in lista e
prenota tavoli in discoteca. Lavora in un locale per stagione:

- **d'inverno** al Room 26 di Roma, quattro sere a settimana, da giovedì a domenica
- **d'estate** al Ninfeo di Roma (all'EUR) e al Morgan Beach Club di Civitavecchia

Il sito serve a raccogliere richieste di lista e di tavolo, a far arrivare a Luca
le richieste in un posto solo invece che sparse fra DM e messaggi, e a consegnare
al cliente un biglietto da mettere nel telefono.

Il giro completo è questo:

1. la persona compila il modulo sul sito (mezzo minuto, nessun pagamento)
2. Luca vede la richiesta nel pannello e conferma
3. parte un messaggio WhatsApp scritto da lui, col link del biglietto dentro
4. il cliente apre il link con Safari e aggiunge il biglietto ad Apple Wallet
5. all'ingresso mostra il QR, e chi è alla porta lo inquadra col telefono

### Le regole che ha dato il cliente

Queste non si toccano, vengono da lui:

- **Non si chiede mai il numero di persone**, nemmeno per il tavolo.
- **Nessun messaggio automatico ai clienti.** Ogni messaggio parte da Luca, a mano.
- **Niente pagamenti sul sito.** Prezzo e disponibilità li dice lui su WhatsApp.
- Nel modulo **le scelte sono bottoni, non menu a tendina**: di notte, con una
  mano sola, un bottone si prende sempre.
- Le etichette delle serate (lista aperta, pochi tavoli, tutto pieno) le cambia
  Luca dal pannello, non sono fisse nel codice.

### Le regole tecniche del progetto

- TypeScript rigoroso.
- Nessun dato di esempio nel codice di produzione (dove ci sono, sono raccolti in
  un file solo e la pagina dichiara a schermo che sono esempi).
- Il certificato del pass e la sua chiave non finiscono mai nel repository né nei
  log: cartella locale esclusa da git, e su Vercel variabili d'ambiente in base64.
- Il token dentro il QR non è leggibile: niente dati personali in chiaro.
- Team ID e Pass Type ID stanno in variabili d'ambiente, non scritti nel codice.

---

## 2. Le pagine

Stack attuale: Next.js 16 App Router, React 19, TypeScript, deploy su Vercel.
Due gruppi di rotte: `(sito)` è la parte pubblica, `(dentro)` è il pannello protetto.

### Pubbliche

| Indirizzo | Cosa c'è |
|---|---|
| `/` | La home, che monta tutte le sezioni in fila |
| `/serate` | Le quattro serate, con il modulo sotto |
| `/serate/[codice]` | Una serata: `milkshake`, `venerdi`, `sabato`, `bailame` |
| `/locali` | I tre locali, uno per stagione |
| `/locali/[codice]` | Un locale: `room26`, `ninfeo`, `morgan` |
| `/navetta` | Il servizio navetta, col suo modulo corto |
| `/capodanno` | I tre pacchetti e la lista d'attesa |
| `/funzioni` | Pagina di vendita per Luca: cosa c'è dietro il sito |
| `/diventa-pr` | Candidature per entrare nella squadra |
| `/chi-sono` | Chi è Luca |
| `/privacy`, `/cookie` | Testi di servizio, da sostituire con quelli veri |

### Tecniche

| Indirizzo | Cosa fa |
|---|---|
| `/[canale]` | I percorsi corti di provenienza (vedi sezione 6) |
| `/sitemap.xml` | Generata dalle stesse liste che fanno il sito |
| `/robots.txt` | Lascia leggere, blocca solo pannello, biglietto, staff e api |
| `/llms.txt` | Spiega il sito ai motori che rispondono con l'AI |
| `/manifest.webmanifest` | Per installare il pannello come app sul telefono |

### Protette

| Indirizzo | Cosa c'è |
|---|---|
| `/pannello/accesso` | Password |
| `/pannello` | Oggi: la serata in corso |
| `/pannello/richieste` | Elenco, filtrato per stato |
| `/pannello/richieste/[id]` | La singola richiesta, con il tasto che conferma |
| `/pannello/porta` | Il lettore di QR a tutto schermo |
| `/pannello/serate` | Gli interruttori delle etichette |
| `/pannello/squadra` | I PR, le provvigioni, i compleanni |
| `/biglietto/prova` | Pagina per aggiungere il biglietto di prova |
| `/biglietto/conferma` | Strumento interno di conferma |
| `/staff/scan` | Il lettore di QR fuori dal pannello |

### Come è montata la home, in ordine

1. Dati strutturati (schema.org, invisibili)
2. **Apertura** col video del locale in sottofondo
3. **Nastro** che scorre con i nomi delle serate
4. **Serate**: le quattro copertine
5. **Special guest**: riquadro con lista d'attesa
6. **Galleria**: "Voi al Room 26", quattro storie verticali che scorrono di lato
7. **Chi è Luca**: il motto, la foto, il link
8. **Navetta**
9. **Capodanno**
10. **Estate**: le due tessere Ninfeo e Morgan
11. **Diventa PR**
12. **Come funziona**: i tre passi
13. **Modulo** di prenotazione

---

## 3. Tutti i testi

Stanno in tre file: `src/contenuti/sito.ts`, `locali.ts`, `canali.ts`.

### Marchio e identità

- Marchio su due righe: **LUCA** / **CALIFORNIA**
- Motto, tre righe: **NON IMPORTA CHI TU SIA** / **IMPORTA CHE TI** / **SAPPIA DIVERTIRE**
- Instagram: `lucacurella_ninfeo`
- WhatsApp: `393348548735` (da confermare con Luca prima di pubblicare)
- Locale d'inverno: **ROOM 26, ROMA**

### Menu

Serate, Locali, Navetta, Capodanno, Funzioni, Diventa PR, Chi sono.

### Apertura della home

- Occhiello: `GIOVEDÌ, VENERDÌ, SABATO, DOMENICA`
- Titolo su due righe: `LA NOTTE` / `TI DÀ LIBERTÀ`
- Sottotitolo: "Ciao, sono Luca. Liste e tavoli al Room 26 di Roma, da giovedì a
  domenica, con la navetta per arrivarci."
- Due azioni: "Entra in lista o prenota" e "Vedi le serate"

### Le quattro serate

Il nome della domenica si scrive **Báilame**, con l'accento: è la grafia del logo
della serata. Senza accento restano solo l'indirizzo (`/serate/bailame`) e i nomi
dei file.

| Codice | Giorno | Nome | Musica | Etichetta |
|---|---|---|---|---|
| `milkshake` | GIOVEDÌ | MILKSHAKE | AFRO E REGGAETON | LISTA APERTA |
| `venerdi` | VENERDÌ | COMMERCIALE | E REGGAETON | LISTA APERTA |
| `sabato` | SABATO | DUE SALE | HOUSE E REGGAETON | POCHI TAVOLI |
| `bailame` | DOMENICA | BÁILAME | SOLO REGGAETON | LISTA APERTA |

Le descrizioni, una per pagina:

- **Milkshake**: "Il giovedì è Milkshake: afro e reggaeton tutta la sera. Prenota
  qui e ti ricontatto io con disponibilità e prezzo."
- **Venerdì**: "Il venerdì si balla commerciale e reggaeton. Prenota qui e ti
  ricontatto io con disponibilità e prezzo."
- **Sabato**: "Il sabato il Room 26 apre due sale: house nella prima, reggaeton
  nella seconda. Dimmi dove vuoi stare e ti sistemo io."
- **Báilame**: "La domenica si chiude la settimana con Báilame: tutta la sera solo
  reggaeton. Prenota qui e ti ricontatto io con disponibilità e prezzo."

Ogni pagina serata mostra anche due voci: QUANDO (`OGNI GIOVEDÌ`, e così via) e
DOVE (`ROOM 26, ROMA`), poi il modulo, poi le altre tre serate.

Il sabato **non ha due pagine separate** per le due sale: è una serata sola, e la
sala si sceglie nel modulo.

### I tre locali

**Room 26**, Roma, stagione inverno.
Occhiello `D'INVERNO`, titolo `ROOM 26` / `ROMA`.
Sottotitolo: "Quattro sere a settimana, da giovedì a domenica".
Testo: "D'inverno lavoro qui, quattro sere a settimana. Ogni serata ha la sua
musica e il suo pubblico: scegli la tua e ti sistemo io, in lista o al tavolo."

**Ninfeo**, Roma, stagione estate.
Occhiello `D'ESTATE`, titolo `NINFEO` / `ROMA`.
Sottotitolo: "Ninfeo Village, al parco del Ninfeo, all'EUR".
Testo: "D'estate ci spostiamo qui, sotto gli alberi: stesso gruppo, stessa musica,
all'aperto. Il calendario della stagione lo pubblico quando è pronto: lasciami un
contatto e te lo dico io, prima che se ne accorgano gli altri."

**Morgan Beach Club**, Civitavecchia, stagione estate.
Occhiello `D'ESTATE`, titolo `MORGAN` / `BEACH CLUB`.
Sottotitolo: "Sul mare, a Civitavecchia".
Testo: "L'altra casa dell'estate, sul litorale: piscina, solarium e si balla fino
a tardi. Anche qui il calendario arriva quando è pronto: lasciami un contatto e
sei fra i primi a saperlo."

Le pagine estive non hanno un calendario: al suo posto c'è un modulo breve
"Avvisami quando apre". Solo la pagina del Room 26 elenca le serate e porta il
modulo di prenotazione completo.

**Nota importante:** le righe sul Ninfeo e sul Morgan vengono da fonti pubbliche
(il portale eventi del Comune di Roma e la stampa locale), non dal cliente. Vanno
confermate con lui. Niente indirizzi precisi, orari o prezzi finché non li dà lui.

### Come funziona, i tre passi

1. **SCEGLI LISTA O TAVOLO**: "Compili il form qui sotto in mezzo minuto."
2. **LUCA CONFERMA**: "Ti scrive su WhatsApp con disponibilità e prezzo."
3. **IL BIGLIETTO NEL TELEFONO**: "Lo aggiungi ad Apple Wallet o Google Wallet.
   All'ingresso mostri il QR, niente nomi da cercare in lista."

### Navetta

Occhiello `TI PORTIAMO NOI`, titolo `SERVIZIO NAVETTA`.
Testo: "Dalla tua zona al locale, e ritorno a fine serata. Niente macchina, niente
parcheggio, nessuno che deve restare sobrio per guidare."
Azione: "Chiedi la navetta".

### Capodanno

Occhiello `31 DICEMBRE`, titolo `CAPODANNO`.
Testo: "Solo a Capodanno lavoro con più strutture. Prezzi e strutture a breve."
Tre pacchetti, senza prezzo perché non c'è ancora:

- PACK 1: SERATA
- PACK 2: CENA + SERATA
- PACK 3: CENA, SERATA, HOTEL

Azione: `METTIMI IN LISTA D'ATTESA`.

### Special guest

Titolo: "SPECIAL GUEST IN ARRIVO". Testo: "Sii il primo a saperlo."
Azione: "AVVISAMI". Il calendario degli ospiti resta "in arrivo", per scelta.

### Estate, il riquadro in home

Occhiello `D'ESTATE`, titolo `NINFEO` / `E MORGAN`.
Testo: "D'estate ci spostiamo all'aperto: il Ninfeo all'EUR e il Morgan sul mare
a Civitavecchia."
Due tessere: NINFEO (Roma, all'EUR) e MORGAN (Civitavecchia, sul mare).

### Diventa PR

In home: occhiello `APERTE LE CANDIDATURE`, titolo `PER LA FIGURA DI` / `PR`,
testo "Formazione con me in due giorni: teoria e pratica dentro il locale.",
azione `CANDIDATI`.

Nella pagina, sopra il titolo c'è la riga `ALL WE HAVE IS NOW`, e sotto:
"Cerco nuovi PR per la mia squadra, a Roma e sul litorale. Non serve esperienza:
la formazione la faccio io, di persona."

**Perché farlo**, tre punti:

- FESTA E NETWORKING: "Lavori dove ti diverti e conosci gente nuova ogni settimana."
- GUADAGNO IMMEDIATO: "Provvigioni e bonus su liste e tavoli che porti."
- CRESCITA NEL NIGHTLIFE: "Impari il mestiere da chi lo fa da anni."

**La formazione**, due passi:

1. TEORIA: "Una giornata con me: come si costruisce una lista, come si gestiscono
   tavoli e clienti."
2. PRATICA: "Una serata vera, dentro il locale, accanto a me."

### Galleria

Occhiello `DALLE VOSTRE STORIE`, titolo `VOI AL ROOM26`, poi quattro immagini
verticali che scorrono di lato, e il bottone "Segui @lucacurella_ninfeo".

Le descrizioni delle quattro immagini (servono a chi non le vede, non sono
decorazione):

1. "Il dj alla consolle, con la sala illuminata di blu alle spalle"
2. "Due ragazze ridono in mezzo alla folla, sotto le luci"
3. "Una ragazza sorride guardando la pista"
4. "Due ragazze al bancone con i drink in mano"

Nel sito vero queste immagini le carica Luca dal pannello, e accanto compaiono i
post presi da Instagram. Oggi sono quattro fotogrammi del video del locale.

### Chi sono

Occhiello `CHI SONO`, poi il motto come titolo, la foto, e:
"Sono Luca Curella, PR e organizzatore di eventi a Roma. Ogni stagione scelgo un
locale solo e ci porto tutta la mia lista: d'inverno il Room 26, d'estate il
Ninfeo e il Morgan Beach Club."

In home la versione corta: "Sono Luca Curella. Ogni stagione scelgo un locale
solo, e ci porto tutta la mia lista." con il bottone "Chi è Luca".

### Piè di pagina

Il marchio grande su due righe, il link Instagram, poi Privacy e Cookie, poi
"Sito di satoshiweb.it".

### Pagina Funzioni

È la pagina che serve a Luca per capire cosa ha comprato. Occhiello `OLTRE AL SITO`,
titolo `COSA C'È` / `DIETRO`.

"Il sito è la parte che vede la gente. Dietro c'è il pannello da cui gestisci
tutto, il biglietto che finisce nel telefono dei clienti e gli strumenti per la
tua squadra."

**Il pannello**, sei schermate mostrate come mockup che scorrono di lato, ognuna
cliccabile:

| Nome | Descrizione | Porta a |
|---|---|---|
| OGGI | Liste, tavoli ed entrati della serata in corso | `/pannello` |
| RICHIESTE | Tutte quelle della settimana, divise per stato | `/pannello/richieste` |
| LA SINGOLA RICHIESTA | Confermi e parte il messaggio già scritto, col biglietto dentro | `/pannello/richieste/giulia-marchetti` |
| PORTA | Inquadri il QR e sai subito se passa | `/pannello/porta` |
| SERATE | Decidi cosa vede la gente sul sito | `/pannello/serate` |
| SQUADRA | I tuoi PR, le provvigioni e i compleanni | `/pannello/squadra` |

**Il biglietto nel telefono**, quattro punti:

- Il tuo logo, i tuoi colori e la grafica della serata
- Compare da solo sulla schermata di blocco la sera giusta
- All'ingresso mostra il QR: niente nomi da cercare nella lista
- Resta nel telefono anche dopo, con il tuo nome sopra

**Per la tua squadra**, tre punti:

- Prenotazioni del mese per ogni PR
- Provvigioni già calcolate
- Un argomento in più quando cerchi nuovi PR

---

## 4. Il modulo di prenotazione

È il cuore del sito. Sta in `src/componenti/sezioni/Modulo.tsx`.

Occhiello `IN 30 SECONDI`, titolo `ENTRA IN LISTA` / `O PRENOTA`.

### I campi

**Sempre:**

| Campo | Tipo | Nota |
|---|---|---|
| Cosa vuoi | scelta fra `LISTA` e `TAVOLO` | due bottoni affiancati |
| Nome | testo | obbligatorio, `autocomplete="given-name"` |
| Cognome | testo | obbligatorio, `autocomplete="family-name"` |
| Telefono | testo | obbligatorio, `inputmode="tel"` |
| Serata | scelta fra cinque | vedi sotto |

Le cinque serate del modulo (il sabato qui si sdoppia nelle due sale):
`Gio Milkshake`, `Ven commerciale`, `Sab sala 1 house`, `Sab sala 2 reggaeton`,
`Dom Báilame`.

**Solo se ha scelto TAVOLO:**

| Campo | Opzioni |
|---|---|
| Chi c'è al tavolo | Solo ragazzi, Solo ragazze, **Misto** (preselezionato) |
| Budget a testa | **25–30 €** (preselezionato), 35–50 €, Oltre 50 € |
| Occasione speciale | Compleanno, Laurea, Diciottesimo, Addio al nubilato, Addio al celibato, Anniversario, **Nessuna** (preselezionata) |
| Altre richieste | testo libero, segnaposto "Torta, bottiglia, decorazioni..." |

**Mai:** il numero di persone. È una richiesta esplicita del cliente.

### Comportamento

- Con `?tipo=tavolo` o `?tipo=lista` nell'indirizzo il modulo si apre già sulla
  scelta giusta. Serve ai due bottoni della barra fissa in basso.
- La validazione è per campo, in italiano, e l'errore compare sotto il campo:
  "Scrivi il tuo nome", "Scrivi il tuo cognome", "Serve un numero per
  ricontattarti", "Questo numero sembra incompleto" (meno di 9 cifre).
- Al primo errore il fuoco va sul primo campo sbagliato, non resta sul bottone.
- Bottone: "Invia la richiesta", che diventa "Un attimo..." mentre manda.
- Sotto il bottone: "La richiesta arriva direttamente a Luca. Quando conferma,
  ricevi il biglietto da aggiungere al Wallet."
- E poi: "I tuoi dati servono solo a ricontattarti: come li trattiamo." con il
  link alla privacy.

### Dopo l'invio

Titolo `RICHIESTA` / `INVIATA`, occhiello `CI SIAMO`, e:
"Luca la vede e ti scrive su WhatsApp con disponibilità e prezzo."
Più la riga che oggi è vera: "Questa è un'anteprima del sito: la richiesta non
viene conservata."

### La barra fissa in basso, su telefono

Due bottoni: **PRENOTA** porta a `?tipo=tavolo#prenota`, **LISTA** a
`?tipo=lista#prenota`. Portano al modulo della pagina in cui sei, se quella pagina
ce l'ha (`/`, `/serate`, `/serate/*`, `/navetta`, `/capodanno`), altrimenti alla home.

Prima portavano tutti e due allo stesso punto, e chi voleva solo entrare in lista
si trovava davanti le domande sul budget.

### I moduli brevi

Oltre al modulo grande ce ne sono di corti, tutti con nome più un contatto:

- **Special guest** e **Capodanno**: nome, telefono o email
- **Ninfeo** e **Morgan**: uguali, per la lista d'attesa della stagione
- **Navetta**: nome, telefono, serata, "Da dove parti" (zona o quartiere). Qui il
  cognome non si chiede: è un modulo che si compila mentre si sta già uscendo.

---

## 5. Le API

Tutte con `runtime = "nodejs"` e `dynamic = "force-dynamic"`.

### `POST /api/richiesta`

Riceve lista, tavolo o navetta. Valida tipo, nome, cognome, telefono, serata, e
per la navetta anche la zona. Il telefono deve avere almeno 9 cifre. Lunghezze
massime: nome e cognome 60, telefono 30, serata 60, zona 80, note 300.

Aggiunge la provenienza letta dal cookie e restituisce
`{ salvata: false, nota, ricevuta: {...} }`. **Non salva niente.** Rimanda indietro
la richiesta come l'ha capita, così si può verificare che arrivi completa senza un
database. Non parte nessun messaggio: quelli li manda Luca.

### `POST /api/lista-attesa`

Quattro tipi ammessi: `special_guest`, `capodanno`, `ninfeo`, `morgan`.
Nome più un contatto, che può essere un'email (contiene `@`) o un telefono
(almeno 9 cifre). Stessa risposta, non salva.

### `POST /api/conferma`

È il gesto che fa Luca dal pannello. Prende nome cliente, telefono, serata, data
e ora d'inizio, tipo, locale e sala facoltativa. Genera un serial number nuovo,
crea il token cifrato, e restituisce tre cose:

- `linkBiglietto`: `https://.../api/pass/<token>`
- `linkWhatsapp`: `https://wa.me/<numero>?text=...`
- `messaggio`, che è questo:

```
Ciao <Nome>, sei dentro per <SERATA> di <domenica 27 settembre>.
<TIPO>.

Questo è il tuo biglietto, aprilo con Safari e aggiungilo al telefono:
<link>

All'ingresso fai vedere il QR e passi.
```

Il numero viene normalizzato per `wa.me`: da "334 854 8735" a "393348548735".

### `POST /api/verifica`

Riceve un token letto dal QR e restituisce solo l'esito: valido oppure no, e se
valido nome, tipo, serata, locale e sala. **La chiave resta sul server**: il
telefono alla porta manda il token e riceve l'esito, così nessuno può ricavare la
chiave guardando il codice della pagina.

Oggi non può sapere se un biglietto è già passato, perché non c'è un archivio.

### `GET /api/pass/[token]`

Restituisce il file `.pkpass` firmato. Il token è la prenotazione: se si apre, la
prenotazione esiste. Non c'è uno stato da controllare, perché il token si crea solo
al momento della conferma e senza la chiave non se ne può fabbricare uno.
Se il token non è valido: 404. Negli errori finisce solo il messaggio, mai niente
dei certificati.

### `GET /api/pass/demo`

Il biglietto finto. Risponde 404 finché `ABILITA_PASS_DEMO` non vale `1`.
Va acceso solo sul deploy di prova, e i dati finti vivono in un file solo
(`src/lib/pass/demo.ts`), da cancellare quando ci sarà il database.

### `POST /api/pannello/accesso`

Una password sola. Vedi sezione 7.

---

## 6. I link di provenienza

Servono a Luca per capire da dove arriva la gente.

Percorsi corti riconosciuti, elenco chiuso:

| Percorso | Nome che compare | Alias |
|---|---|---|
| `/ig` | Bio Instagram | `/instagram` |
| `/s` | Storie Instagram | `/storie` |
| `/tt` | TikTok | `/tiktok` |
| `/wa` | WhatsApp | `/whatsapp` |

E ogni PR ha il suo: `/marco`, `/sara`, `/davide` danno "Link di Marco" e così via.

Come funziona: il percorso corto **non è una pagina**. Segna un cookie e manda
subito alla home pulita (307), così nell'indirizzo del browser resta il sito e non
il codice del canale, che sennò finirebbe in ogni link condiviso.

- Nome del cookie: `da`
- Durata: 30 giorni (chi vede una storia oggi può prenotare fra due settimane)
- `HttpOnly; Secure; SameSite=Lax`
- Chi arriva digitando l'indirizzo risulta "Diretto", che è la verità

L'elenco è chiuso apposta: un indirizzo non previsto dà 404, altrimenti qualsiasi
parola dopo la barra diventerebbe un canale e i conteggi si riempirebbero di
spazzatura.

La provenienza viene allegata alla richiesta quando la persona prenota. **Nel
pannello non si mostra più da nessuna parte**: è stata tolta perché in mezzo alle
altre informazioni faceva rumore. Il dato resta perché il conteggio per canale è
una funzione promessa.

---

## 7. Il pannello

Si installa sulla schermata home del telefono come un'app (c'è il manifest, con
`start_url` e `scope` su `/pannello`).

### L'accesso

Una password sola, quella che Luca dà a chi deve entrare.

Nel cookie non finisce la password ma la sua firma HMAC-SHA256: chi legge il
cookie non può ricavarla, e chi lo cambia non può fabbricarne uno valido.
Cambiando la password scadono da sole tutte le sessioni aperte, perché la firma
non torna più. Durata 12 ore. Confronto a tempo costante.

**Blocco dei tentativi:** 5 tentativi sbagliati per IP, poi 10 minuti fuori.
Il blocco si controlla **prima** della password: chi ha davvero dimenticato deve
sapere che deve aspettare, non credere di averla riscritta male. Durante il blocco
fallisce anche la password giusta. Risponde 429 con `Retry-After`.

### Le schermate

**Oggi.** Occhiello `OGGI · <giorno>`, titolo con la serata, l'etichetta IN CORSO,
tre numeri (in lista, tavoli, entrati), il bottone "Apri la porta", poi
"Da confermare · N nuove" con le richieste, e in fondo due numeri: compleanni in
arrivo e in attesa Capodanno.

**Richieste.** Filtri "Nuove N", "Confermate N", "Tutte". Ogni riga: nome, stato,
serata e sala, tipo, budget, il messaggio del cliente in corsivo, e l'ora in cui
è stato inviato il biglietto.

**La singola richiesta.** Nome, telefono cliccabile, poi serata, tipo, budget e
occasione. Il messaggio del cliente fra virgolette. Poi il componente "Conferma e
scrivi", che chiama `/api/conferma` e apre WhatsApp col messaggio già pronto.
In fondo le **note private**, visibili solo a Luca.

**Porta.** Il lettore di QR prende tutto lo schermo, perché all'ingresso serve solo
quello. Sopra resta il conteggio `entrati / attesi`. Sotto, per chi scorre: "Se il
QR non si legge" con il link per cercare a mano, e gli ultimi ingressi.
Il lettore usa **jsQR**, perché iOS non ha `BarcodeDetector`.

**Serate.** Gli interruttori delle etichette (Lista aperta, Pochi tavoli, Tutto
pieno), cioè "cosa vede la gente sul sito". Più i due contatori delle liste
d'attesa: special guest e Capodanno, con i bottoni "Aggiungi un ospite" e
"Pubblica i pacchetti".

**Squadra.** Per ogni PR: nome, prenotazioni del mese, il suo link con il tasto
copia, e tre numeri (liste, tavoli, provvigioni in euro). Poi "Compleanni in
arrivo", con cosa aveva preso la persona l'anno prima e il bottone per scriverle
su WhatsApp.

### I dati

**Sono tutti di esempio**, e ogni schermata lo dichiara a schermo. Stanno in un
punto solo, `src/lib/pannello/dati.ts`, che è il punto unico di ingresso: le
schermate chiamano quelle funzioni e non sanno da dove arrivano i dati. Domani
interrogano Supabase e le schermate non cambiano di una riga.

Le funzioni esposte: `stasera()`, `richieste(stato?)`, `richiesta(id)`, `serate()`,
`listeDiAttesa()`, `squadra()`, `compleanni()`, `ultimiIngressi()`, più la costante
`DATI_DI_ESEMPIO`.

La forma di una richiesta: id, nome, telefono, quando, serata, sala, tipo
(lista o tavolo), gruppo, budget, occasione, messaggio, provenienza, stato
(nuova, confermata, in attesa, rifiutata), note private, ora di invio del biglietto.

---

## 8. Il biglietto Apple Wallet

Questa è la parte più delicata e quella già funzionante: è stata provata su un
iPhone vero e il biglietto si aggiunge al Wallet.

### Come è fatto

Libreria: **passkit-generator 3.6.1**. Tipo di pass: `eventTicket`.
Va tenuta fuori dal bundle del server (`serverExternalPackages`), perché usa
node-forge e le API di Node.

I campi del biglietto, nell'ordine in cui li vede il cliente:

| Posizione | Etichetta | Valore |
|---|---|---|
| Intestazione | DATA | la data della serata, stile medio, senza ora |
| Primario | SERATA | il nome della serata |
| Secondari | TIPO, NOME | "TAVOLO, MISTO" e il nome del cliente |
| Ausiliari | LOCALE, SALA, DALLE | nome del locale, sala se c'è, ora d'inizio |
| Retro | DOVE, INSTAGRAM, ALL'INGRESSO | indirizzo, `@lucacurella_ninfeo`, "Mostra questo QR all'ingresso" |

Dettagli che sono costati tempo e vanno tenuti:

- **Niente `logoText`.** iOS scrive `logoText` e il campo intestazione sulla stessa
  riga, e con un nome lungo si toccano: sul telefono si leggeva
  "LUCA CALIFORNIA26 Sep 2026". Il nome sta **dentro l'immagine del logo**.
- **L'indirizzo compare solo se c'è.** Un campo con scritto "da confermare" sul
  biglietto di un cliente è peggio di un campo che non c'è.
- L'ora sta fra i campi ausiliari e non nell'intestazione: riempie la riga che
  resterebbe mezza vuota, e a chi legge serve più del giorno, che è già in alto.
- `suppressStripShine` attivo: il riflesso lucido di serie è un tocco datato.
- Si impostano **tutte e due** le forme della data rilevante (`setRelevantDate` e
  `setRelevantDates`): la prima è deprecata da iOS 18 ma serve ai telefoni vecchi.
  È quella che fa comparire il biglietto in blocco schermo la sera giusta.

I locali nel biglietto (`src/lib/pass/tipi.ts`):

- `room26`: "Room 26, Roma", indirizzo "Piazza Guglielmo Marconi 31, 00144 Roma"
- `ninfeo`: "Ninfeo, Roma", indirizzo vuoto
- `morgan`: "Morgan Beach Club, Civitavecchia", indirizzo vuoto

### Il token dentro il QR

**È cifrato, non solo firmato.** Senza database il token deve portarsi dietro la
prenotazione, e un token solo firmato si legge lo stesso: chiunque inquadri il QR
di un altro vedrebbe nome e cognome. Cifrando, chi non ha la chiave vede una
sequenza senza senso.

- Algoritmo: **AES-256-GCM**, che nasconde e autentica insieme. Cambiare un solo
  carattere fa fallire la verifica del sigillo: non si può né falsificare né
  modificare.
- Formato: `base64url(iv || sigillo || cifrato)`, con iv di 12 byte e sigillo di 16.
- Chiave: ricavata da `SEGRETO_BIGLIETTO` con `scryptSync` e un **sale fisso**
  (`luca-california-biglietto-v1`). Il sale deve restare fisso, altrimenti la
  chiave cambia a ogni avvio e i biglietti già emessi smettono di aprirsi.
- Contenuto, con nomi di un carattere per accorciare il QR:
  `i` serial number, `n` nome cliente, `s` serata, `q` inizio in ISO, `t` tipo,
  `l` codice locale, `a` sala (facoltativa).
- Lunghezza risultante misurata: fra 187 e 211 caratteri.
- Serial number: 9 byte casuali in base64url.
- `leggiToken` restituisce `null` in ogni caso di errore: chi chiama deve sapere
  solo se è valido, non perché non lo è.

### I certificati

Catena: certificato Pass Type ID, più il WWDR G4 di Apple, più la chiave privata.

Due strade per trovarli, in quest'ordine:

1. variabili d'ambiente in base64 (è così su Vercel)
2. file PEM nella cartella `certs/` (è così sul Mac mentre si sviluppa)

`certs/` è esclusa da git e da Vercel. Il contenuto non finisce mai nei log:
negli errori compare solo il nome del file che manca.

**Come si preparano** (strada con `openssl`, quella usata davvero):

1. Registrare il Pass Type ID sul portale Apple. I Pass Type ID non si cancellano
   più, quindi va scelto bene il nome. Qui: `pass.it.satoshiweb.lucacalifornia`.
2. Generare chiave e CSR:
   `openssl req -new -newkey rsa:2048 -keyout certs/signerKey.pem -out certs/LucaCalifornia.certSigningRequest -subj "/CN=Luca California Pass/emailAddress=.../C=IT"`
   La password chiesta da openssl diventa `PASS_SIGNER_KEY_PASSPHRASE`.
   Poi `chmod 600 certs/signerKey.pem`.
3. Caricare la CSR sul portale, scaricare `pass.cer`, convertirlo:
   `openssl x509 -inform DER -in certs/pass.cer -out certs/signerCert.pem`
4. Scaricare il WWDR G4 da `apple.com/certificateauthority/AppleWWDRCAG4.cer` e
   convertirlo in `certs/wwdr.pem`.
5. Verificare: nel `subject` deve comparire il Pass Type ID e, nel campo `OU`, il
   Team ID. I moduli del certificato e della CSR devono dare lo stesso md5.

**Due trappole, entrambe incontrate davvero:**

- **Non passare da Accesso Portachiavi.** Su questo Mac l'Assistente certificato
  fallisce con "The specified item could not be found in the keychain".
- **`signerKey.pem` non si può rigenerare.** Se si perde, il certificato di Apple
  diventa carta straccia e si rifà tutto da capo. Va tenuta una copia nel gestore
  password.

**Rinnovo:** il certificato del pass **scade il 22 ottobre 2027**. Quando scade i
biglietti già nel Wallet restano, ma non se ne generano di nuovi (la rotta risponde
500). Un mese prima si rifanno i passi 2 e 3 con una CSR nuova, si riconverte in
base64, si aggiornano le variabili su Vercel e si ripubblica.
Il WWDR G4 dura fino al 10 dicembre 2030.

### Le immagini del pass

Stanno in `assets/pass/`, e vanno dichiarate in `outputFileTracingIncludes` perché
Vercel includa nella funzione i file che non riesce a tracciare leggendo il codice.

| File | Misura | Cos'è |
|---|---|---|
| `icon.png` `@2x` `@3x` | 29, 58, 87 | Icona nelle notifiche, marchio su piastrella |
| `logo.png` `@2x` `@3x` | 50, 100, 150 | Marchio più il nome, in alto a sinistra |
| `strip.png` `@2x` `@3x` | 375x123, 750x246, 1125x369 | La fascia dietro i campi |

Sulla **strip**: ci va la grafica della serata. Lo script che la prepara stende
una sfumatura scura sulla sinistra, e non è un vezzo: iOS scrive il nome della
serata in bianco sopra quella fascia, e il nome è grande, su un telefono copre
quattro quinti della larghezza. Senza la sfumatura, su una foto chiara il nome
sparisce. Così qualunque immagine arrivi dal cliente è utilizzabile senza ritocchi.

Gli script non sovrascrivono la strip se esiste già: lì ci va la grafica vera, e
il build non deve mangiarla.

---

## 9. I materiali

### Loghi (in `materiale/` e `public/loghi/`)

- `luca-curella-orizzontale-bianco.png` e la versione nera
- `luca-curella-simbolo-bianco.png` e la versione nera
- `marchio-orizzontale.png`, usato nella testata del sito
- `marchio-filigrana.svg`
- `icona-192.png` e `icona-512.png` per il manifest

Il marchio è **un quadrato pieno con due tagli triangolari trasparenti**. È
descritto anche come path SVG in `scripts/genera-immagini.mjs`, in viewBox 0 0 100 100:

```
M0 0 H100 V100 H0 Z M0 0 L100 24.7 L100 46.4 Z M0 0 L100 75 L50 100 Z
```

### Foto

- `public/foto/copertine/`: `milkshake.jpg`, `venerdi.jpg`, `sabato.jpg`,
  `bailame.jpg`, le quattro copertine delle serate
- `public/foto/storie/storia-1..4.jpg`: le quattro verticali della galleria
- `public/foto/luca-bailame-media.jpg`: la foto di Luca
- `public/foto/pannello/*.webp`: i sei mockup delle schermate del pannello
- `public/foto/biglietto.webp`: l'anteprima del biglietto
- `public/anteprima.jpg`: l'immagine 1200x630 per la condivisione
- `materiale/foto-sala.png`: la foto del soffitto del locale, usata per la strip

### Video

`public/video/`, due tagli dello stesso filmato del Room 26:

- `apertura-telefono.mp4` / `.webm` / `.jpg`, taglio verticale
- `apertura-computer.mp4` / `.webm` / `.jpg`, taglio orizzontale

Due tagli perché il filmato è verticale: allargato su un computer si ingrandisce
fino a sgranare, stretto su un telefono taglia via metà scena.

Il fotogramma fermo serve come poster mentre il video arriva, e serve da solo a
chi ha chiesto meno movimento nelle impostazioni del telefono.

Compressione: la scena è scura e ci sta sopra una sfumatura, quindi crf 36 per
l'mp4 (libx264) e 55 per il webm (libvpx-vp9) sono indistinguibili da valori più
generosi e pesano quasi la metà.

Il secondo di partenza scelto è il **7**: le strutture del soffitto coi fasci blu,
senza nessuno in campo. Il montaggio è serrato, gli stacchi durano meno di un
secondo, e quel fotogramma è la prima cosa che si vede aprendo il sito.

### Gli script che generano i materiali

Tutti in `scripts/`, con **sharp** per le immagini e **ffmpeg** per i video.

| Script | Cosa fa |
|---|---|
| `genera-immagini.mjs` | Le icone del pass dal marchio SVG. Non tocca logo e strip. |
| `genera-logo.mjs` | Compone il logo del pass: marchio ritagliato dal file ufficiale più il nome su due righe |
| `genera-strip.mjs` | Prepara la fascia del biglietto da un'immagine, nelle tre densità, con la sfumatura |
| `genera-apertura.mjs` | I due tagli del video più i fotogrammi fermi |
| `genera-anteprima-social.mjs` | L'immagine 1200x630 per la condivisione |
| `genera-anteprima-biglietto.mjs` | Disegna l'anteprima del biglietto per la pagina Funzioni |
| `prova-token.ts` | Prova cifratura e lettura del token senza costruire il progetto |

L'anteprima del biglietto è **disegnata e non fotografata** perché il biglietto lo
compone iOS dentro l'app Wallet: sul Mac non c'è niente che lo apra. Usa i pezzi
veri (logo, strip, colori, campi), quindi non è un mockup inventato, è lo stesso
materiale rimontato. Se arriva uno scatto da un telefono vero, si sostituisce il file.

**Due trappole degli strumenti**, incontrate davvero:

- **ffmpeg non ha il codificatore webp** su questo Mac: per le webp si usa
  `img2webp` da libwebp, che **vuole `-lossy`**, altrimenti produce file enormi
  (12,9 MB invece di poche centinaia di KB).
- Il comando `npm run build` non deve rigenerare le immagini: rigenerandole
  cancellava il logo composto a mano.

---

## 10. Variabili d'ambiente

Nessuna di queste sta nel codice. L'elenco completo è in `.env.example`.

| Nome | A cosa serve |
|---|---|
| `PASS_TYPE_IDENTIFIER` | Il Pass Type ID registrato su Apple |
| `APPLE_TEAM_IDENTIFIER` | Il Team ID dell'account Apple Developer |
| `PASS_SIGNER_CERT_BASE64` | Il certificato del pass, PEM in base64 |
| `PASS_SIGNER_KEY_BASE64` | La chiave privata, PEM in base64 |
| `PASS_WWDR_BASE64` | Il WWDR G4, PEM in base64 |
| `PASS_SIGNER_KEY_PASSPHRASE` | La password della chiave |
| `SEGRETO_BIGLIETTO` | La chiave con cui si cifrano i token del QR, almeno 16 caratteri |
| `PANNELLO_PASSWORD` | La password del pannello, almeno 8 caratteri |
| `ABILITA_PASS_DEMO` | `1` accende il biglietto finto, altrimenti 404 |
| `SITO_PUBBLICO` | `1` toglie il noindex e apre il sito ai motori |
| `INDIRIZZO_SITO` | L'indirizzo per i link assoluti |

**Trappola di `SITO_PUBBLICO`:** viene letta **quando il sito viene costruito**,
non quando gira. Cambiarla su Vercel senza ripubblicare non produce nessun effetto.
Comanda insieme il `noindex` delle pagine e il `robots.txt`, così non può capitare
di togliere il noindex e lasciare il robots che blocca tutto.

---

## 11. Come è fatto trovare

- `<html lang="it">`.
- Titolo: "Luca California, liste e tavoli al Room 26 di Roma".
- Descrizione: "Liste e tavoli al Room 26 di Roma, da giovedì a domenica, con la
  navetta per arrivarci. Prenoti in mezzo minuto e il biglietto ti arriva nel telefono."
- `og:image` 1200x630 assoluta. Senza, il link condiviso su WhatsApp arriva nudo, e
  un link nudo sembra sospetto. Luca lo manderà centinaia di volte.
- **`robots.txt` lascia leggere anche in anteprima**, e non è una svista:
  `Disallow: /` non tiene una pagina fuori dai risultati, impedisce di leggerla e
  quindi impedisce anche di vedere il `noindex` che sta dentro. Il risultato è il
  contrario di quello che si vuole. A tenere fuori il sito è il `noindex`, che però
  va letto per funzionare. Restano bloccati solo `/pannello`, `/biglietto`,
  `/staff` e `/api`.
- **`llms.txt`** per i motori che rispondono con l'AI: quelli non eseguono il
  codice, leggono il sorgente. Lì trovano in chiaro chi è Luca, dove lavora, che
  serate fa e come si prenota. È generato dalle stesse liste che fanno il sito,
  quindi si aggiorna da solo.
- **Dati strutturati** schema.org: un `WebSite` e una `Person` (Luca Curella, in
  arte Luca California, PR e organizzatore di eventi, Roma e Civitavecchia).
  Solo fatti verificabili: niente indirizzi o orari finché non li dà lui, perché un
  dato strutturato sbagliato è peggio di uno assente, dato che quello lo copiano.
- Lighthouse da telefono, a interruttore acceso: 100 su accessibilità, best
  practices, SEO e agentic browsing.

---

## 12. Sicurezza

- **Intestazioni** su tutte le risposte: CSP, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`,
  `Permissions-Policy: geolocation=(), microphone=()`.
  La CSP tiene `'unsafe-inline'` sugli script perché Next mette in pagina i dati per
  l'idratazione come script in linea: toglierlo richiede i nonce e rompe la pagina.
  Vale comunque, perché blocca il caricamento di script da domini esterni.
- **Regola sul bordo (Vercel Firewall):** 60 richieste al minuto per IP su tutto
  `/api/`, poi un minuto fuori. Protegge i limiti del piano buttando via la
  richiesta prima che diventi un'invocazione a pagamento. Provata con 70 richieste:
  il 403 arriva dalla 58ª.
  Non stringere di più: con 20 al minuto si blocca per dieci minuti una persona che
  sta solo usando il pannello, perché aprirlo fa 4 o 5 chiamate e ogni visita al
  sito ne fa 2 o 3.
- **Blocco dei tentativi** nella funzione: 5 per IP, poi 10 minuti. Va messo nella
  verifica condivisa e non solo su `/api/pannello/accesso`, altrimenti chi vuole
  indovinare bussa a un altro endpoint.

Le due protezioni servono entrambe: il blocco dei tentativi da solo non salva i
limiti (la funzione viene invocata comunque), la regola sul bordo da sola non ferma
chi attacca da molti indirizzi.

---

## 13. Cosa non è fatto

### Manca il database

È il buco più grosso, e da lì dipendono quasi tutti gli altri:

- i moduli **non salvano niente**, controllano e confermano ma non conservano
- i dati del pannello sono **tutti di esempio**
- la porta **non può sapere se un biglietto è già passato**: l'esito è solo valido
  o non valido
- i link personali dei PR non contano ancora niente
- le liste d'attesa (special guest, Capodanno, Ninfeo, Morgan) non conservano i
  contatti

La scelta era Supabase. Il punto unico di ingresso è già pronto
(`src/lib/pannello/dati.ts`): le schermate non cambiano.

### Manca il materiale dal cliente

- **Foto vere del Ninfeo e del Morgan.** Oggi sono due tessere disegnate, perché
  online esistono solo immagini di giornali e social, tutte protette. Un riquadro
  vuoto sembrerebbe un'immagine non caricata.
- **Le foto vere delle serate**, una per serata.
- **L'indirizzo del Room 26** confermato da lui.
- **Prezzi e strutture del Capodanno.**
- **I testi legali veri.** Privacy e cookie oggi sono testi di servizio che
  dichiarano di essere un'anteprima.
- **Conferma del numero WhatsApp.**
- **Le storie vere dei clienti** per la galleria.

### Manca ancora da costruire

- **Google Wallet** per Android. Rimandato dal cliente, ma il sito lo promette già
  in due punti ("Su Android la stessa cosa con Google Wallet").
- **Il flusso Instagram automatico**: oggi le immagini sono a mano.
- **Il calendario degli special guest**: per ora resta "in arrivo", per scelta.

### Debiti tecnici da sapere

- Il biglietto finto (`src/lib/pass/demo.ts` e la sua rotta) va cancellato quando
  arrivano i dati veri, e `ABILITA_PASS_DEMO` va spento.
- La testata del sito non è fissa e il menu su telefono è ancora quello di serie di
  `<details>`: è lavoro di grafica, quindi fuori da questo documento, ma va rifatto.

---

## 14. Errori già fatti, da non rifare

Sono costati tempo tutti quanti.

- **`Disallow: /` in anteprima.** Blocca la lettura e quindi anche il `noindex`, e
  impedisce a chiunque di controllare il sito automaticamente.
- **`SITO_PUBBLICO` cambiata senza ripubblicare.** Non ha nessun effetto: si legge
  alla costruzione, non all'esecuzione.
- **Due video hero nel markup con uno nascosto dal CSS.** Il browser li scarica
  tutti e due: 1070 KB invece di 519. Il taglio lo deve scegliere il codice.
- **Il tag `<video>` aggiunto da JavaScript.** Non compare nel sorgente, e i
  lettori automatici non eseguono il codice.
- **`npm run build` che rigenerava le immagini** e cancellava il logo composto a mano.
- **`img2webp` senza `-lossy`**: 12,9 MB.
- **`logoText` nel pass**: si sovrappone al campo della data.
- **`node --check` non vede un commento a blocco lasciato aperto**: si mangia la
  funzione sotto ed è codice valido. Il difetto lo trova solo la console del browser.
- **Misurare il peso della pagina dopo aver cambiato il viewport**: si contano due
  volte le risorse. Va ricaricato prima.

---

## 15. Domande aperte per il cliente

Queste nessun file le può rispondere:

1. Vuole davvero il Google Wallet, e con che tempi?
2. Le provvigioni dei PR le calcola il sistema o le decide lui caso per caso?
3. La navetta è un servizio suo o appoggiato a terzi? Cambia cosa può promettere
   il sito.
4. Chi scrive i testi legali veri, e chi è il titolare del trattamento?
5. Quanti PR ci saranno davvero, e i tre nomi attuali (Marco, Sara, Davide) sono
   reali o segnaposto?
6. Il pannello lo useranno anche i PR o solo lui? Cambia se serve più di una
   password.
