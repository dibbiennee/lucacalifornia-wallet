# Il pannello: schermate, testi e comportamenti

Descrive **cosa c'è e cosa fa** il pannello, schermata per schermata, con i testi
copiati dal codice.

Aggiornato dopo il rifacimento della grafica (branch `pannello-nuovo-stile`). Lo stato
precedente resta negli screenshot in `docs/pannello-screenshot/`, e il confronto
affiancato in `docs/pannello-confronto.png`.

Gli screenshot di adesso stanno in `docs/pannello-screenshot-nuovo/`: 33 stati presi a
390x844 con fattore di scala 2, sul build di produzione.

Nel documento non ci sono password, chiavi o token.

---

## Com'è cambiato l'impianto

**La barra passa da cinque voci a quattro:** Richieste, Stasera, Serate, Squadra.

- `/pannello` non è più una schermata: rimanda a `/pannello/richieste`, perché il
  pannello serve prima di tutto a rispondere a chi ha prenotato.
- **`Oggi` non c'è più.** I suoi numeri sono passati a `Stasera`, le richieste da
  confermare a `Richieste`.
- **`Stasera` è nuova:** chi è confermato per la serata, con la ricerca per nome.
- **`Porta` è uscita dalla barra:** ci si arriva solo dall'indirizzo, e la schermata
  dichiara in testa che è un extra.

Sulla scheda Richieste c'è un badge magenta col numero di richieste nuove, contato una
volta sola nel layout.

---

## 1. Accesso

**`/pannello/accesso`**: l'ingresso, con una password sola.

Scatti: `01-accesso-vuoto`, `01b-accesso-campo-vuoto`, `02-accesso-password-sbagliata`,
`22-accesso-bloccato`.

| Elemento | Testo esatto |
|---|---|
| Occhiello | `PANNELLO` |
| Titolo `h1` | `ENTRA` |
| Etichetta del campo | `PASSWORD` |
| Campo | `type="password"`, `autocomplete="current-password"`, nessun segnaposto |
| Pulsante pieno | `Entra` |

### Cosa succede quando tocchi

`Entra` chiama `POST /api/pannello/accesso`. Se va bene si finisce su
`/pannello/richieste` (prima era `/pannello`), con un cookie di sessione da 12 ore.

### Stati

| Stato | Cosa si vede |
|---|---|
| Vuoto | Campo vuoto, nessun errore |
| Campo vuoto all'invio | **`Scrivi la password`** (nuovo, lato client: non spreca un tentativo) |
| In corso | Il pulsante diventa `Un attimo...` ed è disabilitato |
| Password sbagliata | `Password sbagliata` (dal server, 401) |
| Bloccato | `Troppi tentativi. Riprova fra 10 minuti.` (dal server, 429) |
| Server irraggiungibile | `Non sono riuscito a parlare col server` |
| Errore senza testo | `Non ha funzionato` |

Il blocco è invariato: cinque tentativi per IP, dieci minuti fuori, e durante il blocco
fallisce anche la password giusta. Si controlla prima della password.

---

## 2. Richieste

**`/pannello/richieste`**: la schermata iniziale.

Scatti: `04-richieste-tutte`, `05-richieste-nuove`, `06-richieste-confermate`,
`06b-richieste-elenco-vuoto`, `06c-richieste-nessuna-nuova`.

| Elemento | Testo esatto |
|---|---|
| Occhiello | `QUESTA SETTIMANA` |
| Azione a destra | `Esci` (nuovo) |
| Titolo `h1` | `RICHIESTE` |
| Tre filtri | `Nuove N`, `Confermate N`, `Tutte` |
| Elenco | una card per richiesta |
| Nota | `Dati di esempio` |

Ogni card contiene: nome in grassetto, etichetta di stato a destra, riassunto
(`Sabato, Sala 2, tavolo misto, 35–50 € a testa`), il messaggio del cliente in corsivo
se c'è, e `Biglietto inviato alle <ora>` se c'è.

Le etichette di stato sono pillole colorate: `Nuova` (acido), `Confermata` (verde),
`In attesa` (arancio), `Rifiutata` (rosso scuro, testo bianco).

### Cosa succede quando tocchi

| Elemento | Cosa fa |
|---|---|
| Un filtro | va a `/pannello/richieste?stato=…`; il filtro resta nell'indirizzo |
| Una card | apre la richiesta, portandosi dietro il filtro (`?stato=…`) |
| `Esci` | chiama `POST /api/pannello/esci`, che cancella il cookie, e torna all'accesso |

### Elenchi vuoti (nuovi)

| Quando | Testo |
|---|---|
| Filtro Nuove, nessuna | `Nessuna richiesta nuova. Appena qualcuno prenota dal sito, la trovi qui.` |
| Ogni altro filtro | `Nessuna richiesta con questo stato.` |

