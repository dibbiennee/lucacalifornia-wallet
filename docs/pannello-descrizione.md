# Il pannello: schermate, testi e comportamenti

Serve a rifare la grafica del pannello in un altro progetto. Descrive **cosa c'è
e cosa fa**, non come deve apparire. I testi sono copiati dal codice, non
riscritti.

Gli screenshot stanno in `docs/pannello-screenshot/` (e nello zip accanto),
presi a 390x844 con fattore di scala 2, a pagina intera.

Due avvertenze sugli scatti:

- Negli scatti a pagina intera la barra in basso compare **a metà pagina**: è un
  effetto dello screenshot, che disegna gli elementi fissi dove si trovavano al
  momento dello scatto. Sul telefono resta in fondo.
- Gli stati del lettore di QR sono stati presi su `/staff/scan`, che monta lo
  **stesso componente** senza niente sopra. Su `/pannello/porta` il lettore è
  coperto da un difetto descritto più avanti.

Nel documento non ci sono password, chiavi o token.

---

## 1. Accesso

**`/pannello/accesso`**: l'ingresso al pannello, con una password sola.

Scatti: `01-accesso-vuoto`, `02-accesso-password-sbagliata`,
`22-accesso-bloccato-dopo-cinque-tentativi`.

È l'unica rotta del pannello fuori dal gruppo protetto: se si proteggesse da
sola, chi non è entrato ci girerebbe in tondo.

### Elementi, dall'alto in basso

| Elemento | Testo esatto |
|---|---|
| Occhiello | `PANNELLO` |
| Titolo `h1` | `Entra` |
| Etichetta del campo | `Password` |
| Campo | `<input type="password" id="password" autocomplete="current-password">`, nessun segnaposto |
| Messaggio d'errore | compare solo se c'è, vedi stati |
| Pulsante | `Entra` |

### Cosa succede quando tocchi

**Pulsante `Entra`** (invia il form): chiama `POST /api/pannello/accesso` con
`{ password }`.

- Se va bene: `router.replace("/pannello")` più `router.refresh()`. Il server
  mette un cookie di sessione che dura 12 ore.
- Se non va bene: il testo dell'errore arriva dal server e compare sopra il
  pulsante.

### Stati

| Stato | Cosa si vede |
|---|---|
| Vuoto | Campo vuoto, nessun errore, pulsante `Entra` |
| In corso | Il pulsante diventa `Un attimo...` ed è disabilitato |
| Password sbagliata | `Password sbagliata` (dal server, 401) |
| Bloccato | `Troppi tentativi. Riprova fra 10 minuti.` (dal server, 429) |
| Server irraggiungibile | `Non sono riuscito a parlare col server` (dal client) |
| Errore senza testo | `Non ha funzionato` (ripiego del client) |

Il messaggio del blocco è calcolato: `Troppi tentativi. Riprova fra N minuti.`
dove N è l'attesa residua arrotondata per eccesso ai minuti.

### Il blocco dei tentativi

Cinque tentativi sbagliati per indirizzo IP, poi dieci minuti fuori.

- Il blocco si controlla **prima** della password: chi ha davvero dimenticato
  deve sapere che deve aspettare, non credere di averla riscritta male.
- Durante il blocco **fallisce anche la password giusta**. È voluto.
- Un accesso riuscito azzera il contatore.
- Il conteggio vive nella memoria dell'istanza: ferma chi insiste da un browser,
  non un attacco distribuito.
- La risposta 429 porta anche l'intestazione `Retry-After` in secondi.

### Accessibilità già presente

`label for` collegata, `aria-invalid` sul campo quando c'è l'errore,
`aria-describedby` che punta al messaggio, e il messaggio ha `role="alert"`.

---

## 2. Oggi

**`/pannello`**: la serata in corso, con i numeri e le richieste da confermare.

Scatto: `03-oggi`.

### Elementi, dall'alto in basso

| Elemento | Testo esatto |
|---|---|
| Occhiello | `OGGI · ` più il giorno in maiuscolo, es. `OGGI · SABATO 26 SET` |
| Titolo `h1` | la serata, es. `Sabato, due sale` |
| Etichetta | `IN CORSO`, solo se la serata è in corso |
| Tre numeri | valore più `in lista`, `tavoli`, `entrati` |
| Pulsante pieno | `Apri la porta` |
| Titolo di sezione | `Da confermare · N nuove` |
| Elenco richieste | una scheda per richiesta, vedi sotto |
| Due numeri | `compleanni in arrivo`, `in attesa Capodanno` |
| Nota | vedi stati |

