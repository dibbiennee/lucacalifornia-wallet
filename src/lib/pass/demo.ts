import { nuovoSerialNumber } from "./token";
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
    serialNumber: nuovoSerialNumber(),
    serata: "BÀILAME",
    // Domenica 27 settembre 2026, 23:30, ora di Roma.
    // Bàilame è la serata della domenica: il sabato al Room 26 sono
    // due sale diverse, house e reggaeton.
    inizioSerata: new Date("2026-09-27T23:30:00+02:00"),
    tipo: "TAVOLO, MISTO",
    nomeCliente: "Mario Rossi",
    locale: "room26",
    token: "DEMO-FASE-1-TOKEN-NON-VALIDO",
  };
}
