import Image from "next/image";
import Link from "next/link";

import { Bottone } from "@/componenti/sito/Bottone";
import { Indietro, Punti, TestaPagina } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Pagina.module.css";

export const metadata = { title: "Funzioni - Luca California" };

const PANNELLO = [
  {
    nome: "Richieste",
    testo: "Tutte quelle della settimana, divise per stato",
    dove: "/pannello/richieste",
    foto: "richieste",
    alt: "L'elenco delle richieste, con i filtri fra nuove, confermate e tutte",
  },
  {
    nome: "Stasera",
    testo: "Chi entra stasera, con la ricerca per nome",
    dove: "/pannello/stasera",
    foto: "stasera",
    alt: "La schermata Stasera: tavoli e lista di chi è confermato",
  },
  {
    nome: "La singola richiesta",
    testo: "Confermi e parte il messaggio già scritto, col biglietto dentro",
    dove: "/pannello/richieste/giulia-marchetti",
    foto: "dettaglio",
    alt: "Il dettaglio di una richiesta, col pulsante Conferma e scrivi",
  },
  {
    nome: "Serate",
    testo: "Decidi cosa vede la gente sul sito",
    dove: "/pannello/serate",
    foto: "serate",
    alt: "Gli interruttori delle etichette: lista aperta, pochi tavoli, tutto pieno",
  },
  {
    nome: "Squadra",
    testo: "I tuoi PR, le provvigioni e i compleanni",
    dove: "/pannello/squadra",
    foto: "squadra",
    alt: "La squadra dei PR, con prenotazioni e provvigioni di ognuno",
  },
  {
    nome: "Porta",
    testo: "Inquadri il QR e sai subito se passa",
    dove: "/pannello/porta",
    foto: "porta",
    alt: "La porta, col lettore del QR e il conteggio di chi è dentro",
  },
] as const;

const BIGLIETTO = [
  { titolo: "Il tuo logo e i tuoi colori", testo: "Con la grafica della serata dentro." },
  { titolo: "Compare da solo", testo: "Sulla schermata di blocco, la sera giusta." },
  { titolo: "All'ingresso mostri il QR", testo: "Niente nomi da cercare nella lista." },
  { titolo: "Resta nel telefono", testo: "Anche dopo, con il tuo nome sopra." },
] as const;

export default function PaginaFunzioni() {
  return (
    <>
      <Indietro testo="Home" dove="/" />
      <TestaPagina
        occhiello="Oltre al sito"
        righe={["Cosa c'è", "dietro"]}
        introduzione="Il sito è la parte che vede la gente. Dietro c'è il pannello da cui gestisci tutto, il biglietto che finisce nel telefono dei clienti e gli strumenti per la tua squadra."
      />

      <section className="blocco" style={{ paddingTop: 0 }} aria-labelledby="il-pannello">
        <div className="wrap">
          <div className="blocco-testa">
            <p className="occhiello" style={{ margin: 0 }}>
              Dal tuo telefono
            </p>
            <h2 className="display" id="il-pannello" style={{ fontSize: "clamp(34px, 9vw, 60px)" }}>
              Il pannello
            </h2>
          </div>

          <p className="introduzione" style={{ marginBottom: 18 }}>
            Le richieste non arrivano più sparse tra messaggi e DM: entrano qui, divise per
            serata. Tocca una schermata per provarla: serve la password del pannello.
          </p>

          <div className={stili.schermate}>
            {PANNELLO.map((v) => (
              <Link key={v.nome} href={v.dove} className={stili.schermata}>
                <Image src={`/foto/pannello/${v.foto}.webp`} alt={v.alt} width={540} height={844} sizes="(min-width: 720px) 20vw, 62vw" />
                <strong>{v.nome}</strong>
                <span>{v.testo}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="blocco" style={{ paddingTop: 0 }} aria-labelledby="il-biglietto">
        <div className="wrap">
          <div className="blocco-testa">
            <p className="occhiello" style={{ margin: 0 }}>
              Quando confermi
            </p>
            <h2 className="display" id="il-biglietto" style={{ fontSize: "clamp(34px, 9vw, 60px)" }}>
              Il biglietto nel telefono
            </h2>
          </div>

          <div className={stili.biglietto}>
            <Image
              src="/foto/biglietto.webp"
              alt="Il biglietto nel Wallet: in alto il logo e la data, la fascia con la foto della sala, poi tipo, nome, locale e orario, e in fondo il QR"
              width={780}
              height={1180}
              sizes="(min-width: 720px) 280px, 70vw"
            />
            <div>
              <p className="introduzione" style={{ marginBottom: 18 }}>
                Il cliente lo aggiunge all&apos;app Wallet, accanto alla carta di credito e alla
                carta d&apos;imbarco. Provalo adesso: è un biglietto vero.
              </p>
              <Bottone href="/biglietto/prova">Aggiungi il biglietto di prova</Bottone>
            </div>
          </div>

          <Punti voci={BIGLIETTO} />
          <p className="nota">Su Android la stessa cosa con Google Wallet.</p>
        </div>
      </section>

      <section className="blocco" style={{ paddingTop: 0 }} aria-labelledby="la-squadra">
        <div className="wrap">
          <div className="blocco-testa">
            <p className="occhiello" style={{ margin: 0 }}>
              Per la tua squadra
            </p>
            <h2 className="display" id="la-squadra" style={{ fontSize: "clamp(34px, 9vw, 60px)" }}>
              Ogni PR ha il suo link
            </h2>
          </div>

          <p className="introduzione">
            Marco manda <strong>lucacalifornia.satoshiweb.it/marco</strong>. Ogni lista e ogni
            tavolo che arriva da lì viene contato come suo, senza che nessuno segni niente a mano.
            Funziona uguale per i tuoi canali: <strong>/ig</strong> nella bio,{" "}
            <strong>/s</strong> nelle storie, <strong>/tiktok</strong> sul profilo.
          </p>

          <p className="nota" style={{ marginTop: 24 }}>
            Anteprima: i numeri e i dati delle schermate sono di esempio.
          </p>
        </div>
      </section>
    </>
  );
}
