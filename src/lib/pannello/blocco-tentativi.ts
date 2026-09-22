/**
 * Blocco dei tentativi sulla password del pannello.
 *
 * Adattato da ~/.claude/strumenti/blocco-tentativi.js, che è scritto per le
 * funzioni con req/res: qui arriva una Request, ma la logica e i numeri sono
 * gli stessi. Cinque tentativi per indirizzo, poi dieci minuti fuori, e
 * durante il blocco non passa nemmeno la password giusta. È voluto.
 *
 * QUESTO NON PROTEGGE I LIMITI DEL PIANO: la richiesta arriva comunque alla
 * funzione, quindi l'invocazione la paghi. Per quello c'è la regola sul bordo
 * (proteggi-api.py), già attiva su questo progetto: 60 al minuto per IP.
 *
 * Il conteggio vive nella memoria dell'istanza, quindi ferma chi insiste da
 * un browser, non un attacco distribuito su mille indirizzi.
 */

const TENTATIVI_MAX = 5;
const FINESTRA = 10 * 60 * 1000;

interface Voce {
  n: number;
  da: number;
}

const tentativi = new Map<string, Voce>();

function indirizzo(richiesta: Request): string {
  const inoltrato = (richiesta.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim();
  return inoltrato !== undefined && inoltrato !== ""
    ? inoltrato
    : (richiesta.headers.get("x-real-ip") ?? "ignoto");
}

function scaduta(voce: Voce | undefined): boolean {
  return voce === undefined || Date.now() - voce.da > FINESTRA;
}

export function bloccato(richiesta: Request): boolean {
  const ip = indirizzo(richiesta);
  const voce = tentativi.get(ip);

  if (scaduta(voce)) {
    tentativi.delete(ip);
    return false;
  }

  return voce!.n >= TENTATIVI_MAX;
}

export function attesaResidua(richiesta: Request): number {
  const voce = tentativi.get(indirizzo(richiesta));
  return scaduta(voce) ? 0 : Math.ceil((FINESTRA - (Date.now() - voce!.da)) / 1000);
}

export function segnaTentativo(richiesta: Request, riuscito: boolean): void {
  const ip = indirizzo(richiesta);

  if (riuscito) {
    tentativi.delete(ip);
    return;
  }

  const voce = tentativi.get(ip);

  if (scaduta(voce)) {
    tentativi.set(ip, { n: 1, da: Date.now() });
  } else {
    voce!.n += 1;
  }
}
