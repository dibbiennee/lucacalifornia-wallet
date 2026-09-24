import Image from "next/image";
import Link from "next/link";

import { Bottone } from "@/componenti/sito/Bottone";
import { StrisciaSerate } from "@/componenti/sito/CardSerata";
import { Brindisi, Navetta, Pass } from "@/componenti/sito/Icone";
import { COME_FUNZIONA, INSTAGRAM_URL, SERATE, SPECIAL_GUEST } from "@/contenuti/sito";
import { legaParole } from "@/lib/tipografia";

import stili from "./Home.module.css";
import { Titolo2 } from "@/componenti/sito/Pagina";

/** La striscia dei quattro giorni, subito sotto l'apertura. */
export function Settimana() {
  return (
    <nav className={stili.settimana} aria-label="Serate della settimana">
      <div className={`wrap ${stili.dentro}`}>
        {SERATE.map((s) => (
          <Link
            key={s.codice}
            href={`/serate/${s.codice}`}
            className={stili.giorno}
            style={{ background: `var(--${s.colore})` }}
          >
            <b>{s.breve}</b>
            <span>{s.codice === "venerdi" ? "Comm." : s.nome}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/** Le quattro serate, con la fotografia e il colore di ognuna. */
export function Serate() {
  return (
    <section className="blocco" aria-labelledby="le-serate">
      <div className="wrap">
        <div className="blocco-testa">
          <div className={stili["testa-riga"]}>
            <p className="occhiello" style={{ color: "var(--muted)", margin: 0 }}>
              D&apos;inverno, Room 26, Roma
            </p>
            <Image src="/foto/room26.webp" alt="Room 26" width={400} height={177} sizes="110px" />
          </div>
          <Titolo2 id="le-serate">Le serate</Titolo2>
        </div>
        <StrisciaSerate serate={SERATE} />
      </div>
    </section>
  );
}

/** Le sei strade che partono dalla home. */
export function TuttoIlResto() {
  return (
    <section className="blocco" style={{ paddingTop: 0 }} aria-labelledby="tutto-il-resto">
      <div className="wrap">
        <div className="blocco-testa">
          <Titolo2 id="tutto-il-resto" misura='clamp(25px, 7.6vw, 60px)'>Tutto il resto</Titolo2>
        </div>

        <div className={stili.tessere}>
          <Link href="/tavoli" className={`${stili.tessera} ${stili["con-foto"]}`}>
            <Image src="/foto/bottles.webp" alt="" width={640} height={480} sizes="(min-width: 720px) 33vw, 50vw" />
            <strong>Tavoli</strong>
            <span>{legaParole("Compleanni, lauree e bottiglie: ti preparo tutto io")}</span>
          </Link>

          <Link href="/navetta" className={stili.tessera} style={{ background: "var(--cyan)" }}>
            <span className={stili.icona}>
              <Navetta colore="var(--cyan)" />
            </span>
            <strong>Navetta</strong>
            <span>{legaParole("Andata e ritorno dalla tua zona", { vedova: true })}</span>
          </Link>

          <Link href="/capodanno" className={stili.tessera} style={{ background: "var(--acid)" }}>
            <span className={stili.icona}>
              <Brindisi />
            </span>
            <strong>Capodanno</strong>
            <span>{legaParole("Tre pacchetti, lista d'attesa aperta", { vedova: true })}</span>
          </Link>

          <Link href="/locali" className={`${stili.tessera} ${stili["con-foto"]}`}>
            <Image src="/foto/sunset.webp" alt="" width={640} height={480} sizes="(min-width: 720px) 33vw, 50vw" />
            <strong>D&apos;estate</strong>
            <span>{legaParole("Ninfeo all'EUR e Morgan sul mare", { vedova: true })}</span>
          </Link>

          <Link href="/diventa-pr" className={stili.tessera} style={{ background: "var(--red)" }}>
            <span className={stili.icona}>
              <Pass colore="var(--red)" />
            </span>
            <strong>Diventa PR</strong>
            <span>{legaParole("Candidature aperte")}</span>
          </Link>

          <Link href="/serate" className={stili.tessera} style={{ background: "var(--milk)" }}>
            <span className={stili.mazzo} aria-hidden>
              <Image src="/foto/night12.webp" alt="" width={64} height={88} sizes="32px" />
              <Image src="/foto/night4.webp" alt="" width={64} height={88} sizes="32px" />
              <Image src="/foto/night3.webp" alt="" width={64} height={88} sizes="32px" />
            </span>
            <strong>{legaParole("Voi al Room 26")}</strong>
            <span>{legaParole("Le foto delle serate")}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/** I tre passi, dalla richiesta alla porta. */
export function ComeFunziona() {
  return (
    <section className="blocco" style={{ paddingTop: 0 }} aria-labelledby="come-funziona">
      <div className="wrap">
        <div className="blocco-testa">
          <p className="occhiello" style={{ margin: 0 }}>
            Dalla richiesta alla porta
          </p>
          <Titolo2 id="come-funziona" misura='clamp(25px, 7.6vw, 60px)'>Come funziona</Titolo2>
        </div>

        <ol className={stili.passi}>
          {COME_FUNZIONA.map((passo, i) => (
            <li key={passo.titolo}>
              <b aria-hidden>{i + 1}</b>
              <div>
                <strong>{legaParole(passo.titolo, { vedova: false })}</strong>
                <span>{legaParole(passo.testo, { vedova: true })}</span>
              </div>
            </li>
          ))}
        </ol>

        <Bottone href="/prenota?tipo=lista" pieno>
          Entra in lista o prenota
        </Bottone>
      </div>
    </section>
  );
}

/** Il riquadro con la faccia di Luca e il suo motto. */
export function ChiELuca() {
  return (
    <section className="blocco" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className={stili.luca}>
          <Image src="/foto/luca.webp" alt="Luca Curella" width={192} height={192} sizes="96px" />
          <strong>
            <span className="cl">Non&nbsp;importa chi&nbsp;tu&nbsp;sia,</span>{" "}
            <span className="cl">importa che&nbsp;ti&nbsp;sappia divertire</span>
          </strong>
          <div className={stili["luca-link"]}>
            <Link href="/chi-sono">Chi è Luca</Link>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener">
              <Istagram />
              Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Lo special guest: non c'è ancora un nome, ma c'è una lista. */
export function SpecialGuest({ avvisami }: { readonly avvisami: React.ReactNode }) {
  return (
    <section className="blocco" style={{ paddingTop: 0 }} aria-label={SPECIAL_GUEST.titolo}>
      <div className="wrap">
        <div className={stili.ospite}>
          <div>
            <strong>Special guest</strong>
            <p className={stili.arrivo}>
              <i aria-hidden />
              In arrivo
            </p>
          </div>
          {avvisami}
        </div>
      </div>
    </section>
  );
}

function Istagram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}