---

## 3. La singola richiesta

**`/pannello/richieste/[id]`**

Scatti: `07-richiesta-nuova`, `07b-richiesta-preparo-il-biglietto`,
`08-richiesta-dopo-conferma-e-scrivi`, `09-richiesta-gia-confermata`,
`09b-richiesta-chiedo-se-rifiutare`, `09c-richiesta-avviso-in-attesa`.

| Elemento | Testo esatto |
|---|---|
| Indietro (nuovo) | `‹ Richieste`, oppure `‹ Stasera` se sei arrivato da lì (`?da=stasera`) |
| Occhiello | `RICHIESTA, OGGI <ora>` |
| Titolo `h1` | il nome del cliente |
| Etichetta | lo stato attuale, sotto il nome |
| Telefono | il numero, azzurro e sottolineato, apre il telefono |
| Voci | `SERATA`, `TIPO`, `BUDGET A TESTA`, `OCCASIONE` |
| Citazione | il messaggio del cliente fra virgolette curve |
| Note private | `NOTE PRIVATE, SOLO TU` |

Il ritorno indietro **mantiene il filtro** da cui sei arrivato.

### Il blocco della conferma

| Elemento | Testo esatto |
|---|---|
| Titolo | `QUANDO CONFERMI` |
| Spiegazione | `Si apre WhatsApp con il messaggio già scritto e il link al biglietto da aggiungere al Wallet. Niente parte da solo.` |
| Riga in più | `Biglietto già inviato alle <ora>.` se già confermata |
| Pulsante pieno | `Conferma e scrivi`, o `Rimanda il biglietto` |
| Due pulsanti | `In attesa` e `Rifiuta` |

**`Conferma e scrivi`** chiama `POST /api/conferma`. Due cose sono cambiate nel corpo
inviato:

- manda il **nome della serata** (`DUE SALE`), non il giorno: il messaggio diceva "sei
  dentro per SABATO di sabato 27 settembre";
- la data è la **prossima volta che cade quella serata**, calcolata sull'orologio di
  Roma, non più "la prossima domenica" per tutte. L'orario sta nella costante
  `ORARIO_INIZIO` in `src/lib/serate.ts`, ed è 23:30 finché Luca non dà gli orari veri.

Al successo il blocco diventa: `Biglietto pronto.`, `Apri WhatsApp col messaggio`
(verde), `Guarda il biglietto`. E la richiesta passa a confermata.

**`In attesa`** e **`Rifiuta`** adesso funzionano (prima erano muti). Rifiutare apre una
domanda che sale dal basso:

| Elemento | Testo esatto |
|---|---|
| Titolo | `Rifiuti <nome>?` |
| Testo | `La richiesta resta nell'elenco, segnata come rifiutata. Nessun messaggio parte da solo.` |
| Pulsante pieno | `Rifiuta la richiesta` |
| Pulsante vuoto | `Annulla` |

Si chiude anche con Esc o toccando fuori. Dopo l'azione compare un avviso verde che
sparisce da solo: `Segnata in attesa.`, `Richiesta rifiutata.`, `Confermata.`

### Stati

`Preparo il biglietto...` mentre lavora. Errori: quelli di `/api/conferma`, più
`Non sono riuscito a preparare il biglietto` e `Non sono riuscito a cambiare lo stato`.

---

## 4. Stasera (nuova)

**`/pannello/stasera`**: chi entra stasera.

Scatti: `S1-stasera`, `S2-stasera-ricerca-per-nome`, `S3-stasera-ricerca-senza-risultati`.

| Elemento | Testo esatto |
|---|---|
| Occhiello | `STASERA, <giorno data>` se la serata è oggi, altrimenti `PROSSIMA SERATA, <giorno data>` |
| Titolo `h1` | il nome della serata, es. `SABATO,` / `DUE SALE` |
| Tre numeri | `tavoli`, `in lista`, `nuove` |
| Campo | segnaposto `Cerca un nome`, etichetta nascosta, `type="search"` |
| Sezioni | `TAVOLI, n` e `LISTA, n` |

Il numero `nuove` ha un bordo magenta ed è un link a `/pannello/richieste?stato=nuova`.

Ogni riga apre la richiesta con `?da=stasera`, così il ritorno indietro torna qui. Nelle
righe dei tavoli c'è il dettaglio (`Misto, Oltre 50 € a testa`), in quelle della lista
solo il nome. La sala sta a destra, in minuscolo.

### La ricerca

Filtra mentre scrivi, nel browser: la pagina non si ricarica e il fuoco resta nella
tastiera. Vuoti:

