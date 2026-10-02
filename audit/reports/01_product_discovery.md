# 01. Product discovery

Fonti: sorgente del repository (worktree `lucid-mclean-b12fe4`, `main` con circa 130 modifiche non committate), database di test, lettura pubblica del sito pubblicato.

## Scopo e utenti

Sito di Luca California (PR e organizzatore di serate a Roma, ROOM26) con una webapp di gestione.

- **Visitatore:** arriva da Instagram, TikTok o dal sito, vede le serate, compila un solo modulo (tavolo, lista, bracciale) o la richiesta navetta.
- **Luca (owner):** riceve le richieste in un pannello, decide, chiama, scrive su WhatsApp a mano.
- **PR:** ha un link personale `/pr/<codice>` che mostra solo il modulo, e una dashboard in sola lettura delle persone che ha portato.

## Ruoli e permessi (PRODUCT-DECISION, SOURCE-CONFIRMED)

| Azione | Luca | PR | Visitatore |
|---|---|---|---|
| Inviare una richiesta | sì | sì (dal link) | sì |
| Vedere tutte le richieste | sì | no, solo le sue | no |
| Vedere il telefono del cliente | sì | **no, non viene letto dal database** | no |
| Confermare, rifiutare, rimettere in attesa | sì | no | no |
| Aprire il biglietto Wallet | sì (e chi ha il link) | no | solo con il link |
| Creare, spegnere, rinominare un PR; password | sì | no | no |
| Analytics del sito e di ogni PR | sì | solo del proprio link | no |
| Lista d'attesa (Halloween, Capodanno) | sì | no | iscrizione pubblica |

## Entità e stati

- **richieste:** nome, telefono, serata, data, tipo (tavolo, lista, bracciale, navetta), stato, motivo del rifiuto, `pr_id`, provenienza, dati del Wallet (serial, token, stato).
- **Stati:** `in attesa`, `confermata`, `rifiutata`; passaggi liberi fra i tre, solo Luca; il rifiuto richiede un motivo dell'elenco fisso; il motivo si azzera uscendo da "rifiutata".
- **pr / account:** il PR (codice, attivo) e il suo accesso (hash scrypt della password, versione di sessione).
- **traffico:** una riga per sessione e per evento (visita, inizio, invio); nessun IP né dispositivo. Nota: l'IP è invece salvato in `tentativi_accesso` (limitatore), mai cancellato (F-22, post-lancio).
- **lista_attesa, eventi_speciali, iscrizioni_push, tentativi_accesso.**

## Percorsi principali

1. Visitatore → sito → serata → modulo → richiesta in attesa → push a Luca → Luca apre la richiesta → decide → (conferma) biglietto Wallet + messaggio WhatsApp già scritto → Luca lo invia a mano.
2. PR → `/pr/<codice>` → solo il modulo → richiesta attribuita al PR dal server → Luca vede "PR <nome>"; il PR vede nome, stato, motivo, mai il telefono.
3. Luca gestisce i PR (nuovo, codice, password, spegni), guarda le analisi.

## Dati sensibili (mappa per E e 21)

| Dato | Dove sta | Chi lo legge | Dove potrebbe comparire |
|---|---|---|---|
| Telefono del cliente | `richieste.telefono` | Luca; per un PR la colonna non viene richiesta | Pagina e payload di Luca; link `tel:` e `wa.me`; notifica push **no** (la push porta nome, tipo, serata) |
| Messaggio libero del cliente | `richieste.messaggio` | Luca | Può contenere un numero: non va al PR |
| Nome del cliente | `richieste.nome` | Luca, PR (solo suoi) | Titolo della notifica push, biglietto Wallet, QR cifrato |
| Password dei PR | hash scrypt | nessuno; in chiaro una volta sola a Luca alla creazione | Messaggio "Copia l'accesso" (appunti di Luca) |
| Sessioni | cookie firmato `HttpOnly`, `SameSite=Lax`, `Secure` | il browser | non esposto allo script |
| Traffico | `traffico` | Luca; PR solo il proprio | nessun IP né dispositivo |

## Rotte e superficie

Pubbliche: `/`, `/prenota`, `/tavoli`, `/navetta`, `/capodanno`, `/serate/*`, `/chi-sono`, `/diventa-pr`, `/privacy`, `/cookie`, `/pr/<codice>`, `/<canale>` (rimandi), `/api/richiesta`, `/api/lista-attesa`, `/api/traffico`, `/api/calendario/*`, `/api/pass/<token>`, `/api/pannello/accesso`.
Protette: `/pannello/*` (home PR, richieste, attesa, riepilogo, squadra, analisi), `/api/conferma`, `/api/pannello/iscrizione-push`, azioni del pannello. Rimosse: `/staff/scan`, `/api/verifica`, `/api/pass/demo`, `/biglietto/*`, `/pannello/porta`.

## Dipendenze esterne

Neon (Postgres), Vercel (hosting, variabili, Preview), web push (browser di Luca), Apple Wallet (firma con il Pass Type ID), WhatsApp (solo link `wa.me`, nessuna API), Instagram e Telegram (link). Nessun servizio di email, SMS, pagamenti o analytics di terzi.

## Configurazione di produzione

Vedi `docs/configurazione-lancio.md`. Presenti su Vercel Production: database, password di Luca, chiave del biglietto, VAPID, `SITO_PUBBLICO`, variabili del Wallet. **Mancano:** `SEGRETO_SESSIONE`, `INDIRIZZO_SITO`. Il dominio definitivo (`lucacalifornia.it`) è stato acquistato (Hostinger) e non è ancora collegato a Vercel.

## Limiti di questo audit

Nessun accesso al database di produzione né ai log; nessun dispositivo (iPhone) per push e Wallet dei biglietti nuovi; nessuna persona vera; solo Chromium; il comportamento di `x-forwarded-for` su Vercel non è stato misurato.
