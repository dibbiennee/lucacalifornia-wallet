import { AttivaNotifiche } from "@/componenti/pannello/AttivaNotifiche";
import { CardRichiesta } from "@/componenti/pannello/CardRichiesta";
import { Esci } from "@/componenti/pannello/Esci";
import { Etichetta } from "@/componenti/pannello/Etichetta";
import { Vuoto } from "@/componenti/pannello/Messaggi";
import { Filtri, Filtro } from "@/componenti/pannello/Scelta";
import { Testata } from "@/componenti/pannello/Testata";
import { richieste } from "@/lib/pannello/dati";
import { riassunto } from "@/lib/pannello/testi";

export const metadata = { title: "Richieste, pannello Luca California" };

/**
 * Le richieste: la schermata da cui si parte.
 *
 * Il filtro sta nell'indirizzo e non nello stato del browser: così si può
 * mandare a qualcuno, resta dopo un ricaricamento, e il ritorno dalla
 * singola richiesta sa dove tornare.
 */
export default async function Richieste({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string }>;
}) {
  const { stato } = await searchParams;
  const tutte = await richieste();
  const nuove = tutte.filter((r) => r.stato === "nuova");
  const confermate = tutte.filter((r) => r.stato === "confermata");
  const mostrate =
    stato === "nuova" ? nuove : stato === "confermata" ? confermate : tutte;

  return (
    <main className="pagina">
      <Testata occhiello="Questa settimana" titolo="Richieste" azione={<Esci />} />

      <AttivaNotifiche />

      <Filtri>
        <Filtro
          testo={`Nuove ${nuove.length}`}
          dove="/pannello/richieste?stato=nuova"
          attivo={stato === "nuova"}
        />
        <Filtro
          testo={`Confermate ${confermate.length}`}
          dove="/pannello/richieste?stato=confermata"
          attivo={stato === "confermata"}
        />
        <Filtro
          testo="Tutte"
          dove="/pannello/richieste"
          attivo={stato === undefined || stato === ""}
        />
      </Filtri>

      <div className="lista">
        {mostrate.length === 0 ? (
          <Vuoto>
            {stato === "nuova"
              ? "Nessuna richiesta nuova. Appena qualcuno prenota dal sito, la trovi qui."
              : "Nessuna richiesta con questo stato."}
          </Vuoto>
        ) : (
          mostrate.map((r) => (
            <CardRichiesta
              key={r.id}
              dove={`/pannello/richieste/${r.id}${stato === undefined || stato === "" ? "" : `?stato=${stato}`}`}
              nome={r.nome}
              destra={<Etichetta stato={r.stato} />}
              riassunto={riassunto(r)}
              {...(r.messaggio === undefined ? {} : { messaggio: r.messaggio })}
              {...(r.bigliettoInviatoAlle === undefined
                ? {}
                : { nota: `Biglietto inviato alle ${r.bigliettoInviatoAlle}` })}
            />
          ))
        )}
      </div>
    </main>
  );
}
