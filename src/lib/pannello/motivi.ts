/**
 * I motivi per cui Luca rifiuta una richiesta.
 *
 * Un elenco chiuso, non testo libero: nel database si salva il codice, e a
 * schermo (a Luca e al PR) si legge l'etichetta. Il file è puro, lo leggono sia
 * il server (che controlla il codice) sia il browser (che mostra la scelta).
 *
 * L'elenco è una proposta di partenza: aggiungere un motivo vuol dire aggiungere
 * una riga qui, senza toccare il database (i codici vecchi restano leggibili).
 */
export const MOTIVI_RIFIUTO = [
  { codice: "completa", etichetta: "Serata al completo" },
  { codice: "tavoli_esauriti", etichetta: "Tavoli esauriti" },
  { codice: "lista_chiusa", etichetta: "Lista chiusa" },
  { codice: "gruppo", etichetta: "Gruppo non adatto alla serata" },
  { codice: "dati", etichetta: "Dati non validi" },
  { codice: "altro", etichetta: "Altro motivo" },
] as const;

export type CodiceMotivo = (typeof MOTIVI_RIFIUTO)[number]["codice"];

export function eMotivoRifiuto(valore: unknown): valore is CodiceMotivo {
  return typeof valore === "string" && MOTIVI_RIFIUTO.some((m) => m.codice === valore);
}

/** L'etichetta di un codice, per chi legge. Un codice sconosciuto (un motivo tolto dall'elenco) si mostra com'è. */
export function etichettaMotivo(codice: string): string {
  return MOTIVI_RIFIUTO.find((m) => m.codice === codice)?.etichetta ?? codice;
}
