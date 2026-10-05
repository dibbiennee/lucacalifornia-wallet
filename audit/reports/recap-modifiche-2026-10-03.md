# Recap delle modifiche, 3 ottobre 2026

Stato: tutto, sezioni A e B comprese, è ora online (ultimo deploy `38b3a27`). La sezione F elenca le modifiche fatte dopo il primo recap.

## A. Già online (commit pushati e deployati)

| Commit | Cosa |
|---|---|
| `7ec6c6b` | Assistente (chat) rivisto, hero più leggera, menu fluido con testata fissa, card ritagliate, prefisso telefonico internazionale in tutti i campi, sistema dei colori |
| `868fb42` | Tasti Tavolo, Bracciale e Lista del menu chiudono il menu. Modulo a gradini anche per il tavolo (budget e occasione dopo "Avanti"). Pagina di conferma dopo l'invio con riepilogo e info utili. Chat su ogni pagina |
| `7e857ab` | Musica con tasto sul video. Il tipo di prenotazione (tavolo, bracciale, lista) dal menu segue il tasto premuto anche stando già su /prenota. Prima anteprima social nuova |
| `aaa4563` | La musica è un file a parte: passa il drop, resta accesa scorrendo, tasto fisso per spegnerla |
| `fdbeb03` | Pannello: barra Conferma/Rifiuta ancorata al fondo, schede in basso attaccate |
| `1756a31` | Link del biglietto Wallet corto: `/api/b/<serie>` (circa 44 caratteri invece di circa 300) |
| `67825ff` | Anteprima social nuova ("Tu scegli la serata. Io ti faccio entrare."), anteprima del link del biglietto col loghetto, barre del pannello senza sfocatura, eccezione robots per le anteprime |
| `316a082` | Pagina Contatti (mail e telefono) con voce di menu, e messaggi WhatsApp di Luca più curati (blocchi, grassetto, emoji, firma) |

**Dati di Production (non è codice):** ho cancellato le 13 richieste di prova, le 3 iscrizioni di prova in lista d'attesa, tutto il traffico (Analytics, 191 righe) e i 39 contatori anti-abuso. Non ho toccato PR, account, iscrizioni push ed eventi speciali. Il file con l'accesso al database è stato cancellato subito dopo.

## B. Fatto e provato in locale, non ancora online

### 1. Righe brutte nei testi (la tua segnalazione sui titoli spezzati)
- **Causa:** i titoli dei fogli ("Ti avviso appena esce il programma") andavano a capo come capitava, con "IL" da solo su una riga. Mancavano anche regole per "è", "ho", "ha".
- **Fogli "Avvisami" (Halloween, Capodanno):** le righe del titolo le decido io (`Ti avviso|appena esce|il programma`) e il corpo si adatta alla riga più lunga. Provato a 320, 360, 390 e 430 px: nessuna riga con parola breve a fine riga, nessuna parola sola in fondo, nessuna sovrapposizione con la X.
- **Foglio candidatura:** "Raccontami / di te" su due righe.
- **Ovunque:** "è", "ho", "ha" non restano più a fine riga; i titoli di pagina si bilanciano; spiegazioni dei fogli, liste della navetta, prezzo del bracciale e "Guarda qui" hanno le parole legate.
- **Controllo sistematico:** ho scritto un controllo che scorre tutte le pagine, i fogli, il menu e la chat a 8 larghezze (da 320 a 1440 px) e segnala parole brevi a fine riga, parole sole in fondo, pulsanti su due righe e testi che escono dallo schermo. Primo giro: 38 segnalazioni distinte. Dopo le correzioni: **zero**. Resta solo "Venerdì / DRIP" nella pagina della serata, che è voluto (giorno sopra, nome sotto).
- **Bug vero trovato lungo la strada:** sotto i 340 px il campo telefono usciva dallo schermo (nei moduli e nei fogli). Sistemato.

### 2. Desktop
- **Home, "Le serate":** al posto delle quattro strisce che tagliavano la grafica, quattro locandine intere una accanto all'altra, con giorno nel suo colore, nome e musica, e un leggero movimento al passaggio del mouse. Sul telefono restano le righe.
- **/serate:** tolta la sezione "Voi al ROOM26" (foto sgranate dalle storie). Al suo posto un mosaico di 8 foto nitide alternate Bàilame e ROOM26, in quattro colonne sfalsate, con i tre link (Telegram Bàilame, Telegram ROOM26, Instagram).
- **/chi-sono:** titolo, testo e bottone in alto a sinistra; foto a destra, agganciate in alto. Prima il testo stava in mezzo alla colonna e il titolo occupava cinque righe enormi.
- **/tavoli:** titolo più contenuto (due righe), foto più stretta, riquadri dei punti meno alti, domande frequenti su due colonne invece di una striscia con il vuoto a destra. Lo stesso criterio vale per le altre pagine con titolo lungo.
- **Modulo /prenota:** dal computer ti accompagna: con Invio, scegliendo la data o premendo "Avanti" il fuoco va al primo campo del gruppo che si apre, e il gruppo si porta al centro dello schermo. Non ruba il fuoco mentre scrivi e non fa niente sul telefono (non apre la tastiera). Provato: 7 prove su 7.