| Quando | Testo |
|---|---|
| Nessun confermato | `Ancora nessuno confermato per questa serata.` |
| Ricerca senza risultati | `Nessuno con "<testo>" per stasera.` |

### Dati

Da `confermatiPerSerata(codice)` in `dati.ts`.

---

## 5. Serate

**`/pannello/serate`**

Scatti: `10-serate`, `11-serate-aggiungi-un-ospite`, `11b-serate-avviso-etichetta`.

| Elemento | Testo esatto |
|---|---|
| Occhiello | `ROOM 26` |
| Titolo `h1` | `SERATE` |
| Sottotitolo | `Cosa vede la gente sul sito.` |
| Quattro riquadri | `Giovedì, Milkshake`, `Venerdì`, `Sabato, due sale`, `Domenica, Báilame`, ognuno con `Lista aperta` / `Pochi tavoli` / `Tutto pieno` |
| Sezione | `SPECIAL GUEST, N IN ATTESA` |
| Spiegazione | `Quando aggiungi un ospite, chi è in attesa riceve l'avviso.` |
| Pulsante | `Aggiungi un ospite` |
| Sezione | `CAPODANNO, N IN ATTESA` |
| Spiegazione | `Pacchetti non ancora pubblicati.` |
| Pulsante | `Pubblica i pacchetti` |
| Nota | `Dati di esempio` |

### Cosa succede quando tocchi

Un'etichetta cambia subito a schermo e poi viene salvata con una Server Action. Se il
salvataggio fallisce torna com'era. L'avviso dice:
`Anteprima: la scelta non è ancora salvata. <serata>, <etichetta>.`

`Aggiungi un ospite` apre un campo `Nome dell'ospite` con il pulsante
`Avvisa N persone` e `Annulla`. Il campo nasce col fuoco dentro.

`Pubblica i pacchetti` agisce subito. Entrambi rispondono
`Anteprima: con il database, N persone riceverebbero l'avviso.`

---

## 6. Squadra

**`/pannello/squadra`**

Scatti: `12-squadra`, `13-squadra-link-copiato`, `13b-squadra-aggiungi-un-pr`.

| Elemento | Testo esatto |
|---|---|
| Occhiello | il mese in lettere, es. `SETTEMBRE` |
| Titolo `h1` | `SQUADRA` |
| Card PR | nome in maiuscolo, `N prenotazioni` a destra, il link con `Copia`, tre numeri (`liste`, `tavoli`, `provvigioni`) |
| Pulsante | `Aggiungi un PR` |
| Sezione | `COMPLEANNI IN ARRIVO` |
| Card compleanno | nome, `tra N settimane`, `L'anno scorso: …`, `Scrivi su WhatsApp` |
| Nota | `Dati di esempio` |

Nel link il dominio si accorcia con i puntini, **lo slug finale no**: è la parte che
distingue un PR dall'altro.

### Cosa succede quando tocchi

`Copia` copia `https://<link>`; il pulsante diventa `Copiato` per due secondi. Se gli
appunti non sono raggiungibili prova una seconda strada, e se fallisce anche quella
avvisa: `Non riesco a copiare: tieni premuto il link per copiarlo a mano.` (prima
falliva in silenzio.)

`Aggiungi un PR` apre un campo `Nome del PR` con `Crea il suo link`. L'avviso dice
`Link creato: lucacalifornia.satoshiweb.it/<nome>`.

`Scrivi su WhatsApp` apre il messaggio già scritto:
`Ciao <nome>! Tra poco è il tuo compleanno: ti tengo un tavolo come l'anno scorso?`

---

## 7. La porta (extra, fuori dalla barra)

**`/pannello/porta`**

Scatti: `14-porta-lettore-spento`, `21-porta-lettore-acceso`, `19-esito-valido`,
`20-esito-non-valido`, `23-esito-gia-dentro`, `24-fotocamera-non-disponibile`.

In testa: `Extra, non incluso: il lettore QR alla porta, se un giorno servirà.`

Poi l'occhiello `PORTA, <serata>`, il conteggio grande `<entrati> / <attesi> entrati`
(con `aria-live`, così chi legge con la voce sente salire il numero), il lettore, la
sezione `SE IL QR NON SI LEGGE` con `Cerca a mano nella lista`, e `ULTIMI INGRESSI`.

**Il difetto della sovrapposizione è chiuso.** Il lettore era `position: fixed`, quindi
fuori dal flusso, e la sezione sotto gli finiva sopra coprendolo: aprendo la porta non
si vedeva nemmeno il pulsante per accendere la fotocamera. Adesso è un riquadro dentro
la pagina, alto almeno 300px.

### Il lettore, stato per stato

