# 99. Final audit report

Struttura: `MASTER ADAPTIVE PRODUCT AUDIT, COMPLETE WORKFLOW`. Data: 2 ottobre 2026.
Fase di sola osservazione: nessun codice modificato, nessun commit, nessun deploy, nessuna migration su production, nessuna scrittura su production.

## Executive summary

Il flusso concordato funziona nel codice attuale, ed è provato in locale su un branch Neon vuoto con dati sintetici. Non è stata trovata nessuna falla di sicurezza o di privacy nel codice: il PR non riceve il telefono (nemmeno nel payload né dalla ricerca), non decide nulla, non vede le richieste altrui, e le decisioni sono sempre sul server. Conferma contro rifiuto nello stesso istante non produce stati impossibili.

**Il lancio non è bloccato dal codice, ma da quattro problemi di configurazione e di conformità:** l'informativa privacy è un segnaposto mentre il sito pubblicato è già indicizzabile; manca `SEGRETO_SESSIONE` su Production; le Preview di Vercel condividono il database di produzione; il dominio nuovo non è ancora collegato e `INDIRIZZO_SITO` non è impostata. La regola anti-flood sul bordo, invece, c'è già.

Nessun P0 confermato. Quattro P1, sette P2, nove P3.

**Limiti.** Tutte le prove runtime sono in locale. Production è stata letta solo in sola lettura. Non verificati: push su un iPhone vero, i biglietti Wallet nuovi con firma vera (nome lungo e retro), Safari e Firefox reali, persone vere, comportamento di `x-forwarded-for` su Vercel.

## Applicability Matrix

Vedi `00_applicability_matrix.md` (28 righe). Sintesi: eseguiti A, B, C, D, E, H, J, K, UI, prestazioni, SEO, conversione, moduli, abuso, integrazioni, osservabilità, errori, dati, confini, completezza, reality check. Parziali: G, UX, accessibilità, compatibilità. Non applicabili: pagamenti, tempo reale, app nativa. Bloccato: prova con persone vere.

## Finding

Formato del MASTER, condensato nei campi che contano. Classe di evidenza fra parentesi.

### P0 aperti

Nessuno confermato. Per la falla più probabile (telefono visibile al PR) esiste un test: 42 prove, il numero non compare in nessuna pagina, azione, ricerca o payload del PR (RUNTIME-CONFIRMED, locale). Non è una prova su production.

### P1 aperti (bloccano il lancio)

**F-01. Informativa privacy e cookie segnaposto, nessun titolare né partita IVA, sito già indicizzato.**
Dominio: privacy, completezza. Classe: SOURCE-CONFIRMED (testo delle pagine: "anteprima"), RUNTIME-CONFIRMED (lettura pubblica del sito pubblicato: `robots.txt` con `Allow: /` e `meta robots: index, follow`).
Atteso: informativa e partita IVA in home prima di raccogliere nome e telefono.
Attuale: segnaposto; il sito pubblicato è aperto ai motori di ricerca; non so se arrivino richieste vere (decisione D-10).
Utenti: chiunque compili il modulo. Impatto: conformità e fiducia.
File: `src/app/(sito)/privacy/page.tsx`, `src/app/(sito)/cookie/page.tsx`, `src/componenti/sito/PiePagina.tsx`.
Direzione: bozza di informativa e dati nel piè di pagina, da approvare (servono D-01, D-03, D-05).

**F-02. `SEGRETO_SESSIONE` manca su Vercel Production.**
Classe: RUNTIME-CONFIRMED (nomi delle variabili di Production, sola lettura), SOURCE-CONFIRMED (`controllaConfigurazione` lancia un errore in produzione).
Atteso: variabile presente. Attuale: assente. Impatto: dopo il deploy il pannello (Luca e PR) non funziona e mostra un errore di configurazione.
Direzione: aggiungerla con un comando che non mostra il valore (con il via di Edoardo).

