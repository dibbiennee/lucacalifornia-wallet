import { randomUUID } from "node:crypto";

import type { DatiBiglietto } from "./tipi";

/**
 * Dati finti per il biglietto di prova della fase 1.
 *
 * Vivono qui e solo qui, e la rotta che li usa resta spenta finché non si
 * accende ABILITA_PASS_DEMO. Dalla fase 2 i dati arrivano da Supabase e
 * questo file si cancella.
 */
export function bigliettoDiProva(): DatiBiglietto {
  return {
    serialNumber: randomUUID(),
    serata: "BAILAME",
    // Sabato 26 settembre 2026, 23:30, ora di Roma.
    inizioSerata: new Date("2026-09-26T23:30:00+02:00"),
    tipo: "TAVOLO, MISTO",
    nomeCliente: "Mario Rossi",
    locale: "Room 26, Roma",
    indirizzo: "Piazza Guglielmo Marconi 31, 00144 Roma",
    token: "DEMO-FASE-1-TOKEN-NON-VALIDO",
  };
}
