import Link from "next/link";

import { Pila } from "@/componenti/Pila";

export const metadata = { title: "Funzioni - Luca California" };

const PANNELLO = [
  {
    nome: "OGGI",
    testo: "Liste, tavoli ed entrati della serata in corso",
    dove: "/pannello",
    foto: "oggi",
    descrizione: "La schermata Oggi: quarantadue in lista, sette tavoli, e le richieste da confermare",
  },
  {
    nome: "RICHIESTE",
    testo: "Tutte quelle della settimana, divise per stato",
    dove: "/pannello/richieste",
    foto: "richieste",
    descrizione: "L'elenco delle richieste, con i filtri fra nuove, confermate e tutte",
  },
  {
    nome: "LA SINGOLA RICHIESTA",
    testo: "Confermi e parte il messaggio già scritto, col biglietto dentro",
    dove: "/pannello/richieste/giulia-marchetti",
    foto: "dettaglio",
    descrizione: "Il dettaglio di una richiesta, col pulsante Conferma e scrivi",
  },
  {
    nome: "PORTA",
    testo: "Inquadri il QR e sai subito se passa",
    dove: "/pannello/porta",
    foto: "porta",
    descrizione: "La porta a schermo nero, col conteggio di chi è dentro",
  },
  {
    nome: "SERATE",
    testo: "Decidi cosa vede la gente sul sito",
    dove: "/pannello/serate",
    foto: "serate",
    descrizione: "Gli interruttori delle etichette: lista aperta, pochi tavoli, tutto pieno",
  },
  {
    nome: "SQUADRA",
    testo: "I tuoi PR, le provvigioni e i compleanni",
    dove: "/pannello/squadra",
    foto: "squadra",
    descrizione: "La squadra dei PR, con prenotazioni e provvigioni di ognuno",
  },
] as const;

const BIGLIETTO = [
  "Il tuo logo, i tuoi colori e la grafica della serata",
  "Compare da solo sulla schermata di blocco la sera giusta",
  "All'ingresso mostra il QR: niente nomi da cercare nella lista",
  "Resta nel telefono anche dopo, con il tuo nome sopra",
] as const;

export default function PaginaFunzioni() {
  return (
    <>
      <section className="fascia">
        <div className="dentro">
          <Pila occhiello="OLTRE AL SITO" righe={["COSA C'È", "DIETRO"]} livello={1} />
          <p className="testo-lungo" style={{ margin: "1.6rem 0 0" }}>
            Il sito è la parte che vede la gente. Dietro c&apos;è il pannello da cui gestisci
            tutto, il biglietto che finisce nel telefono dei clienti e gli strumenti per la tua
            squadra.
          </p>
        </div>
      </section>

      <section className="fascia" style={{ background: "var(--blu-scuro)" }}>
        <div className="dentro">
          <Pila occhiello="DAL TUO TELEFONO" righe={["IL PANNELLO"]} />
          <p className="debole testo-lungo" style={{ margin: "1.6rem 0" }}>
            Le richieste non arrivano più sparse tra DM e messaggi: entrano qui, divise per
            serata. Tocca una schermata per provarla: serve la password del pannello.
          </p>

          <ul className="scorrevole scorrevole-schermate">
            {PANNELLO.map((voce) => (
              <li key={voce.nome}>
                <Link href={voce.dove} className="schermata">
                  <img
                    src={`/foto/pannello/${voce.foto}.webp`}
                    alt={voce.descrizione}
                    loading="lazy"
                    width={540}
                    height={1169}
                  />
                  <strong>{voce.nome}</strong>
                  <span className="debole">{voce.testo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fascia">
        <div className="dentro">
          <Pila occhiello="QUANDO CONFERMI" righe={["IL BIGLIETTO", "NEL TELEFONO"]} />
          <p className="debole testo-lungo" style={{ margin: "1.6rem 0" }}>
            Il cliente aggiunge il biglietto all&apos;app Wallet, accanto alla carta di credito e
            alla carta d&apos;imbarco. Provalo adesso: è un biglietto vero.
          </p>

          <a href="/biglietto/prova" className="bottone" style={{ marginBottom: "1.6rem" }}>
            Aggiungi il biglietto di prova
          </a>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.8rem" }}>
            {BIGLIETTO.map((riga) => (
              <li key={riga} style={{ display: "flex", gap: "0.7rem" }}>
                <span aria-hidden>•</span>
                <span className="debole">{riga}</span>
              </li>
            ))}
          </ul>

          <p className="debole" style={{ margin: "1.4rem 0 0", fontSize: "0.875rem" }}>
            Su Android la stessa cosa con Google Wallet.
          </p>
        </div>
      </section>

      <section className="fascia" style={{ paddingTop: 0 }}>
        <div className="dentro">
          <p
            className="debole"
            style={{ border: "2px dashed rgba(255,255,255,0.4)", padding: "1.1rem", margin: 0, fontSize: "0.9375rem" }}
          >
            Anteprima. I numeri e i dati delle schermate sono di esempio.
          </p>
        </div>
      </section>
    </>
  );
}