**F-03. Le Preview di Vercel scrivono sul database di produzione.**
Classe: RUNTIME-CONFIRMED (`DATABASE_URL` e le variabili di Neon hanno ambienti "Preview, Production"), SOURCE-CONFIRMED (`db()` lancia le migrazioni alla prima richiesta). La creazione di una Preview dopo un push è HYPOTHESIS: dipende dal collegamento a GitHub (`origin` esiste).
Attuale: una Preview eseguirebbe la migrazione e le scritture sul database vero.
Direzione: branch Neon vuoto solo per le anteprime e variabili di Preview separate. **Fino ad allora non fare push.**

**F-04. Dominio non collegato e `INDIRIZZO_SITO` non impostata.**
Classe: RUNTIME-CONFIRMED (Hostinger: `lucacalifornia.it` punta alla pagina di parcheggio, dati forniti da Edoardo), SOURCE-CONFIRMED (`INDIRIZZO` ha come valore di partenza `lucacalifornia.satoshiweb.it`).
Impatto: canonical, anteprime, sitemap, link `/pr/<codice>` e identità push puntano al vecchio indirizzo; senza redirect si perde il posizionamento (D-02).
Direzione: collegare il dominio a Vercel, DNS e HTTPS, redirect dal vecchio, impostare `INDIRIZZO_SITO`.

### P2 aperti

**F-05. L'elenco di Luca non si aggiorna da solo.** (SOURCE-CONFIRMED: nessun timer né aggiornamento periodico.) Una richiesta nuova si vede aprendo la notifica, o ricaricando, o dopo un'azione. Se la notifica non arriva, Luca non se ne accorge finché non apre il pannello. Decisione D-06.