### 3. Pannello dei PR
- **Gestisci non apre più la tastiera:** il foglio non porta il fuoco sul campo "cambia il codice".
- **Password semplici:** da `XXXX-XXXX-XXXX-XXXX` a tre parole italiane e un numero, per esempio `olio-violino-pasta-77`. 293 parole × 90 numeri, circa 2,2 miliardi di combinazioni, più il blocco dopo 5 tentativi. Le password già date restano valide.
- **Messaggio con l'accesso:** "Copia il messaggio per Lorenzo" copia un testo completo: indirizzo `/pannello`, istruzione di toccare "Sei un PR? Entra con il tuo nome" (senza, il campo del nome non si vede), nome e password, avviso sulla guida per la Home e link per le prenotazioni. Vale sia da "Gestisci" sia da "Nuovo PR".
- **Guida "Aggiungi alla Home":** quando un PR entra dal telefono si apre da sola una volta, con i passaggi giusti per iPhone Safari, iPhone Chrome, Android Chrome, Samsung Internet e Firefox (preselezionati in base al suo telefono), più il consiglio di non aprirlo da dentro WhatsApp. Poi resta un riquadro in cima finché non preme "Fatto". Da computer non compare. Provato su 5 telefoni simulati: 20 prove su 20.
- **Il pannello si può installare:** manifest dedicato (`/pannello/manifest.webmanifest`) e meta per iPhone, così dalla Home si apre a tutto schermo con nome e icona.
- **Anteprima del link /pannello:** la grafica "Gestisci le tue prenotazioni" (1200×675), solo su /pannello. Il resto del sito ha la sua. L'ho verificato pagina per pagina.

## C. Non fatto, e perché
- **Scorrimento dall'hero desktop ("sotto i tre pulsanti non c'è nulla"):** hai chiesto idee, non l'ho ancora implementato. Idee in fondo.
- **Pulsante "invio automatico" dei promemoria WhatsApp:** solo analisi (report separato). Decisioni tue ancora aperte.
- **Controllo barre del pannello su iPhone vero:** non posso provare Safari su iPhone da qui. Se ricapita, rifaccio le barre senza posizione fissa.

## D. Idee per l'hero desktop (sotto i tre pulsanti)
1. **Fascia scorrevole delle quattro serate:** una striscia sottile in fondo all'hero ("Giovedì Milkshake · Venerdì Drip · Sabato International · Domenica Bàilame") che scorre lenta, ogni voce cliccabile. Dice cosa c'è sotto e invita a scendere. La mia preferita.
2. **Indicatore "Scorri":** una freccia o una linea che pulsa piano, al centro in basso. Semplice e discreto.
3. **La sezione dopo che si affaccia:** accorciare l'hero in modo che le locandine delle serate spuntino già sotto i pulsanti (le prime righe delle quattro locandine visibili). L'occhio vede che c'è altro.
4. **Etichetta con conto:** "4 serate a settimana" con freccia verso il basso, che porta alle locandine con un tocco.

## E. Cose ancora da confermare (dati, non codice)
Orario di inizio (oggi 23:30 non confermato), date della stagione, prezzi del bracciale giovedì e domenica, dati operativi della navetta, strutture e prezzi del Capodanno, il numero WhatsApp pubblico, e il controllo di domani in Search Console (sitemap a 14 pagine, 7 pagine richieste).

