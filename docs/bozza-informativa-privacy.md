# Bozza informativa privacy e cookie (DA APPROVARE)

**Testo pubblicato:** vale quello in `src/contenuti/legale.ts`, che dichiara anche l'IP del limitatore. Questa bozza resta come traccia.

**Aggiornamento:** per ora partita IVA e indirizzo restano **fuori** (decisione di Edoardo). Il testo si pubblica senza, citando solo titolare ed email. Le frasi e il piè di pagina qui sotto con `[PARTITA IVA]` e `[INDIRIZZO]` vanno lette senza quei due pezzi. Nota: per un sito che promuove un'attività la partita IVA in home è normalmente richiesta; è una scelta da riprendere prima del lancio.

**Stato: bozza.** Non è pubblicata e non è un parere legale: va riletta da chi la firma e, se possibile, da un consulente. I dati tra parentesi quadre mancano e vanno forniti. I punti marcati **[DECISIONE]** dipendono da scelte di Edoardo (vedi `audit/reports/product_decisions.md`).

Cosa dice questa bozza è stato controllato sul funzionamento del sito, non inventato: ogni elenco corrisponde a ciò che il codice raccoglie davvero.

## Dati che servono

| Segnaposto | Cosa è |
|---|---|
| `[TITOLARE]` | Nome e cognome, o ragione sociale, del titolare del trattamento |
| `[PARTITA IVA]` | Partita IVA |
| `[INDIRIZZO]` | Sede o indirizzo di contatto, se si vuole pubblicare |
| `[EMAIL]` | Email a cui scrivere per i dati personali |
| `[CONSERVAZIONE]` | Per quanto si conservano le richieste **[DECISIONE D-05]** |

---

## Informativa sul trattamento dei dati personali

**Chi tratta i tuoi dati.** Il titolare del trattamento è `[TITOLARE]`, partita IVA `[PARTITA IVA]`, `[INDIRIZZO]`. Per qualsiasi domanda sui tuoi dati scrivi a `[EMAIL]`.

**Quali dati raccogliamo e perché.**

- **Quando mandi una richiesta** (tavolo, bracciale, lista): nome, cognome e numero di telefono; la serata, la data e il tipo di richiesta; il numero di persone. Per un tavolo anche il tipo di gruppo, il budget, l'occasione e le note che scegli di scrivere. Per un bracciale se è per una donna o per un uomo. Li usiamo per rispondere alla tua richiesta, contattarti per telefono o su WhatsApp e, se la richiesta è confermata, prepararti il biglietto.
- **Quando chiedi la navetta:** nome, telefono, serata e la zona da cui parti.
- **Quando ti metti in lista d'attesa** (per esempio per un evento speciale): nome e un telefono o un'email, per avvisarti.
- **Il biglietto per Apple Wallet:** contiene il tuo nome, la serata, la data, il tipo di richiesta e un codice. Lo scarichi tu, dal link che ti manda Luca.
- **Come sei arrivato:** se apri un link personale (per esempio quello di un PR) la richiesta viene collegata a quel link, così sappiamo chi ti ha portato. Il PR vede il tuo nome e come è andata la richiesta (in attesa, confermata o rifiutata, con il motivo). **Non vede il tuo numero di telefono.**
- **Statistiche di visita:** contiamo le visite, quante persone iniziano e quante inviano il modulo. Le statistiche non salvano il tuo indirizzo IP né informazioni sul tuo dispositivo. Il solo punto in cui l'IP viene registrato è il limite ai tentativi di accesso al pannello e ai moduli (tabella `tentativi_accesso`). Vedi la sezione "Cookie e memoria del browser".

**Base giuridica.** Rispondere a una richiesta che hai fatto tu e preparare quello che chiedi (misure precontrattuali, art. 6.1.b GDPR). Per le statistiche anonime, il legittimo interesse a capire come funziona il sito (art. 6.1.f). **[DECISIONE D-03: da confermare con un parere legale, perché dipende da come si considerano i dati in memoria del browser.]**

**Chi può vedere i dati.**

- Luca, che gestisce le richieste e ti contatta: vede tutto quello che hai scritto.
- I PR vedono solo nome e stato delle richieste portate dal loro link, mai il telefono.
- Fornitori tecnici che conservano e trasmettono i dati per nostro conto: Vercel (ospitalità del sito) e Neon (database). Il database è su server negli Stati Uniti (regione `us-east-1`). **[Da verificare con il consulente: garanzie per il trasferimento fuori dall'Unione europea.]**
- Se ricevi un messaggio su WhatsApp, passa dalla piattaforma WhatsApp. Se aggiungi il biglietto ad Apple Wallet, passa da Apple.
- Non vendiamo i tuoi dati e non li usiamo per pubblicità.

**Per quanto li conserviamo.** `[CONSERVAZIONE]` **[DECISIONE D-05]**

**I tuoi diritti.** Puoi chiedere di vedere i tuoi dati, correggerli, cancellarli, limitarne l'uso o opporti, scrivendo a `[EMAIL]`. Se pensi che i tuoi dati non siano trattati correttamente puoi fare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).

**Obbligatorietà.** Nome e telefono servono per poterti rispondere: senza, non possiamo seguire la richiesta.

---

## Cookie e memoria del browser

Il sito non usa cookie di pubblicità né di profilazione, né strumenti di analisi di terzi.

| Cosa | A cosa serve | Quanto dura |
|---|---|---|
| Cookie `da` | Ricordare da quale link sei arrivato (per esempio Instagram o TikTok) e collegarlo alla tua richiesta | 30 giorni |
| Cookie `pannello` | Tenere aperta la sessione nell'area riservata (solo Luca e i PR) | Fino a che si esce, oppure un anno |
| Memoria della scheda (`lc_s`, `lc_n`) | Un numero casuale per contare una visita una volta sola, anche se apri più pagine | Finché chiudi la scheda |
| Memoria del dispositivo (`lc_v`) | Un segno senza valore che dice che questo browser è già stato sul sito, per distinguere visite nuove e ripetute | Finché non cancelli i dati del sito |

Non contengono dati che ti identificano. **[DECISIONE D-03: se serve un banner di consenso per gli ultimi due si decide con il parere legale. L'alternativa che evita la questione è togliere il segno `lc_v` e rinunciare al conteggio delle "visite nuove".]**

---

## Testo per il piè di pagina

> `[TITOLARE]` · P.IVA `[PARTITA IVA]` · `[INDIRIZZO]` · `[EMAIL]`
> Privacy · Cookie

(La partita IVA in home è un obbligo per i siti italiani.)

## Cosa succede dopo l'approvazione

1. Mi dai i dati e le decisioni D-03 e D-05.
2. Metto i testi nelle pagine `/privacy` e `/cookie` e nel piè di pagina, a 390 e 1440 px, con tipografia a posto.
3. Mi fai rileggere il risultato prima di qualsiasi pubblicazione.