Ogni scheda dell'elenco contiene, in quest'ordine:

1. nome in grassetto, e a destra l'ora della richiesta (es. `18:42`)
2. una riga di riassunto composta così: `Tavolo` oppure `Lista`, poi il gruppo in
   minuscolo, poi `<budget> a testa`, poi l'occasione in minuscolo, uniti da
   virgole. Esempio reale: `Tavolo, misto, 35–50 € a testa, compleanno`
3. serata e sala unite da virgola, es. `Sabato, Sala 2`

### Cosa succede quando tocchi

| Elemento | Cosa fa |
|---|---|
| `Apri la porta` | porta a `/pannello/porta` |
| Una scheda richiesta | porta a `/pannello/richieste/<id>` |
| I numeri | non sono toccabili |

### Stati

Non ha stati di caricamento né di errore: i dati arrivano dal server con la
pagina. Se non ci fossero richieste nuove, l'elenco resterebbe vuoto senza un
testo dedicato: **manca il testo per l'elenco vuoto**.

Nota sempre presente finché i dati sono di esempio:

> Anteprima: i numeri e le richieste di queste schermate sono di esempio.
> Diventano veri quando colleghiamo il database.

### Dati

Da `stasera()`:

```ts
interface Stasera {
  giorno: string;            // "Sabato 26 set"
  serata: string;            // "Sabato, due sale"
  inCorso: boolean;
  inLista: number;           // 42
  tavoli: number;            // 7
  entrati: number;           // 0
  attesi: number;            // 49
  compleanniInArrivo: number;// 2
  attesaCapodanno: number;   // 64
}
```

Da `richieste("nuova")`: l'elenco delle richieste in stato nuovo (forma completa
nella sezione 3).

---

## 3. Richieste

**`/pannello/richieste`**: tutte le richieste della settimana, filtrabili per
stato.

Scatti: `04-richieste-tutte`, `05-richieste-nuove`, `06-richieste-confermate`.

### Elementi, dall'alto in basso

| Elemento | Testo esatto |
|---|---|
| Occhiello | `QUESTA SETTIMANA` |
| Titolo `h1` | `Richieste` |
| Tre filtri | `Nuove N`, `Confermate N`, `Tutte` (N è il conteggio vero) |
| Elenco | una scheda per richiesta |
| Nota | `Anteprima: queste richieste sono di esempio.` |

Ogni scheda contiene:

1. nome in grassetto, e a destra l'etichetta di stato in maiuscolo: `NUOVA`,
   `CONFERMATA`, `IN ATTESA`, `RIFIUTATA`
2. riassunto: serata, sala, poi `tavolo <gruppo in minuscolo>` oppure `lista`,
   poi `<budget> a testa`, uniti da virgole
3. il messaggio del cliente, in corsivo, se c'è
4. `Biglietto inviato alle <ora>`, se c'è

### Cosa succede quando tocchi

| Elemento | Cosa fa |
|---|---|
| `Nuove N` | va a `/pannello/richieste?stato=nuova` |
| `Confermate N` | va a `/pannello/richieste?stato=confermata` |
| `Tutte` | va a `/pannello/richieste` senza parametri |
| Una scheda | va a `/pannello/richieste/<id>` |

Il filtro attivo porta `aria-current="true"` ed è evidenziato. Il filtro si legge
dall'indirizzo, quindi è condivisibile e sopravvive al ricaricamento.

### Stati

Nessun caricamento e nessun errore: è una pagina del server. Anche qui **manca il
testo per l'elenco vuoto** (oggi non capita, perché i dati di esempio ci sono
sempre).

### Dati

Da `richieste()` e `richieste(stato)`:

