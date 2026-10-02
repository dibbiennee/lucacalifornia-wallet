# Configurazione di lancio

Cosa va impostato su Vercel **prima** del primo deploy di produzione, e cosa succede
al primo avvio. Nessun segreto sta in questo file né nel repository: i valori si
mettono solo nelle variabili d'ambiente di Vercel (Project Settings, Environment
Variables, ambiente Production).

## Variabili d'ambiente

| Variabile | Obbligatoria | A cosa serve |
|---|---|---|
| `DATABASE_URL` | Sì | Stringa di connessione del database Neon **di produzione** (progetto `little-term-06153420`, branch `main`). Senza, il sito non salva le richieste. Mai quella di un branch di prova. |
| `PANNELLO_PASSWORD` | Sì | Password di Luca, almeno 8 caratteri. |
| `SEGRETO_SESSIONE` | Sì | Firma delle sessioni (Luca e PR), almeno 32 caratteri casuali. Senza, in produzione il pannello si ferma con un errore di configurazione. |
| `SEGRETO_BIGLIETTO` | Sì | Chiave che cifra il biglietto Wallet, almeno 16 caratteri. Se cambia, i biglietti già consegnati smettono di aprirsi. |
| `VAPID_PRIVATE_KEY` | Sì per le notifiche | Metà privata della chiave push (la pubblica sta in `src/lib/push.ts`). Senza, la richiesta si salva lo stesso ma a Luca non arriva l'avviso. |
| `INDIRIZZO_SITO` | Sì | Il dominio definitivo con `https://` e senza barra finale. Lo usano i link dei PR (`/pr/<codice>`), le anteprime e l'identità della push (deve essere `https`). |
| `SITO_PUBBLICO` | Il giorno del lancio | `1` toglie il `noindex` dalle pagine e apre `robots.txt`. Tenerlo vuoto finché non si vuole essere trovati. |
| `PASS_TYPE_IDENTIFIER` | Sì | `pass.it.satoshiweb.lucacalifornia` (identificativo Apple del biglietto). |
| `APPLE_TEAM_IDENTIFIER` | Sì | Team ID Apple: `CYZ7XKRGWR`. |
| `PASS_SIGNER_CERT_BASE64` | Sì | Certificato di firma Apple, PEM in base64 su una riga. |
| `PASS_SIGNER_KEY_BASE64` | Sì | Chiave di firma, PEM in base64 su una riga. |
| `PASS_SIGNER_KEY_PASSPHRASE` | Sì | Password con cui è cifrata la chiave di firma. Nel `.env.local` locale attuale è vuota: va recuperata (vedi sotto). |
| `PASS_WWDR_BASE64` | Sì | Certificato intermedio Apple (WWDR), PEM in base64. |

Per convertire un PEM: `base64 -i certs/signerCert.pem | pbcopy` (e lo stesso per gli altri due).

`ABILITA_PASS_DEMO` non serve più: la demo del biglietto è stata rimossa.

## Stato attuale su Vercel (controllato il 2 ottobre 2026, solo i nomi)

Ambiente Production, già presenti: `DATABASE_URL` (anche in Preview), `PANNELLO_PASSWORD`,
`SEGRETO_BIGLIETTO`, `VAPID_PRIVATE_KEY`, `SITO_PUBBLICO`, e tutte le variabili del
Wallet (`PASS_TYPE_IDENTIFIER`, `APPLE_TEAM_IDENTIFIER`, `PASS_SIGNER_CERT_BASE64`,
`PASS_SIGNER_KEY_BASE64`, `PASS_SIGNER_KEY_PASSPHRASE`, `PASS_WWDR_BASE64`).
`ABILITA_PASS_DEMO` c'è ancora ma non serve più: si può togliere.

**Fatto il 2 ottobre 2026 (con il via di Edoardo):**

- `SEGRETO_SESSIONE` aggiunta a Production (tipo sensitive, valore casuale di 64 caratteri, mai mostrato).
- Preview separata dal database di produzione: le 15 variabili del database (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `POSTGRES_*`, `PG*`, `NEON_PROJECT_ID`) valevano per "Preview, Production" e ora valgono **solo per Production** (valori invariati). Per Preview c'è una `DATABASE_URL` propria che punta al branch Neon `anteprima-vercel`, creato vuoto (solo schema, nessun dato di produzione). Per tornare indietro: `python3 vercel-env-target.py --ripristina <NOME>` (script della sessione di lavoro) o il pannello di Vercel.

- Dominio: `lucacalifornia.it` (principale) e `www.lucacalifornia.it` (rimanda al principale con redirect 308) aggiunti al progetto Vercel. Non cambia nessun traffico finché il DNS su Hostinger non punta a Vercel.
- `INDIRIZZO_SITO=https://lucacalifornia.it` aggiunta a Production (variabile normale, leggibile). Vale dal prossimo deploy: il sito online adesso non cambia.

**Record DNS da inserire su Hostinger (quelli che Vercel raccomanda, 2 ottobre 2026):**

| Tipo | Nome | Valore | Note |
|---|---|---|---|
| A | `@` | `216.198.79.1` e `64.29.17.1` | Due record A. In alternativa, più vecchio: `76.76.21.21` |
| CNAME | `www` | `45c48af42e6a3b5c.vercel-dns-017.com.` | In alternativa: `cname.vercel-dns.com.` |