## F. Aggiornamenti dopo il primo recap (tutti online)
- **Password dei PR: nome più sei cifre** (per esempio `lorenzo482915`), non più tre parole. Il nome lo sa chiunque abbia il link del PR, quindi conta solo il numero: un milione di combinazioni (20 bit). È meno di una password a caso e regge perché si hanno 5 tentativi per indirizzo, poi 10 minuti di blocco, e l'area PR non mostra telefoni. Le password già date restano valide.
- **Freccia "4 serate a settimana"** sotto i tre pulsanti dell'hero, solo da computer (a 1024, 1280 e 1440 px). Porta alle quattro locandine e si ferma sotto la testata fissa. Sul telefono non c'è, perché la hero lì è già piena.
- **Moduli senza scelte preimpostate:** "Quante persone", "Chi c'è al tavolo", budget e occasione partono vuoti. "Avanti" si accende solo dopo persone e gruppo. "Invia la richiesta" resta spento finché non c'è tutto, e la riga sotto dice cosa manca. Premere "Invia" a metà non manda niente e mostra gli errori. Provato: 21 prove su 21 (tavolo, lista, bracciale, telefono).
- **Messaggi WhatsApp senza emoji:** dal tuo screenshot, su quell'Android le emoji arrivavano come un rombo nero con il punto interrogativo. Ora righe con etichette ("Serata:", "Data:", "Dove:"), grassetto e firma, senza emoji. Vale anche per il messaggio con l'accesso dei PR.
- **Link del biglietto sul dominio vero:** nel tuo screenshot il link era su un indirizzo di servizio (`lucacalifornia.satoshiweb.it`). Ora il link nel messaggio usa sempre `lucacalifornia.it`.
- **Anteprima del link del biglietto:** loghetto piccolo (256 px) accanto al titolo, non un'immagine enorme in cima. Testo "Il biglietto della tua serata, da aggiungere al Wallet." (prima diceva "Aprilo dal tuo iPhone", sbagliato per chi ha Android).
- **Una riga brutta trovata dopo il deploy** ("per" a fine riga nel testo su cosa manca nel modulo): sistemata. Il controllo righe su produzione ora segnala solo "Venerdì / DRIP", voluto.

## G. Android, PDF e ultime rifiniture (online, deploy `38b3a27`)
- **Il problema:** su Android il biglietto Apple Wallet si scaricava come file `.pkpass`, che Android non sa aprire. Per un cliente con Android il biglietto non serviva a niente.
- **Biglietto in PDF:** una pagina, in verticale, pensata per il telefono. Contiene marchio, tipo (tavolo, lista, bracciale), serata, giorno, luogo, nome e un QR grande su fondo bianco. Non ci sono orari, perché l'inizio della serata non è confermato.
- **Il QR è identico a quello del biglietto Apple.** L'ho letto dal PDF con lo stesso lettore dello scanner e dice esattamente lo stesso testo (204 caratteri). Lo scanner all'ingresso non cambia.
- **Il link sceglie da solo il formato:**
  - iPhone, iPad e Mac: Wallet, come prima.
  - Android e computer: PDF.
  - `?formato=pdf` o `?formato=wallet` forzano la scelta; `/api/b/<codice>/pdf` dà sempre il PDF. Le copie in cache variano col dispositivo, così un telefono non riceve il file di un altro.
- **Messaggio di conferma** (tavolo, lista, bracciale), con due link ognuno su una riga sua:
  - `Il tuo biglietto (Wallet su iPhone):` e il link.
  - `Hai Android o preferisci il PDF? Scaricalo qui:` e il link con `/pdf`. La navetta non ha biglietto e non cambia.
- **Anteprima del link del biglietto:** "Il biglietto della tua serata, in Wallet o in PDF."
- **Nomi con caratteri strani** (emoji, lettere non latine): nel PDF diventano "?" invece di far fallire il biglietto. Provato con un nome di prova.
- **Un errore mio trovato nei test:** una riga di testo troppo lunga mandava il generatore del PDF in un giro infinito. Corretto prima del commit.
- **Freccia "4 serate a settimana"** con scorrimento fluido. Lo scorrimento dolce è solo su quel clic: acceso su tutta la pagina rompeva il tasto indietro. Non aggiunge voci alla cronologia. Con "meno movimento" arriva di scatto. Provato anche in produzione (7 prove su 7).
- **Novità tecnica:** due librerie nuove tra le dipendenze di produzione, `pdf-lib` (scrive il PDF) e `qrcode` (disegna il QR).

**Cosa non è provato:** il PDF su un Android vero e un biglietto vero in produzione (servirebbe una richiesta confermata vera). Il primo biglietto che manderai ti dirà se va tutto bene.

**Google Wallet (non fatto, decisione tua):**
- Da parte mia circa mezza giornata di lavoro.
- Da parte tua: creare l'account "emittente" su Google Wallet Console (gratuito), creare una chiave di servizio e passarmela in modo sicuro, e aspettare l'approvazione di Google (di solito alcuni giorni; fino ad allora funziona solo per utenti di prova).
- Il mio parere: per ora il PDF basta. Valutalo dopo qualche serata, guardando quanti clienti hanno Android.
