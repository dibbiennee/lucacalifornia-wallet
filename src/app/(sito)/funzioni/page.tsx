import Image from "next/image";
import Link from "next/link";

import { Bottone } from "@/componenti/sito/Bottone";
import { Indietro, Introduzione, Nota, Punti, TestaPagina, Titolo2 } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Pagina.module.css";
import { legaParole } from "@/lib/tipografia";

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
            <Titolo2 id="il-pannello" misura='clamp(25px, 7.6vw, 60px)'>Il pannello</Titolo2>
          </div>

          <Introduzione spazioSotto>
            Le richieste non arrivano più sparse tra messaggi e DM: entrano qui, divise per
            serata. Tocca una schermata per provarla: serve la password del pannello.
          </Introduzione>

          <div className={stili.schermate}>
            {PANNELLO.map((v) => (
              <Link key={v.nome} href={v.dove} className={stili.schermata}>
                <Image src={`/foto/pannello/${v.foto}.webp`} alt={v.alt} width={540} height={844} sizes="(min-width: 720px) 20vw, 62vw" />
                <strong>{legaParole(v.nome, { vedova: false })}</strong>
                <span>{legaParole(v.testo, { vedova: true })}</span>
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
            <Titolo2 id="il-biglietto" misura='clamp(25px, 7.6vw, 60px)'>Il biglietto nel telefono</Titolo2>
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
              <Introduzione spazioSotto>
                Il cliente lo aggiunge all&apos;app Wallet, accanto alla carta di credito e alla
                carta d&apos;imbarco. Provalo adesso: è un biglietto vero.
              </Introduzione>
              <Bottone href="/biglietto/prova">Aggiungi il biglietto di prova</Bottone>
            </div>
          </div>

          <Punti voci={BIGLIETTO} />
          <Nota>Su Android la stessa cosa con Google Wallet.</Nota>
        </div>
      </section>

      <section className="blocco" style={{ paddingTop: 0 }} aria-labelledby="la-squadra">
        <div className="wrap">
          <div className="blocco-testa">
            <p className="occhiello" style={{ margin: 0 }}>
              Per la tua squadra
            </p>
            <Titolo2 id="la-squadra" misura='clamp(25px, 7.6vw, 60px)'>Ogni PR ha il suo link</Titolo2>
          </div>

          {/* Qui dentro ci sono i grassetti, quindi non passa dal componente.
              L'indirizzo non si spezza mai, tranne a 320 px: lì, con "Marco
              manda" davanti, non c'è altro modo di restare nel margine. Il
              punto di rottura è dopo la barra, non a metà di "marco". */}
          <p className="introduzione">
            Marco manda{" "}
            <strong>
              lucacalifornia.satoshiweb.it/<wbr />
              marco
            </strong>
            . Ogni lista e&nbsp;ogni tavolo che&nbsp;arriva da&nbsp;lì viene contato come&nbsp;suo, senza
            che&nbsp;nessuno
            segni niente a&nbsp;mano. Funziona uguale per&nbsp;i&nbsp;tuoi canali:{" "}
            <strong>/ig</strong> nella&nbsp;bio, <strong>/s</strong> nelle&nbsp;storie,{" "}
            <strong>/tiktok</strong> sul&nbsp;profilo.
          </p>

          <div style={{ marginTop: 24 }}>
            <Nota>Anteprima: i numeri e i dati delle schermate sono di esempio.</Nota>
          </div>
        </div>
      </section>
    </>
  );
}