| Stato | Cosa si vede |
|---|---|
| Spento | `INGRESSO` e il pulsante bianco `Accendi la fotocamera` |
| Acceso | la cornice di mira e `Inquadra il QR` |
| Errore | `Non riesco ad accendere la fotocamera. Serve un indirizzo https e il permesso del telefono.` più `Riprova` |

L'esito prende tutto lo schermo: verde `ENTRA` col nome, il tipo, la sala e la serata;
rosso `NO` con `Biglietto non valido`; ocra `GIÀ DENTRO`. In fondo
`Tocca per il prossimo`, e un tocco ovunque torna a cercare.

`GIÀ DENTRO` **non arriva mai oggi**: per sapere chi è passato serve il database.
Il componente lo prevede, così quando ci sarà basterà che `/api/verifica` lo dica.

**`/staff/scan`** è la stessa cosa senza password e senza conteggio.

---

## 8. Il biglietto di prova

**`/biglietto/prova`**: scatto `16-biglietto-prova`.

Occhiello `LUCA CALIFORNIA`, titolo `IL TUO BIGLIETTO,` / `È PRONTO`, sottotitolo
`Aggiungilo ad Apple Wallet. All'ingresso ti basta mostrare il QR.`, poi la scheda con
`SERATA`, `QUANDO`, `TIPO`, `NOME`, `DOVE`, il pulsante nero `Aggiungi a Apple Wallet`
che porta a `/api/pass/demo`, e la nota su Safari.

---

## 9. La navigazione

Barra fissa in basso con quattro voci uguali: Richieste, Stasera, Serate, Squadra. La
voce attiva è chiara con una lineetta magenta in alto e porta `aria-current="page"`.
Il badge magenta sulle richieste nuove ha `richieste nuove` come testo per la voce.

Dalla singola richiesta si torna col tasto `‹ Richieste` o `‹ Stasera`, che mantiene il
filtro. Da `Richieste` si esce dal pannello con `Esci`.

Il pannello si installa sulla schermata home: manifest con `start_url` e `scope` su
`/pannello`, `display: standalone`, colori a `#000000`, e l'icona per iOS.

---

## 10. I token

Stanno in `src/stili/token.css`, condiviso col sito (i nomi non collidono con quelli
del sito di oggi).

| Nome | Valore | Dove |
|---|---|---|
| `--bg` | `#000000` | il fondo |
| `--surface` | `#141318` | card e riquadri |
| `--surface-2` | `#1E1C24` | riquadri dentro i riquadri, numeri, filtri spenti |
| `--line` | `#2E2B36` | bordi |
| `--nav` | `#050408` | la barra in basso |
| `--text` | `#F5F2EC` | bianco caldo, mai bianco puro su nero |
| `--muted` | `#B3AEBD` | secondario, occhielli |
| `--dim` | `#8E899A` | note |
| `--magenta` | `#FF3EA5` | solo le azioni |
| `--acid` `--ok` `--sun` `--esito-no` | `#E6FF4D` `#2FD37A` `#FFB35C` `#8E0B2B` | gli stati |
| `--wa` | `#25D366` | solo il pulsante WhatsApp |
| `--link` | `#7CC7FF` | il telefono |

**Carattere:** Archivo variabile con l'asse della larghezza, al posto di Anton e Hanken
Grotesk. Titoli peso 900 allargati al 125%, numeri al 112%, testo 15-17px, mai sotto i
12px.

**Forme:** spigolo vivo abbandonato. Card `16px`, pulsanti e filtri a pillola, campi
`12px`. Spaziature solo sulla scala da 4.

---

## 11. Cosa oggi non funziona o è incompleto

1. **Manca il database.** I dati delle schermate sono di esempio e ogni schermata lo
   dichiara. Le funzioni che scrivono cambiano la memoria dell'istanza: la modifica si
   vede finché quella resta calda, poi torna indietro.
2. **La porta non sa chi è già passato.** L'esito è valido o non valido; `GIÀ DENTRO`
   esiste nel componente ma non arriva.
3. **Le etichette delle serate non arrivano al sito**: l'avviso lo dice.
4. **I link personali dei PR non contano niente**: il cookie di provenienza viene messo
   e allegato alla richiesta, ma non c'è dove segnarlo.
5. **Le provvigioni sono numeri fissi**, non calcolati.
6. **Il blocco dei tentativi vive nella memoria dell'istanza**: ferma chi insiste da un
   browser, non un attacco distribuito.
7. **La porta non è mai stata provata su un iPhone vero**: il lettore è stato verificato
   con una fotocamera finta e un QR generato da un token vero. Finché Luca non dice che
   la userà, non ci si investe altro tempo.
8. **`/biglietto/prova` mostra dati fissi** (Mario Rossi, Báilame): è la pagina di prova
   della fase 1, e va via quando arrivano i dati veri, insieme a `/api/pass/demo`.