```ts
type StatoRichiesta = "nuova" | "confermata" | "in attesa" | "rifiutata";

interface RichiestaPannello {
  id: string;                   // "giulia-marchetti"
  nome: string;                 // "Giulia Marchetti"
  telefono: string;             // "340 000 0000"
  quando: string;               // "18:42"
  serata: string;               // "Sabato"
  sala?: string;                // "Sala 2"
  tipo: "lista" | "tavolo";
  gruppo?: string;              // "Misto"
  budget?: string;              // "35–50 €"
  occasione?: string;           // "Compleanno"
  messaggio?: string;           // quello che ha scritto il cliente
  provenienza: string;          // presente ma non mostrato da nessuna parte
  stato: StatoRichiesta;
  notePrivate?: string;
  bigliettoInviatoAlle?: string;// "17:20"
}
```

Nei dati di esempio ci sono cinque richieste: tre nuove (Giulia Marchetti,
Marco Fanelli, Sara Conti) e due confermate (Federico Nardi, Elisa Rinaldi).

---

## 4. La singola richiesta

**`/pannello/richieste/[id]`**: i dettagli di una richiesta, e il gesto che la
chiude.

Scatti: `07-richiesta-nuova-prima-di-confermare`,
`08-richiesta-dopo-conferma-e-scrivi`, `09-richiesta-gia-confermata`.

Se l'id non esiste, la pagina risponde 404 (`notFound()`).

### Elementi, dall'alto in basso

| Elemento | Testo esatto |
|---|---|
| Occhiello | `RICHIESTA · OGGI <ora>`, es. `RICHIESTA · OGGI 18:42` |
| Titolo `h1` | il nome del cliente |
| Telefono | il numero, come link `tel:` |
| Voce | `Serata` più il valore, es. `Sabato, Sala 2` |
| Voce | `Tipo` più `Tavolo, <gruppo in minuscolo>` oppure `Lista` |
| Voce | `Budget a testa` più il valore, solo se c'è |
| Voce | `Occasione` più il valore, solo se c'è |
| Riquadro | il messaggio del cliente fra virgolette curve, in corsivo, se c'è |
| Blocco conferma | vedi sotto |
| Sezione | `Note private · solo tu` più il testo, se c'è |

### Il blocco della conferma

Prima di confermare:

| Elemento | Testo esatto |
|---|---|
| Titolo | `Quando confermi` |
| Spiegazione | `Si apre WhatsApp con il messaggio già scritto e il link al biglietto da aggiungere al Wallet. Niente parte da solo.` |
| Riga in più | `Biglietto già inviato alle <ora>.`, solo se la richiesta era già confermata |
| Pulsante pieno | `Conferma e scrivi`, oppure `Rimanda il biglietto` se era già confermata |
| Due pulsanti affiancati | `In attesa` e `Rifiuta` |

### Cosa succede quando tocchi

**`Conferma e scrivi`** chiama `POST /api/conferma` con questo corpo:

```json
{
  "nomeCliente": "<nome>",
  "telefono": "<telefono>",
  "serata": "<SERATA IN MAIUSCOLO>",
  "inizioSerata": "<la prossima domenica alle 23:30, in ISO>",
  "tipo": "TAVOLO, <GRUPPO>" oppure "LISTA",
  "locale": "room26",
  "sala": "<sala, se c'è>"
}
```

La data è calcolata al volo: senza database non c'è una data vera da cui partire,
quindi prende la prossima domenica alle 23:30.

**Questa è l'unica parte del pannello che non è di esempio.** Il biglietto che
esce è vero: la rotta crea il token cifrato e restituisce il link al `.pkpass`,
lo stesso che il cliente aggiunge al Wallet.

Al successo il blocco viene sostituito da (con `role="status"`):

| Elemento | Testo esatto |
|---|---|
| Riga | `Biglietto pronto.` |
| Pulsante verde | `Apri WhatsApp col messaggio` (porta a `wa.me` col testo già scritto) |
| Pulsante vuoto | `Guarda il biglietto` (porta a `/api/pass/<token>`, scarica il file) |

**`In attesa`** e **`Rifiuta`**: oggi **non fanno niente**. Sono due
`<button type="button">` senza gestore.

**Il telefono**: apre il telefono con il numero già composto.

### Stati

| Stato | Cosa si vede |
|---|---|
| Normale | Il pulsante `Conferma e scrivi` |
| In corso | Il pulsante diventa `Preparo il biglietto...`, disabilitato e più chiaro |
| Fatto | Il blocco lascia il posto a `Biglietto pronto.` e ai due link |
| Errore dal server | il testo arrivato dall'API, in rosa, con `role="alert"` |
| Errore di rete | `Non sono riuscito a preparare il biglietto` |
| Errore senza testo | `Non ha funzionato` |

