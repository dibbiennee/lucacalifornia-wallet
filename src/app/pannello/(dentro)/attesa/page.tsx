import { ListaAttesaVista, type ValoriFiltri } from "@/componenti/lc/ListaAttesaVista";
import { chiaveDaTesto, eDataIso, eStatoAttesa, oggiARoma, testoDaChiave, type StatoAttesa } from "@/lib/lista-attesa";
import { conteggiPerEvento, eventiSpeciali, listaAttesa, type FiltriAttesa } from "@/lib/pannello/attesa";
import { redirect } from "next/navigation";

import { sessioneOAccesso } from "@/lib/pannello/sessione";

export const metadata = { title: "Attesa, pannello Luca California" };

type Parametri = Record<string, string | string[] | undefined>;

/**
 * La lista d'attesa.
 *
 * I filtri (evento, data, stato, ricerca) arrivano dall'indirizzo e si
 * applicano nella query: la pagina non filtra nulla da sola. Per Luca la lista
 * è intera; per un PR sono solo le persone arrivate dal suo link, e a deciderlo
 * è sempre l'ambito della sessione, mai un parametro dell'indirizzo.
 *
 * Senza nessun filtro mostra chi è ancora in attesa, nelle date future (e gli
 * eventi speciali senza data): è la domanda di tutti i giorni, "chi aspetta?".
 */
export default async function Attesa({ searchParams }: { searchParams: Promise<Parametri> }) {
  const sessione = await sessioneOAccesso();

  // La lista d'attesa è di Luca: un PR torna alle sue richieste.
  if (sessione.ruolo !== "owner") {
    redirect("/pannello/richieste");
  }

  const parametri = await searchParams;

  const uno = (chiave: string): string => {
    const v = parametri[chiave];
    return typeof v === "string" ? v : "";
  };

  const chiave = chiaveDaTesto(uno("evento"));
  const data = eDataIso(uno("data")) ? uno("data") : "";
  const statoGrezzo = uno("stato");
  const stato: StatoAttesa | "tutti" =
    statoGrezzo === "tutti" ? "tutti" : eStatoAttesa(statoGrezzo) ? statoGrezzo : "in attesa";
  const q = uno("q").trim().slice(0, 60);
  const passate = uno("passate") === "1";

  const filtri: FiltriAttesa = {
    ...(chiave === null ? {} : { evento: chiave }),
    ...(data === "" ? {} : { data }),
    ...(stato === "tutti" ? {} : { stato }),
    ...(q === "" ? {} : { q }),
    // Una data scelta a mano vale anche se è passata: chi la cerca la vuole vedere.
    quando: passate || data !== "" ? "tutti" : "futuri",
  };

  const valori: ValoriFiltri = {
    evento: chiave === null ? "" : testoDaChiave(chiave),
    data,
    stato,
    q,
    passate,
  };

  const [risultato, conteggi, speciali] = await Promise.all([
    listaAttesa(sessione, filtri, oggiARoma()),
    conteggiPerEvento(sessione),
    eventiSpeciali(),
  ]);

  return (
    <ListaAttesaVista
      risultato={risultato}
      valori={valori}
      conteggi={conteggi}
      speciali={speciali}
      proprietario={sessione.ruolo === "owner"}
    />
  );
}
