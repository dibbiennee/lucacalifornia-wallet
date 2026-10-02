import type { Prenotazione } from "@/lib/pass/tipi";
import { giornoDellaSerata, istanteSerata, prossimaSerata } from "@/lib/serate";

import type { RichiestaPannello } from "./dati";
import { tipoBiglietto } from "./testi";

/**
 * Dal record della richiesta al biglietto.
 *
 * Tutto quello che finisce nel biglietto (nome, serata, data, tipo, locale,
 * sala) si ricava QUI, dalla richiesta così com'è nel database. Il browser
 * non manda niente di questo: manda solo l'id della richiesta. Così nessuno
 * può far uscire un biglietto per una serata o una persona che non hanno una
 * richiesta vera dietro.
 */

/** Il locale, dal codice della serata scelta nel modulo. */
export function localeDi(r: RichiestaPannello): "room26" | "ninfeo" {
  return r.codiceSerata === "ninfeo" ? "ninfeo" : "room26";
}

/**
 * Quando comincia la serata della richiesta. La data vera scelta nel modulo,
 * a ora di Roma; solo le richieste di prima che il modulo la chiedesse non ce
 * l'hanno, e per quelle resta "la prossima volta che cade quella serata".
 */
export function inizioDi(r: RichiestaPannello): Date {
  return r.dataSerata === undefined
    ? prossimaSerata(giornoDellaSerata(r.codiceSerata))
    : istanteSerata(r.dataSerata);
}

/** La prenotazione che viaggia cifrata nel QR, per questa richiesta e questo numero di serie. */
export function prenotazioneDa(r: RichiestaPannello, serialNumber: string): Prenotazione {
  return {
    serialNumber,
    nomeCliente: r.nome,
    // Il nome della serata, non il giorno: il messaggio diceva "sei dentro per SABATO di sabato 27 settembre".
    serata: r.nomeSerata,
    inizioSerata: inizioDi(r),
    tipo: tipoBiglietto(r),
    locale: localeDi(r),
    ...(r.sala === undefined ? {} : { sala: r.sala }),
  };
}
