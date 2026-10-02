/**
 * I testi di privacy e cookie, e i dati del titolare.
 *
 * Ogni frase qui dentro descrive cosa il sito fa davvero: se il codice cambia
 * (un nuovo dato nel modulo, un nuovo cookie), questo file va riletto.
 *
 * Per ora il titolare è solo Luca Curella, con la sua email. Partita IVA e
 * indirizzo non ci sono: non vanno inventati né scritti come segnaposto.
 */

export const TITOLARE = "Luca Curella";
export const EMAIL_PRIVACY = "luca.curella91@gmail.com";

/** Dove compare l'email dentro un testo. */
export const SEGNO_EMAIL = "{email}";

export interface Voce {
  readonly titolo?: string;
  readonly testo: string;
}

export interface Sezione {
  readonly id: string;
  readonly titolo: string;
  readonly paragrafi?: readonly string[];
  readonly elenco?: readonly Voce[];
}

export const SEZIONI_PRIVACY: readonly Sezione[] = [
  {
    id: "titolare",
    titolo: "Chi tratta i tuoi dati",
    paragrafi: [
      `Il titolare del trattamento è ${TITOLARE}. Per qualsiasi domanda sui tuoi dati scrivi a ${SEGNO_EMAIL}.`,
    ],
  },
  {
    id: "dati",
    titolo: "Quali dati raccogliamo e perché",
    elenco: [
      {
        titolo: "Quando mandi una richiesta",
        testo:
          "Nome, cognome e numero di telefono, la serata, la data e il tipo di richiesta (tavolo, bracciale o lista) e il numero di persone. Per un tavolo anche il tipo di gruppo, il budget, l'occasione e le note che scegli di scrivere. Per un bracciale se è per una donna o per un uomo. Li usiamo per rispondere alla tua richiesta, contattarti al telefono o su WhatsApp e, se la richiesta è confermata, prepararti il biglietto.",
      },
      {
        titolo: "Quando chiedi la navetta",
        testo: "Nome, telefono, serata e la zona da cui parti.",
      },
      {
        titolo: "Quando ti metti in lista d'attesa",
        testo: "Nome e un numero di telefono o un'email, per avvisarti.",
      },
      {
        titolo: "Il biglietto per Apple Wallet",
        testo:
          "Contiene il tuo nome, la serata, la data, il tipo di richiesta e un codice. Lo scarichi tu, dal link che ti manda Luca.",
      },
      {
        titolo: "Come sei arrivato",
        testo:
          "Se apri un link personale, per esempio quello di un PR, la richiesta viene collegata a quel link, così sappiamo chi ti ha portato. Il PR vede il tuo nome e come è andata la richiesta (in attesa, confermata o rifiutata, con il motivo). Non vede il tuo numero di telefono.",
      },
      {
        titolo: "Statistiche di visita",
        testo:
          "Contiamo le visite, quante persone iniziano il modulo e quante lo inviano, senza salvare chi sei né che dispositivo usi. Vedi la pagina Cookie.",
      },
      {
        titolo: "Protezione dagli abusi",
        testo:
          "Per fermare chi manda richieste in massa teniamo un contatore legato all'indirizzo IP da cui arrivano. Come per ogni sito, anche il fornitore tecnico può registrare l'indirizzo IP nei registri di sistema.",
      },
    ],
  },
  {
    id: "base",
    titolo: "Perché possiamo usarli",
    paragrafi: [
      "Per rispondere a una richiesta che hai fatto tu e preparare quello che chiedi (art. 6.1.b del GDPR). Per le statistiche anonime e per la protezione dagli abusi, l'interesse legittimo a far funzionare il sito in sicurezza (art. 6.1.f).",
    ],
  },
  {
    id: "chi",
    titolo: "Chi può vedere i dati",
    elenco: [
      { testo: "Luca, che gestisce le richieste e ti contatta, vede tutto quello che hai scritto." },
      { testo: "I PR vedono solo il nome e lo stato delle richieste portate dal loro link, mai il telefono." },
      {
        testo:
          "I fornitori tecnici che conservano e trasmettono i dati per nostro conto: Vercel per il sito e Neon per il database. I dati sono su server negli Stati Uniti.",
      },
      {
        testo:
          "Se ricevi un messaggio su WhatsApp passa dalla piattaforma WhatsApp, e se aggiungi il biglietto ad Apple Wallet passa da Apple.",
      },
    ],
    paragrafi: ["Non vendiamo i tuoi dati e non li usiamo per fare pubblicità."],
  },
  {
    id: "conservazione",
    titolo: "Per quanto li conserviamo",
    paragrafi: [
      `Teniamo le richieste per il tempo che serve a gestire la serata e a ricontattarti. Puoi chiedere in qualsiasi momento di cancellare i tuoi dati scrivendo a ${SEGNO_EMAIL}.`,
    ],
  },
  {
    id: "diritti",
    titolo: "I tuoi diritti",
    paragrafi: [
      `Puoi chiedere di vedere i tuoi dati, correggerli, cancellarli, limitarne l'uso o opporti, scrivendo a ${SEGNO_EMAIL}. Se pensi che i tuoi dati non siano trattati correttamente puoi fare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).`,
      "Nome e telefono servono per poterti rispondere: senza, non possiamo seguire la richiesta.",
    ],
  },
];

export const SEZIONI_COOKIE: readonly Sezione[] = [
  {
    id: "in-breve",
    titolo: "In breve",
    paragrafi: [
      "Il sito non usa cookie di pubblicità né di profilazione, e non usa strumenti di analisi di altre aziende. Chi lo visita senza aprire un link personale non riceve nessun cookie.",
    ],
  },
  {
    id: "cosa",
    titolo: "Cosa salviamo nel tuo browser",
    elenco: [
      {
        titolo: "Cookie «da»",
        testo:
          "Nasce solo se arrivi da un link come quelli di Instagram o TikTok. Serve a ricordare da dove sei arrivato e a collegarlo alla tua richiesta. Dura 30 giorni.",
      },
      {
        titolo: "Cookie pannello",
        testo: "Tiene aperta la sessione nell'area riservata, che usano solo Luca e i PR. Dura fino all'uscita, o al massimo un anno.",
      },
      {
        titolo: "Memoria della scheda (lc_s, lc_n)",
        testo:
          "Un numero casuale per contare una visita una volta sola, anche se apri più pagine. Sparisce quando chiudi la scheda.",
      },
      {
        titolo: "Memoria del dispositivo (lc_v)",
        testo:
          "Un segno senza valore che dice che questo browser è già stato sul sito, per distinguere le visite nuove da quelle ripetute. Resta finché non cancelli i dati del sito.",
      },
    ],
  },
  {
    id: "cancellare",
    titolo: "Come toglierli",
    paragrafi: [
      "Puoi cancellare cookie e dati del sito dalle impostazioni del tuo browser quando vuoi. Il sito continua a funzionare, e il modulo si può inviare lo stesso.",
      `Per qualsiasi domanda scrivi a ${SEGNO_EMAIL}.`,
    ],
  },
];
