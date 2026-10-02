# Product decisions

Solo decisioni che spettano a Edoardo. Per ognuna: domanda, comportamento attuale, perché conta, opzioni, compromessi, decisione richiesta.

## D-01. Titolare del trattamento e dati legali

- **Domanda:** chi è il titolare, qual è la partita IVA, quale indirizzo si pubblica, a quale email si scrive per i dati personali?
- **Attuale:** l'informativa privacy e cookie sono segnaposto ("anteprima"). Nel sito non compaiono né titolare né partita IVA. Il sito pubblicato è già indicizzabile.
- **Perché conta:** il modulo raccoglie nome e telefono; l'informativa e la partita IVA in home sono obblighi per un sito italiano. Blocca il lancio (F-01).
- **Opzioni:** (a) mi dai i dati e preparo una bozza da approvare; (b) la fa un consulente.
- **Compromessi:** (a) più rapido, la bozza non è parere legale; (b) più sicuro, più lento.
- **Decisione richiesta:** i dati e l'opzione.

## D-02. Dominio: forma canonica e vecchio indirizzo

- **Domanda:** il dominio principale è `lucacalifornia.it` o `www.lucacalifornia.it`? Cosa succede a `lucacalifornia.satoshiweb.it`, che oggi è indicizzato?
- **Attuale:** `INDIRIZZO_SITO` non è impostata: canonical, anteprime, sitemap, link dei PR e identità della push puntano all'indirizzo vecchio. Su Hostinger `lucacalifornia.it` punta ancora alla pagina di parcheggio.
- **Opzioni:** (a) `lucacalifornia.it` principale, `www` che rimanda, il vecchio rimanda al nuovo con redirect permanente; (b) il vecchio resta online in parallelo (contenuto duplicato).
- **Compromessi:** (a) conserva il posizionamento e un solo indirizzo nei link dei PR; richiede il redirect su Vercel. (b) più semplice, ma due siti uguali.
- **Decisione richiesta:** (a) o (b), e apex o www.

## D-03. Statistiche di visita: consenso

- **Domanda:** la sessione anonima nella scheda e il segno "già visitato" (memoria locale) richiedono un banner di consenso?
- **Attuale:** nessun banner. Non si salvano IP, dispositivo o altri identificativi.
- **Perché conta:** le regole sui dati in memoria del dispositivo cambiano a seconda dell'interpretazione. Non è una decisione tecnica.
- **Opzioni:** (a) nessun banner, con informativa chiara (rischio da valutare); (b) togliere il segno "già visitato" e perdere "visite nuove"; (c) banner di consenso.
- **Decisione richiesta:** a o b o c, dopo il parere legale.

## D-04. Richieste duplicate

- **Domanda:** se la stessa persona manda due volte la stessa richiesta (stesso telefono, serata, tipo), la si unisce, la si segnala a Luca, o resta così?
- **Attuale:** si creano due richieste (provato). Il pulsante del modulo si spegne durante l'invio, quindi il doppio clic normale non succede.
- **Opzioni:** (a) lasciare; (b) etichetta "possibile doppione" nell'elenco; (c) rifiutare il secondo invio.
- **Compromessi:** (a) nessun lavoro; (b) piccolo lavoro, nessun rischio di perdere una richiesta vera; (c) può bloccare chi corregge un dato.
- **Decisione richiesta:** a, b o c.

## D-05. Conservazione e cancellazione dei dati

- **Domanda:** per quanto si tengono richieste e telefoni? Come si cancella una persona che lo chiede?
- **Attuale:** non si cancella mai; non esiste una procedura.
- **Opzioni:** (a) conservare tutto finché serve a Luca e cancellare a mano su richiesta; (b) cancellazione automatica dopo N mesi; (c) pulsante di cancellazione nel pannello.
- **Decisione richiesta:** periodo e metodo, da riportare nell'informativa.

## D-06. Aggiornamento automatico dell'elenco

- **Domanda:** Luca vuole che l'elenco si aggiorni da solo quando arriva una richiesta?
- **Attuale:** no. Si vede una richiesta nuova aprendo la notifica, o ricaricando la pagina o toccando un'azione.
- **Opzioni:** (a) lasciare, contando sulla notifica; (b) aggiornamento ogni 30 secondi mentre la scheda è visibile; (c) tempo reale (WebSocket), sproporzionato per poche decine di richieste al giorno.
- **Decisione richiesta:** a o b.

## D-07. Storico delle decisioni

- **Domanda:** serve sapere quando e come è cambiata una richiesta (conferma, rifiuto, cambio)?
- **Attuale:** si vede solo lo stato di adesso.
- **Opzioni:** (a) niente (Luca è l'unico che decide); (b) una riga di storico per ogni cambio.
- **Decisione richiesta:** a o b.

## D-08. Prova con persone vere prima del lancio

- **Domanda:** si fa un giro con 4 o 6 clienti e Luca, o si lancia e si osserva?
- **Attuale:** non fatta. Il MASTER la richiede e non va inventata.
- **Opzioni:** (a) prova breve prima (Luca e un paio di amici con il link di un PR); (b) lancio morbido (solo i PR, poi Instagram).
- **Decisione richiesta:** a o b.

## D-09. Cookie di Luca

- **Domanda:** si accetta il rischio del vecchio formato del cookie (F-12) con una password forte, o si toglie?
- **Attuale:** il cookie contiene un'impronta della password con un sale fisso e pubblico, e il vecchio formato è ancora accettato.
- **Opzioni:** (a) password lunga e casuale (almeno 20 caratteri) e basta; (b) eliminare il vecchio formato e l'impronta (piccola modifica).
- **Decisione richiesta:** a o b. Consiglio b dopo il lancio, e a subito.

## D-10. Sito già online durante la preparazione

- **Domanda:** il sito pubblicato è indicizzabile adesso con il codice vecchio. Lo si lascia così fino al nuovo lancio?
- **Attuale:** `SITO_PUBBLICO=1` su Production. Il sito mostra il modulo e l'informativa segnaposto; nel sito pubblicato risponde anche `/api/pass/demo`.
- **Opzioni:** (a) lasciarlo; (b) rimettere `SITO_PUBBLICO` vuota fino al lancio.
- **Compromessi:** (b) nasconde il sito ai motori di ricerca, non lo chiude; se arrivano già richieste vere, il pannello vecchio è quello in uso.
- **Decisione richiesta:** dimmi se oggi arrivano richieste vere dal sito pubblicato.
