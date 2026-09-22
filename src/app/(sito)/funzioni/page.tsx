import Link from "next/link";

import { Pila } from "@/componenti/Pila";

export const metadata = { title: "Funzioni - Luca California" };

const PANNELLO = [
  { nome: "OGGI", testo: "Liste, tavoli ed entrati della serata in corso", dove: null },
  { nome: "RICHIESTE", testo: "Confermi e parte il messaggio già scritto", dove: "/biglietto/conferma" },
  { nome: "PORTA", testo: "Chi è entrato e chi manca", dove: "/staff/scan" },
  { nome: "SERATE", testo: "Decidi cosa vede la gente sul sito", dove: null },
] as const;

const BIGLIETTO = [
  "Il tuo logo, i tuoi colori e la grafica della serata",
  "Compare da solo sulla schermata di blocco la sera giusta",
  "All'ingresso mostra il QR: niente nomi da cercare nella lista",
  "Resta nel telefono anche dopo, con il tuo nome sopra",
] as const;

const PROVENIENZE = [
  { nome: "Storie Instagram", quota: 58 },
  { nome: "Bio Instagram", quota: 21 },
  { nome: "Link dei tuoi PR", quota: 14 },
  { nome: "Google e altro", quota: 7 },
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
            serata. Tocca una schermata per provarla.
          </p>

          <div style={{ display: "grid", gap: "0.7rem" }}>
            {PANNELLO.map((voce) => {
              const contenuto = (
                <>
                  <strong style={{ display: "block", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>
                    {voce.nome}
                  </strong>
                  <span className="debole" style={{ fontSize: "0.9375rem" }}>
                    {voce.testo}
                  </span>
                </>
              );

              return voce.dove === null ? (
                <div
                  key={voce.nome}
                  style={{ border: "2px solid rgba(255,255,255,0.18)", padding: "1rem 1.1rem", opacity: 0.65 }}
                >
                  {contenuto}
                  <span className="debole" style={{ display: "block", marginTop: "0.5rem", fontSize: "0.8125rem" }}>
                    In arrivo
                  </span>
                </div>
              ) : (
                <Link
                  key={voce.nome}
                  href={voce.dove}
                  style={{
                    display: "block",
                    border: "2px solid rgba(255,255,255,0.45)",
                    padding: "1rem 1.1rem",
                    textDecoration: "none",
                  }}
                >
                  {contenuto}
                  <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.8125rem", fontWeight: 700 }}>
                    Provala →
                  </span>
                </Link>
              );
            })}
          </div>
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

      <section className="fascia" style={{ background: "var(--blu-scuro)" }}>
        <div className="dentro">
          <Pila occhiello="SAI COSA FUNZIONA" righe={["DA DOVE", "ARRIVANO"]} />
          <ul style={{ listStyle: "none", padding: 0, margin: "1.8rem 0 1.2rem", display: "grid", gap: "0.9rem" }}>
            {PROVENIENZE.map((p) => (
              <li key={p.nome}>
                <span style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: "0.35rem" }}>
                  <span>{p.nome}</span>
                  <span>{p.quota}%</span>
                </span>
                <span style={{ display: "block", height: "0.4rem", background: "rgba(255,255,255,0.2)" }}>
                  <span style={{ display: "block", height: "100%", width: `${p.quota}%`, background: "#fff" }} />
                </span>
              </li>
            ))}
          </ul>
          <p className="debole testo-lungo" style={{ margin: 0, fontSize: "0.9375rem" }}>
            Ogni canale ha il suo link, quindi sai quale porta gente davvero e dove vale la pena
            spingere.
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