Gli errori che può restituire `/api/conferma`: `Richiesta illeggibile`,
`Manca qualcosa: servono nome, telefono, serata, data e tipo`,
`Locale sconosciuto`, `Data non valida`, `Numero di telefono non valido`.

### Dati

Da `richiesta(id)`, stessa forma di `RichiestaPannello`.

---

## 5. Porta

**`/pannello/porta`**: il lettore del QR all'ingresso, col conteggio di chi è
dentro.

Scatti: `14-porta-come-si-presenta-oggi`, `15-porta-prima-schermata-coperta`,
`21-porta-lettore-acceso-col-conteggio`. Gli stati puliti del lettore sono nei
quattro scatti `17`, `18`, `19`, `20`, presi su `/staff/scan`.

> **Difetto da correggere rifacendo la grafica.** Il lettore è
> `position: fixed; inset: 0` e quindi esce dal flusso; la sezione sotto ("Se il
> QR non si legge") è nel flusso normale, ha `z-index: 1` e uno sfondo pieno,
> perciò parte dall'alto della pagina e **copre il lettore**. In pratica, aprendo
> `/pannello/porta` si vede la sezione di riserva e non il pulsante per accendere
> la fotocamera, che non è nemmeno toccabile. Su `/staff/scan`, che monta lo
> stesso componente senza niente sotto, il lettore si vede bene.

### Com'è composta la pagina

1. il lettore, a tutto schermo, con l'intestazione qui sotto
2. la sezione di riserva, pensata per stare sotto

Intestazione passata al lettore (si vede solo mentre cerca il QR):

| Elemento | Testo esatto |
|---|---|
| Riga piccola | `PORTA · <SERATA IN MAIUSCOLO>`, es. `PORTA · SABATO, DUE SALE` |
| Numero grande | `<entrati> / <attesi>`, es. `0 / 49` |

Sezione di riserva:

| Elemento | Testo esatto |
|---|---|
| Titolo | `Se il QR non si legge` |
| Pulsante vuoto | `Cerca a mano nella lista`, porta a `/pannello/richieste` |
| Titolo | `Ultimi ingressi` |
| Elenco | nome (più `, già entrato` se lo è) e a destra l'ora |
| Nota | `Il lettore è vero e riconosce i biglietti veri. Il conteggio e gli ultimi ingressi sono di esempio: per ricordare chi è già passato serve il database.` |

### Il lettore, stato per stato

Il componente è `src/componenti/LettoreQr.tsx`. Lo usano due pagine: questa e
`/staff/scan`. È pensato per il buio, con una mano, con gente che spinge alle
spalle: fondo pieno, esito a tutto schermo, e un tocco qualsiasi per passare al
prossimo. Nessun pulsante piccolo.

**Spento** (scatto 17):

| Elemento | Testo esatto |
|---|---|
| Riga piccola | `INGRESSO` |
| Pulsante grande tondo | `Accendi la fotocamera` |

Toccandolo chiede la fotocamera con `facingMode: environment`, cioè quella
posteriore.

**Cerco** (scatto 18): fondo nero, l'intestazione se c'è, un riquadro quadrato
vuoto col bordo, e sotto `Inquadra il QR`.

Analizza i fotogrammi con **jsQR**, perché iOS non ha `BarcodeDetector`. Il
fotogramma viene ridotto a 520px di lato prima di analizzarlo: più veloce, e il
QR si legge lo stesso. Appena trova un codice chiama `POST /api/verifica` con
`{ token }`.

**Esito valido** (scatto 19): fondo verde `#0B7A2F`, e in colonna:

1. `ENTRA` enorme
2. il nome del cliente
3. il tipo, es. `TAVOLO, MISTO`
4. la sala, se c'è
5. la serata
6. in fondo: `Tocca per il prossimo`

**Esito non valido** (scatto 20): fondo rosso `#8E0B2B`, `NO` enorme, e sotto
`Biglietto non valido`. Stessa riga in fondo.

**Errore fotocamera**: `Non riesco ad accendere la fotocamera. Serve un indirizzo
https e il permesso del telefono.`

Un tocco in qualunque punto dello schermo, quando c'è un esito, torna a cercare.
Uscendo dalla pagina la fotocamera viene spenta.

### Dati

Da `stasera()` per l'intestazione, e da `ultimiIngressi()`:

```ts
interface Ingresso {
  nome: string;        // "Elisa Rinaldi"
  ora: string;         // "00:42"
  giaEntrato: boolean;
}
```

La risposta di `/api/verifica`:

```ts
interface Esito {
  valido: boolean;
  nome?: string; tipo?: string; serata?: string; sala?: string; locale?: string;
}
```

Il campo `locale` arriva ma **non viene mostrato**.

---

## 6. Serate

**`/pannello/serate`**: decide cosa vede la gente sul sito, serata per serata.

Scatti: `10-serate`, `11-serate-etichetta-cambiata`.

### Elementi, dall'alto in basso

| Elemento | Testo esatto |
|---|---|
| Occhiello | `ROOM 26` |
| Titolo `h1` | `Serate` |
| Sottotitolo | `Cosa vede la gente sul sito.` |
| Quattro riquadri | uno per serata, vedi sotto |
| Nota | `Gli interruttori si muovono, ma senza database la scelta non arriva al sito e si perde aggiornando la pagina.` |
| Sezione | `Special guest · N in attesa` |
| Spiegazione | `Quando aggiungi un ospite, chi è in attesa riceve l'avviso.` |
| Pulsante vuoto | `Aggiungi un ospite` |
| Sezione | `Capodanno · N in attesa` |
| Spiegazione | `Pacchetti non ancora pubblicati.` |
| Pulsante vuoto | `Pubblica i pacchetti` |

Ogni riquadro serata ha il nome (`Giovedì, Milkshake`, `Venerdì`,
`Sabato, due sale`, `Domenica, Báilame`) e sotto tre pulsanti:
`Lista aperta`, `Pochi tavoli`, `Tutto pieno`. Uno solo è attivo.

### Cosa succede quando tocchi

| Elemento | Cosa fa |
|---|---|
| Una delle tre etichette | la seleziona a schermo, nello stato React |
| `Aggiungi un ospite` | niente, non ha gestore |
| `Pubblica i pacchetti` | niente, non ha gestore |

Gli interruttori **non chiamano nessuna API**: la scelta resta a schermo e si
perde ricaricando la pagina. Il componente lo dichiara nella nota, invece di far
credere il contrario.

### Accessibilità già presente

I tre pulsanti stanno in un `role="radiogroup"` con `aria-labelledby` che punta al
nome della serata, e ognuno è `role="radio"` con `aria-checked`.

### Dati

Da `serate()`:

```ts
type EtichettaSerata = "Lista aperta" | "Pochi tavoli" | "Tutto pieno";
interface SerataPannello { codice: string; nome: string; etichetta: EtichettaSerata }
```

Da `listeDiAttesa()`: `{ specialGuest: number; capodanno: number }`, oggi 128 e 64.

---

## 7. Squadra

**`/pannello/squadra`**: i PR, quanto hanno portato, e i compleanni in arrivo.

Scatti: `12-squadra`, `13-squadra-link-copiato`.

### Elementi, dall'alto in basso

| Elemento | Testo esatto |
|---|---|
| Occhiello | `SETTEMBRE` |
| Titolo `h1` | `Squadra` |
| Un riquadro per PR | vedi sotto |
| Pulsante vuoto | `Aggiungi un PR` |
| Titolo sezione | `Compleanni in arrivo` |
| Un riquadro per compleanno | vedi sotto |
| Nota | `Anteprima: squadra e compleanni sono di esempio. I link personali dei PR non tracciano ancora niente, perché non c'è il database dove segnare chi arriva da chi.` |

Riquadro di un PR:

1. nome in maiuscolo, e a destra `N prenotazioni`
2. il link personale scritto in carattere a spaziatura fissa, es.
   `lucacalifornia.satoshiweb.it/marco`, più il pulsante `Copia`
3. tre numeri: `liste`, `tavoli`, `<N> €` con etichetta `provvigioni`

Riquadro di un compleanno:

1. nome in grassetto, e a destra `tra 3 settimane`
2. `L'anno scorso: <descrizione in minuscolo>`
3. pulsante vuoto `Scrivi su WhatsApp`

### Cosa succede quando tocchi

| Elemento | Cosa fa |
|---|---|
| `Copia` | copia `https://<link>` negli appunti; il pulsante diventa `Copiato` per 2 secondi, poi torna `Copia`. Se gli appunti non sono accessibili, resta `Copia` senza avvisare |
| `Aggiungi un PR` | niente, non ha gestore |
| `Scrivi su WhatsApp` | apre `https://wa.me/<numero>` senza testo precompilato |

### Dati

Da `squadra()`:

```ts
interface Pr {
  nome: string;         // "Marco"
  prenotazioni: number; // 18
  liste: number;        // 12
  tavoli: number;       // 6
  provvigioni: number;  // 210, in euro
  link: string;         // "lucacalifornia.satoshiweb.it/marco", senza https
}
```

Da `compleanni()`:

```ts
interface Compleanno {
  nome: string;        // "Giulia Marchetti"
  fra: string;         // "tra 3 settimane", scritto a mano
  annoScorso: string;  // "Tavolo misto, 8 persone, sala 2"
  telefono: string;    // "393400000000", già pronto per wa.me
}
```

---

## 8. Le due pagine fuori dal pannello

Non sono sotto `/pannello`, ma fanno parte dello stesso strumento.

**`/staff/scan`**: la porta senza password, per provare il biglietto. Monta il
`LettoreQr` senza intestazione e senza niente sotto. Titolo della pagina:
`Ingresso, Luca California`. È `noindex`.

**`/biglietto/prova`**: la pagina che il cliente aprirebbe per aggiungere il
biglietto. Scatto `16-biglietto-prova`. Tutto il contenuto è già nell'HTML che
esce dal server.

| Elemento | Testo esatto |
|---|---|
| Occhiello | `LUCA CALIFORNIA` |
| Titolo `h1` | `Il tuo biglietto` a capo `è pronto` |
| Sottotitolo | `Aggiungilo ad Apple Wallet.` a capo `All'ingresso ti basta mostrare il QR.` |
| Scheda, voce | `SERATA` / `BÁILAME` |
| Scheda, voce | `QUANDO` / `Domenica 27 settembre 2026` a capo `ore 23:30` |
| Scheda, voce | `TIPO` / `TAVOLO, MISTO` |
| Scheda, voce | `NOME` / `Mario Rossi` |
| Scheda, voce | `DOVE` / `Room 26, Roma` |
| Pulsante nero tondo | `Aggiungi a Apple Wallet`, porta a `/api/pass/demo` |
| Nota | `Dall'iPhone apri questa pagina con Safari.` a capo `Su computer il file si scarica e basta,` a capo `e negli altri browser dell'iPhone non si apre.` |

`/api/pass/demo` risponde 404 se la variabile `ABILITA_PASS_DEMO` non vale `1`.

---

## 9. La navigazione

**Una barra fissa in basso**, sempre visibile dentro il pannello, con cinque voci
in parti uguali:

`Oggi` (`/pannello`), `Richieste` (`/pannello/richieste`), `Porta`
(`/pannello/porta`), `Serate` (`/pannello/serate`), `Squadra`
(`/pannello/squadra`).

- La voce attiva ha `aria-current="page"` ed è segnata da una linea in alto.
- `Oggi` è attiva solo sulla corrispondenza esatta; le altre anche sulle
  sottopagine (`/pannello/richieste/giulia-marchetti` accende `Richieste`).
- La barra ha `aria-label="Schermate del pannello"`.
- Non c'è nella pagina di accesso, che sta fuori dal gruppo protetto.

**Non c'è nessun tasto indietro.** Dalla singola richiesta si torna all'elenco
solo col gesto del browser o toccando `Richieste` nella barra. Rifacendo la
grafica vale la pena aggiungerlo.

**Non c'è nessun modo di uscire**: manca il pulsante di disconnessione. La
sessione scade da sola dopo 12 ore, oppure cambiando la password.

**La protezione**: tutto quello che sta nel gruppo `(dentro)` controlla la
sessione nel layout; se non c'è, rimanda a `/pannello/accesso`.

**Il pannello si installa** sulla schermata home del telefono: il manifest ha
`start_url` e `scope` su `/pannello`, nome `Pannello Luca California`, nome corto
`Pannello`, `display: standalone`, `orientation: portrait`.

---

## 10. Il messaggio WhatsApp

Lo compone `POST /api/conferma`. Testo esatto, con i segnaposto fra parentesi
uncinate:

```
Ciao <nome>, sei dentro per <serata> di <data in lettere>.
<tipo>.

Questo è il tuo biglietto, aprilo con Safari e aggiungilo al telefono:
<link biglietto>

All'ingresso fai vedere il QR e passi.
```

Come si riempiono:

| Segnaposto | Da dove viene |
|---|---|
| `<nome>` | **solo il primo nome**: `nomeCliente.split(" ")[0]` |
| `<serata>` | il campo `serata` così com'è, di solito in maiuscolo |
| `<data in lettere>` | `Intl.DateTimeFormat("it-IT")` con giorno della settimana, giorno e mese: `domenica 27 settembre` |
| `<tipo>` | il campo `tipo`, es. `TAVOLO, MISTO` |
| `<link biglietto>` | `<origine>/api/pass/<token>` |

Il link WhatsApp è `https://wa.me/<numero>?text=<messaggio codificato>`, dove il
numero viene normalizzato: tolte tutte le cifre non numeriche, e se non comincia
per `39` glielo mette davanti.

**Il messaggio non parte mai da solo.** Si apre WhatsApp con il testo pronto, e
manda Luca. È una regola del cliente.

---

## 11. Il biglietto Wallet

Serve a chi rifà la grafica perché il biglietto è la cosa che il cliente vede
dopo il pannello. Tipo di pass: `eventTicket`, libreria `passkit-generator`.

Campi, nell'ordine in cui iOS li mostra:

| Posizione | Chiave | Etichetta | Valore |
|---|---|---|---|
| Intestazione | `data` | `DATA` | la data della serata, stile medio, senza ora |
| Primario | `serata` | `SERATA` | il nome della serata |
| Secondario | `tipo` | `TIPO` | es. `TAVOLO, MISTO` |
| Secondario | `nome` | `NOME` | nome e cognome |
| Ausiliario | `locale` | `LOCALE` | es. `Room 26, Roma` |
| Ausiliario | `sala` | `SALA` | solo se c'è |
| Ausiliario | `ora` | `DALLE` | l'ora d'inizio, formato corto |
| Retro | `indirizzo` | `DOVE` | solo se il locale ha un indirizzo |
| Retro | `instagram` | `INSTAGRAM` | `@lucacurella_ninfeo` |
| Retro | `ingresso` | `ALL'INGRESSO` | `Mostra questo QR all'ingresso` |

In fondo il QR (`PKBarcodeFormatQR`, codifica `iso-8859-1`) che contiene il token
cifrato.

Tre scelte da non rifare all'indietro:

- **Niente `logoText`**: iOS lo scrive sulla stessa riga del campo intestazione, e
  con un nome lungo si toccano. Il nome sta dentro l'immagine del logo.
- **L'indirizzo compare solo se c'è**: un campo con scritto "da confermare" sul
  biglietto di un cliente è peggio di un campo che non c'è.
- `suppressStripShine` attivo: il riflesso lucido di serie è un tocco datato.

---

## 12. I token grafici di oggi

Da sostituire, ma servono a capire da dove si parte.

### Colori

| Nome | Valore | Dove |
|---|---|---|
| `--blu` | `#2B1BB0` | il blu del sito, non usato nel pannello |
| `--blu-scuro` | `#140C5C` | fasce del sito |
| `--blu-piede` | `#0E0845` | **lo sfondo del pannello** |
| `--testo` | `#FFFFFF` | testo pieno |
| `--testo-debole` | `#C9C3FF` | testo secondario, occhielli, etichette |
| barra in basso | `#08042C` | più scuro dello sfondo |
| errori | `#FFC2D1` | rosa chiaro |
| esito valido | `#0B7A2F` | verde pieno del lettore |
| esito non valido | `#8E0B2B` | rosso pieno del lettore |
| WhatsApp | `#25D366` su `#04250F` | solo il pulsante della conferma |
| fuoco | `#FFD84D` | contorno di 3px, con 2px di stacco |

Superfici: i riquadri sono `rgba(255,255,255,0.07)` con bordo
`rgba(255,255,255,0.14)`; i bordi dei campi `rgba(255,255,255,0.4)`; la nota
tratteggiata `rgba(255,255,255,0.3)`.

### Caratteri

- Titoli e numeri grandi: **Anton**, peso 400, maiuscolo, interlinea 0.95.
  È il carattere delle scritte nei reel di Luca.
- Testo: **Hanken Grotesk**, pesi 400, 600, 700. Corpo 17px, interlinea 1.55.
- Titolo di schermata: `clamp(2.2rem, 11vw, 3rem)`.
- Numero grande dei riquadri: 2.1rem in Anton.
- Occhiello: 12px, peso 700, spaziatura fra le lettere 0.22em.
- Etichetta di campo: 12px, peso 700, spaziatura 0.16em, maiuscolo. Sotto i 12px
  un'etichetta di modulo si legge male e basta.

### Forme e misure

- **Spigolo vivo dappertutto.** L'unico raggio è il 50% dei cerchi numerati e il
  `999px` dei due pulsanti tondi (accendi la fotocamera, aggiungi al Wallet).
- Margine laterale: 1.25rem sul telefono, 2.5rem da 52rem in su.
- Larghezza massima del contenuto: 34rem.
- Padding di pagina: `1.75rem <margine> 1rem`.
- Riquadro: `1.1rem 1.2rem`, con 0.8rem sotto.
- Pulsante pieno: altezza minima 3.4rem, maiuscolo, spaziatura 0.06em.
- Pulsante di scelta: altezza minima 2.75rem, cioè 44px, la misura minima per un
  dito, anche di fretta e al buio.
- Campo: altezza minima 3.2rem, bordo di 2px.
- Barra in basso: cinque colonne uguali, altezza minima 3.5rem per voce, più la
  zona sicura dell'iPhone. Il corpo della pagina lascia sotto
  `4.5rem + env(safe-area-inset-bottom)`.

---

## 13. Cosa oggi non funziona o è incompleto

Ordinato da quello che pesa di più.

1. **Manca il database.** Tutti i dati delle schermate, tranne il biglietto che
   esce dalla conferma, arrivano da `src/lib/pannello/dati.ts` e sono di esempio.
   La costante `DATI_DI_ESEMPIO` è a `true` e le schermate lo dichiarano.
2. **La porta non sa chi è già passato.** L'esito è solo valido o non valido. Il
   campo `giaEntrato` esiste nei dati di esempio ma nessuno lo calcola davvero.
3. **Il lettore è coperto** su `/pannello/porta` dalla sezione di riserva, e il
   pulsante per accendere la fotocamera non è toccabile. Vedi sezione 5.
4. **Quattro pulsanti non fanno niente**: `In attesa` e `Rifiuta` nella singola
   richiesta, `Aggiungi un ospite` e `Pubblica i pacchetti` nelle serate,
   `Aggiungi un PR` nella squadra. Sono cinque, contando bene.
5. **Gli interruttori delle serate non arrivano al sito**: cambiano solo a schermo
   e si perdono ricaricando.
6. **Non si esce dal pannello**: manca il pulsante di disconnessione.
7. **Non c'è un tasto indietro** dalla singola richiesta all'elenco.
8. **Mancano i testi per gli elenchi vuoti**: né in Oggi né in Richieste è
   previsto cosa si legge quando non c'è niente.
9. **I link personali dei PR non contano niente**: il cookie di provenienza viene
   messo e allegato alla richiesta, ma non c'è dove segnarlo, e nel pannello la
   provenienza non è mostrata da nessuna parte.
10. **La conferma inventa la data**: senza database usa la prossima domenica alle
    23:30 per ogni richiesta, qualunque serata sia.
11. **`Copia` fallisce in silenzio** se gli appunti non sono accessibili: il
    pulsante resta `Copia` e non avvisa.
12. **Il blocco dei tentativi vive nella memoria dell'istanza**: ferma chi insiste
    da un browser, non un attacco distribuito, e si azzera a ogni riavvio.

Una nota che **non** è un difetto: in sviluppo la console mostra un avviso di
React sull'`eval()` bloccato dalla Content Security Policy. Riguarda solo gli
strumenti di debug in modalità sviluppo, non il pannello in produzione.