Vanno **sostituiti** i due record attuali (A `@` verso `2.57.91.91`, CNAME `www` verso `lucacalifornia.it`), non affiancati. I nameserver non si toccano.

**Mancano ancora:**

- DNS: `lucacalifornia.it` oggi risponde NXDOMAIN al DNS pubblico (non risulta ancora attivo), anche se il pannello di Hostinger mostra i record.
- Redirect da `lucacalifornia.satoshiweb.it` al nuovo dominio: decisione D-02, non fatto.
- Per provare un'anteprima completa servono variabili di Preview proprie (`PANNELLO_PASSWORD`, `SEGRETO_SESSIONE`, `SEGRETO_BIGLIETTO`): quelle di Production sono "sensitive" e non si possono copiare. Il Wallet non si può provare in Preview (la chiave di firma è solo in Production).

Da sapere:

- Le variabili del Wallet, `PANNELLO_PASSWORD`, `SEGRETO_BIGLIETTO`, `VAPID_PRIVATE_KEY`, `SITO_PUBBLICO` e `SEGRETO_SESSIONE` sono **sensitive**: nessuno le può rileggere, nemmeno dal pannello di Vercel. Si possono solo sostituire.
- `SITO_PUBBLICO` è già impostata in Production e il sito pubblicato risulta indicizzabile (`index, follow`): il valore sarà `1`.
- Il `.env.local` locale è un'esportazione di Vercel con tutti i valori vuoti: non serve per firmare i biglietti in locale.

## Il dominio definitivo

Il sito supporta un solo dominio principale, con queste rotte:

- `/` il sito pubblico
- `/pr/<codice>` il modulo di un PR (solo il modulo, nessuna testata né piè di pagina)
- `/pannello`, `/pannello/home` e le altre schermate del pannello
- percorsi corti di provenienza: `/ig`, `/s`, `/tt`, `/wa` e gli alias `/tiktok`, `/storiainstagram`, `/instagram`, `/whatsapp`

Non servono domini separati per i PR. Quando il dominio è scelto: impostare
`INDIRIZZO_SITO`, aggiungere il dominio al progetto Vercel e controllare che i link
copiati dal pannello ("Copia il link") abbiano l'indirizzo giusto.

Resta scritto nel codice solo l'identificativo degli eventi del calendario
(`@lucacalifornia.satoshiweb.it` in `src/app/api/calendario/[codice]/route.ts`): è un
identificativo, non un indirizzo che si visita, e cambiarlo farebbe risultare nuovi gli
eventi già salvati nei calendari delle persone.

## Cosa succede al primo avvio in produzione

Il database si prepara da solo alla prima richiesta (`db()` in `src/lib/db.ts`,
istruzioni idempotenti). Sul database di produzione di oggi, che ha solo le tabelle
`richieste`, `pr` e `iscrizioni_push`, il primo avvio:

1. crea `account`, `tentativi_accesso`, `eventi_speciali`, `lista_attesa` e `traffico`;
2. aggiunge colonne a `richieste` (PR, Wallet, motivo del rifiuto) e a `pr` (attivo);
3. aggancia le richieste che dicevano "Link di Marco" al PR giusto, solo se l'abbinamento è unico;
4. **porta in "in attesa" le richieste ancora "nuova"**: "nuova" non è più uno stato;
5. semina i PR storici (Marco, Sara, Davide) se mancano.

È una migrazione di produzione: va fatta solo con il via esplicito di Luca. È stata
provata due volte su un branch Neon con lo schema identico a quello di produzione.

## Prima del deploy

- [ ] Tutte le variabili qui sopra impostate su Vercel, ambiente Production.
- [ ] La password della chiave di firma Apple non si può rileggere da Vercel (è sensitive): se non è annotata altrove, rigenerare certificato e chiave (vedi README, sezione certificati) e aggiornare le variabili del Wallet.
- [ ] Provare un biglietto vero su un iPhone (il test su simulatore con una firma di prova non mostra il biglietto).
- [ ] Informativa privacy e cookie: oggi sono segnaposto ("anteprima"). Prima di raccogliere dati di persone vere va pubblicata, e deve citare le statistiche di visita (sessione anonima nella scheda del browser, segno "visitato" nella memoria locale, nessun indirizzo IP né dispositivo salvato).
- [x] Regola sul bordo contro le chiamate in massa: già attiva su Vercel (60 richieste ogni 60 secondi per IP su `/api/`, blocco di 1 minuto). Verificata in sola lettura con `python3 ~/.claude/strumenti/proteggi-api.py --mostra`.
- [ ] Dominio definitivo `lucacalifornia.it` (Hostinger): collegarlo al progetto Vercel con i valori DNS che Vercel indica, attendere HTTPS, redirect dal vecchio indirizzo, poi impostare `INDIRIZZO_SITO`.
- [ ] Commit pulito del codice (senza `.claude/skills/`, `skills-lock.json`, credenziali, file temporanei).
- [ ] Il via esplicito di Luca per deploy e migrazione.
