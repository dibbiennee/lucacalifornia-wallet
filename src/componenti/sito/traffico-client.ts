/**
 * Il tracciamento, lato browser: il minimo che serve.
 *
 * Una "sessione" è un numero casuale tenuto nella scheda del browser
 * (sessionStorage) finché resta aperta: la stessa persona che apre dieci pagine
 * conta una visita. Non c'è niente che identifichi la persona o il dispositivo:
 * né indirizzo, né impronte del browser, né identificativi che durano.
 *
 * "Visita nuova" vuol dire solo "questo browser non era mai stato sul sito":
 * lo dice un segno senza valore (la lettera 1) in localStorage, scritto alla
 * prima visita. Se il browser non permette di scrivere (navigazione privata),
 * il tracciamento semplicemente non scrive niente e il sito funziona uguale.
 */

const CHIAVE_SESSIONE = "lc_s";
const CHIAVE_NUOVA = "lc_n";
const CHIAVE_VISTO = "lc_v";

let inMemoria: { sessione: string; nuova: boolean } | null = null;

function numeroCasuale(): string {
  const byte = new Uint8Array(12);
  crypto.getRandomValues(byte);
  return Array.from(byte, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** La sessione di questa scheda, creata alla prima richiesta. */
export function sessioneTraffico(): { readonly sessione: string; readonly nuova: boolean } {
  if (inMemoria !== null) {
    return inMemoria;
  }

  try {
    const esistente = window.sessionStorage.getItem(CHIAVE_SESSIONE);

    if (esistente !== null) {
      inMemoria = { sessione: esistente, nuova: window.sessionStorage.getItem(CHIAVE_NUOVA) === "1" };
      return inMemoria;
    }

    const nuova = window.localStorage.getItem(CHIAVE_VISTO) === null;
    const sessione = numeroCasuale();

    window.sessionStorage.setItem(CHIAVE_SESSIONE, sessione);
    window.sessionStorage.setItem(CHIAVE_NUOVA, nuova ? "1" : "0");
    window.localStorage.setItem(CHIAVE_VISTO, "1");

    inMemoria = { sessione, nuova };
  } catch {
    // Archivio non disponibile: una sessione solo in memoria, valida finché la pagina resta aperta.
    inMemoria = { sessione: numeroCasuale(), nuova: false };
  }

  return inMemoria;
}

const GIA_MANDATI = new Set<string>();

/**
 * Segna un evento. Ogni evento parte una volta per pagina caricata, e il server
 * lo conta comunque una volta sola per sessione. Un errore non si vede e non
 * rompe niente: il tracciamento non deve mai disturbare chi prenota.
 *
 * `pr` è il codice della pagina /pr/<codice>: il server lo controlla (un PR
 * attivo) e lo trasforma in id, mai il contrario.
 */
export function segnaEvento(evento: "visita" | "inizio", pr?: string): void {
  const chiave = `${evento}:${pr ?? ""}`;

  if (GIA_MANDATI.has(chiave)) {
    return;
  }
  GIA_MANDATI.add(chiave);

  try {
    const { sessione, nuova } = sessioneTraffico();

    void fetch("/api/traffico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessione, evento, nuova, ...(pr === undefined ? {} : { pr }) }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Niente da fare: si prosegue senza.
  }
}