**F-06. Consegna reale della push non verificata.** (NOT-VERIFIED.) Provata solo verso un finto servizio locale. Luca deve avere le notifiche attive sul suo iPhone (su iPhone richiedono l'app aggiunta alla schermata Home): serve un test sul suo dispositivo.

**F-07. Osservabilità assente.** (SOURCE-CONFIRMED, RUNTIME-CONFIRMED: durante i test un errore di configurazione della push è stato ingoiato in silenzio.) Nessun avviso se la push, il Wallet o il database falliscono; solo `console.error`. Per poche decine di richieste al giorno basta un controllo periodico, ma serve un modo per accorgersene.

**F-08. Home da 4,6 a 5,0 MB.** (RUNTIME-CONFIRMED, locale; budget consigliato 1 MB.) Video e foto. Le fasi precedenti avevano già ottimizzato il caricamento del video (storico). Il resto del sito pesa 0,6 a 1,2 MB.

**F-09. Biglietti Wallet nuovi non verificati con firma vera.** (NOT-VERIFIED.) Verificato: dati (124/124), firma di prova, fronte in Apple Wallet con un biglietto di produzione (RUNTIME-CONFIRMED). Non verificati: nome lungo e retro. La password della chiave non è leggibile dalla riga di comando di Vercel. Resta il test sul tuo iPhone.

**F-12. Cookie di Luca: impronta con sale fisso e pubblico.** (SOURCE-CONFIRMED: `f = HMAC(SALE fisso, password)`, e il vecchio formato è accettato.) Se un cookie viene copiato, la password si può cercare fuori linea; con una password lunga e casuale il rischio è trascurabile. Il cookie è `HttpOnly`, `Secure`, `SameSite=Lax`. Decisione D-09.

**F-20. Le suite di test non sono nel repository, e il codice non è committato.** (SOURCE-CONFIRMED.) Circa 130 modifiche non committate; il commit attuale non compila senza i file non tracciati; i test stanno nella cartella di lavoro della sessione. Perdita di lavoro e nessuna regressione protetta. Se il progetto Vercel è collegato a GitHub, un push su `main` potrebbe lanciare un deploy di produzione (NOT-VERIFIED).

### P3 aperti

| ID | Titolo | Classe | Nota |
|---|---|---|---|
| F-11 | Production risponde ancora alla demo del biglietto (`/api/pass/demo`) e a `ABILITA_PASS_DEMO` | RUNTIME-CONFIRMED (lettura pubblica) | Sparisce con il deploy; poi togliere la variabile |
| F-13 | Un doppio invio crea due richieste | RUNTIME-CONFIRMED | D-04 |
| F-14 | La push resta iscritta anche dopo "Esci" | SOURCE-CONFIRMED | Il dispositivo continua a ricevere i nomi; poco rilevante con un solo telefono |
| F-15 | Nessuno storico delle decisioni | SOURCE-CONFIRMED | D-07 |
| F-16 | 404 e errori predefiniti di Next; niente `apple-touch-icon` | RUNTIME-CONFIRMED | Estetica |
| F-17 | Nessun `h1` nel dettaglio su telefono; tastiera e screen reader non verificati | RUNTIME-CONFIRMED / NOT-VERIFIED | |
| F-18 | Con il database giù, pannello e `/pr/<codice>` danno un errore generico (500) | RUNTIME-CONFIRMED | Il modulo pubblico risponde bene (503 con messaggio) |
| F-19 | "Vedi tutte su Telegram" sfora a 360 e 390 px | RUNTIME-CONFIRMED | Già così prima |
| F-21 | README e handoff non aggiornati | SOURCE-CONFIRMED | |

## Aggiornamento dopo l'audit (2 ottobre 2026, con il via di Edoardo)

Chiusi in configurazione, da riverificare con una Preview:

- **F-02** `SEGRETO_SESSIONE` aggiunta a Production (sensitive, valore casuale mai mostrato).
- **F-03** Le 15 variabili del database non valgono più per Preview (solo Production, valori invariati). Per Preview c'è una `DATABASE_URL` propria sul branch Neon vuoto `anteprima-vercel` (endpoint diverso da production, 0 righe in ogni tabella, verificato). Il sito pubblicato risponde come prima (home, `/prenota`, `/pannello/accesso`).

Correzione di un consiglio dato nell'audit: per le variabili sensitive (Wallet, `SITO_PUBBLICO`, `PANNELLO_PASSWORD`...) non esiste nemmeno l'"occhio" nel pannello di Vercel. La password della chiave Apple non si può rileggere: va ritrovata altrove o rigenerata.

- **F-04 (parziale)** Dominio aggiunto al progetto Vercel (apex principale, `www` che rimanda con 308) e `INDIRIZZO_SITO` impostata per il prossimo deploy. Restano: DNS su Hostinger (oggi NXDOMAIN al DNS pubblico), redirect dal vecchio indirizzo (D-02), canonical da verificare dopo il deploy.

Restano aperti F-01, il resto di F-04 e gli altri.

## Cause radice

1. **Configurazione di Production non allineata al codice** (F-02, F-03, F-04, F-11): variabili mancanti, Preview che condivide il database, dominio nuovo. Si risolve con un'unica sessione di configurazione.
2. **Passaggio dal prototipo al lancio senza i documenti** (F-01, D-01, D-05): l'informativa e i dati dell'attività non sono mai stati inseriti.
3. **Lavoro non consolidato** (F-20, F-21): codice non committato, test fuori dal repository.
4. **Nessun occhio sul sistema** (F-05, F-06, F-07): se qualcosa si ferma, nessuno lo sa.

## Cosa è effettivamente pronto

Con prova runtime in locale sul codice attuale: stati e decisioni, motivo del rifiuto, cambio di decisione, concorrenza; PR senza telefono e senza poteri; attribuzione dal link; gestione PR (spegni, rinomina, password); analytics con serie giornaliera, settimanale e mensile; anti-spam e validazione (data inclusa); push solo a Luca e senza bloccare la richiesta; messaggi WhatsApp approvati (cinque conferme e rifiuto); Wallet (dati, firma, idempotenza, 410 dopo un rifiuto, navetta senza biglietto); rotte del vecchio flusso rimosse; interfaccia a 390 e 1440 px; migrazione dallo schema di produzione.

## Cosa blocca il lancio

F-01, F-02, F-03, F-04. Più, per scelta di Edoardo, il test del Wallet sull'iPhone (F-09) e la decisione sul sito già indicizzato (D-10).

## Miglioramento post-lancio

F-05 (se si accetta la notifica come unico avviso), F-07, F-08 (home pesante), F-12 (rimuovere il vecchio cookie), F-13, F-14, F-15, F-16, F-17, F-18, F-19, F-21, persone vere se si fa un lancio morbido.

## Decisioni di Edoardo

Vedi `product_decisions.md`: D-01 titolare e dati legali, D-02 dominio e redirect, D-03 consenso alle statistiche, D-04 doppioni, D-05 conservazione dati, D-06 aggiornamento automatico, D-07 storico, D-08 prova con persone, D-09 cookie di Luca, D-10 sito già online.

## Test sul tuo iPhone / ambiente reale

1. Wallet: i sei biglietti dello script con la tua password (nome lungo e retro).
2. Push: notifiche attive sul telefono di Luca, richiesta di prova, notifica che arriva e porta alla richiesta.
3. WhatsApp: da una richiesta confermata si apre il messaggio verso il numero giusto con il link; dal rifiuto, il messaggio con il motivo.
4. Modulo e `/pr/<codice>` su Safari del telefono.
5. Smoke finale sul dominio vero dopo il collegamento.

## Configurazione di Production richiesta

`SEGRETO_SESSIONE` (nuova); Preview con database separato; `INDIRIZZO_SITO` con il dominio definitivo; dominio collegato a Vercel con DNS e HTTPS, redirect dal vecchio indirizzo; `SITO_PUBBLICO` coerente con la decisione D-10; `PANNELLO_PASSWORD` lunga e casuale (D-09); rimozione di `ABILITA_PASS_DEMO`; controllo che tutte le variabili del Wallet siano valide. La regola anti-flood sul bordo è già attiva (60 richieste al minuto per IP su `/api/`).

## Piano minimo per arrivare al deploy

1. **Decisioni:** D-01, D-02, D-10 (le altre non bloccano).
2. **Configurazione senza deploy (con il tuo via per ognuna):** `SEGRETO_SESSIONE`; branch Neon vuoto per le anteprime e variabili di Preview separate; `PANNELLO_PASSWORD` nuova.
3. **Privacy:** bozza di informativa, cookie e piè di pagina con i dati di D-01, approvata da te.
4. **Dominio:** collegare `lucacalifornia.it` a Vercel, DNS e HTTPS su Hostinger, redirect dal vecchio, `INDIRIZZO_SITO`.
5. **Wallet:** i biglietti di prova sul tuo iPhone.
6. **Repository:** salvare le suite nel repository, commit pulito (senza `.claude/skills/` e `skills-lock.json`), **senza push** finché F-03 non è chiuso.
7. **Smoke finale su una Preview con database separato**, con il dominio nuovo.
8. **Punto di ripristino:** un branch Neon di copia del database di produzione prima della migrazione.
9. **Il tuo via esplicito:** migrazione (parte da sola alla prima richiesta) e deploy; subito dopo uno smoke sul dominio vero. Marcia indietro: ripristino istantaneo di Vercel; la migrazione è additiva e porta le richieste "nuova" in "in attesa".

## Bloccato / non verificato

- Prova con persone vere (BLOCKED).
- Push su un dispositivo vero; biglietti Wallet nuovi (nome lungo e retro).
- Safari, Firefox e Android reali.
- Comportamento in production (non misurato).
- `x-forwarded-for` su Vercel (HYPOTHESIS: si assume che Vercel riscriva l'intestazione).
- Efficacia della regola anti-flood su production (la configurazione c'è; non si provoca un flood su production).

## Prossimi passi consigliati

Per gravità e dipendenza: D-01 e D-10 (sbloccano privacy e stato del sito), poi configurazione (F-02, F-03, F-04), poi Wallet e push sul tuo iPhone, poi commit, smoke, via.

Il pacchetto di rimedio (`100_remediation_package.md`) si scrive dopo la tua approvazione di questo audit, come da MASTER.
