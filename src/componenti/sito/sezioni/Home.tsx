import Image from "next/image";
import Link from "next/link";

import { Bottone } from "@/componenti/sito/Bottone";
import { ListaSerate } from "@/componenti/sito/CardSerata";
import { Gallone } from "@/componenti/sito/Icone";
import { COME_FUNZIONA, HALLOWEEN, INSTAGRAM_URL, SERATE, SPECIAL_GUEST } from "@/contenuti/sito";
import { legaParole } from "@/lib/tipografia";

import stili from "./Home.module.css";
import { Galleria, Titolo2 } from "@/componenti/sito/Pagina";

/** Le quattro serate, con la fotografia e il colore di ognuna. */
export function Serate() {
  return (
    <section className="blocco" style={{ paddingBottom: 20 }} aria-labelledby="le-serate">
      <div className="wrap">
        <div id="testa-serate" className="blocco-testa rivela">
          <div className={stili["testa-riga"]}>
            <p className="occhiello" style={{ color: "var(--muted)", margin: 0 }}>
              D&apos;inverno, ROOM26, Roma
            </p>
            <Image src="/foto/room26.webp" alt="ROOM26" width={400} height={177} sizes="110px" />
          </div>
          <Titolo2 id="le-serate">Le serate</Titolo2>
          <p className={stili.disponibilita}>
            <i aria-hidden />
            Disponibilità limitata
          </p>
        </div>
        <ListaSerate serate={SERATE} />
      </div>
    </section>
  );
}

/** Le sei strade che partono dalla home. */
export function TuttoIlResto() {
  return (
    <section className="blocco" style={{ paddingTop: 0 }} aria-label="Tutto il resto">
      <div className="wrap">
        <div className={`${stili.divisore} rivela`} aria-hidden>
          <span className={stili.divisoreLinea} />
          <FrecciaGiu />
          <span className={stili.divisoreLinea} />
        </div>

        <div className={`${stili.tessere} rivela`}>
          <Link href="/tavoli" className={`${stili.tessera} ${stili["con-foto"]} ${stili.tesseraFoto}`}>
            <Image src="/foto/atmosfera/tavoli-tessera.jpg" alt="" width={640} height={373} sizes="(min-width: 720px) 33vw, 50vw" />
            <strong>Tavoli</strong>
            <span>{legaParole("Compleanni, lauree e bottiglie: ti preparo tutto io")}</span>
          </Link>

          <Link href="/navetta" className={`${stili.tessera} ${stili.tesseraFoto}`}>
            <Image src="/foto/atmosfera/navetta.jpg" alt="" width={640} height={530} sizes="50vw" />
            <strong>Navetta</strong>
            <span>{legaParole("Andata e ritorno dalla tua zona", { vedova: true })}</span>
          </Link>

          <Link href="/capodanno" className={`${stili.tessera} ${stili.tesseraFoto}`}>
            <Image src="/foto/atmosfera/capodanno.jpg" alt="" width={640} height={518} sizes="50vw" />
            <strong>Capodanno</strong>
            <span>{legaParole("Tre pacchetti, lista d'attesa aperta", { vedova: true })}</span>
          </Link>

          <Link href="/diventa-pr" className={`${stili.tessera} ${stili["con-foto"]} ${stili.tesseraIntera} ${stili.tesseraFoto}`}>
            <Image src="/foto/atmosfera/pr-dj.jpg" alt="" width={1500} height={480} sizes="(min-width: 1180px) 1140px, 100vw" />
            <strong>Diventa PR</strong>
            <span>{legaParole("Candidature aperte")}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/** I tre passi, dalla richiesta alla porta. */
export function ComeFunziona() {
  return (
    <section className={`blocco ${stili.comeFunzionaSfondo}`} data-sfondo="/foto/atmosfera/come-funziona-dj.jpg" style={{ paddingTop: 0 }} aria-labelledby="come-funziona">
      <div className="wrap">
        <div className="blocco-testa rivela">
          <Titolo2 id="come-funziona" misura='clamp(25px, 7.6vw, 60px)'>Come funziona</Titolo2>
        </div>

        <ol className={`${stili.passi} rivela`}>
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

        <Bottone href="/prenota?tipo=tavolo" pieno classe="cta-prenota">
          Prenota il tuo ingresso
        </Bottone>
      </div>
    </section>
  );
}

/**
 * Le foto delle serate, divise per canale: Bàilame e ROOM26 sono due
 * pubblici diversi, e due canali Telegram separati invece di uno solo dove
 * si mischiano.
 */
const FOTO_BAILAME = [
  { src: "/foto/bailame/bailame1.jpg", alt: "Due amiche si abbracciano ridendo, con le luci del palco alle spalle" },
  { src: "/foto/bailame/bailame2.jpg", alt: "Due ragazze ballano abbracciate" },
  { src: "/foto/bailame/bailame5.jpg", alt: "Due amiche fanno le boccucce in posa per la foto" },
  { src: "/foto/bailame/bailame6.jpg", alt: "Una ragazza con un drink in mano si guarda intorno" },
  { src: "/foto/bailame/bailame7.jpg", alt: "Un gruppo di amici in posa sotto le luci colorate" },
  { src: "/foto/bailame/bailame8.jpg", alt: "Tre amici abbracciati sorridono alla foto" },
  { src: "/foto/bailame/bailame9.jpg", alt: "Una ragazza balla di spalle con le braccia alzate, l'insegna Bàilame sullo sfondo" },
  { src: "/foto/bailame/bailame10.jpg", alt: "Una ragazza in posa con la maglia del Brasile" },
];

const FOTO_ROOM26 = [
  { src: "/foto/room26/room26-1.jpg", alt: "Tre amiche abbracciate in posa per la foto" },
  { src: "/foto/room26/room26-2.jpg", alt: "Due amiche abbracciate sorridono" },
  { src: "/foto/room26/room26-3.jpg", alt: "Un gruppo di amiche si stringe per la foto" },
  { src: "/foto/room26/room26-4.jpg", alt: "Una ragazza con la lingua fuori balla con un'amica alle spalle" },
  { src: "/foto/room26/room26-5.jpg", alt: "Due amiche vicine, una beve con la cannuccia" },
  { src: "/foto/room26/room26-6.jpg", alt: "Un gruppo di amici fa una foto di gruppo" },
  { src: "/foto/room26/room26-7.jpg", alt: "Tre amiche con i drink in mano fanno le linguacce" },
  { src: "/foto/room26/room26-8.jpg", alt: "Tre amiche posano sorridenti" },
  { src: "/foto/room26/room26-9.jpg", alt: "Una ragazza in posa con la mano vicino al viso" },
  { src: "/foto/room26/room26-10.jpg", alt: "Una ragazza fa un cuore con le mani" },
  { src: "/foto/room26/room26-11.jpg", alt: "Un gruppo di amici abbracciati sorride alla foto" },
];

function CanaleFoto({
  titolo,
  colore,
  foto,
  href,
}: {
  readonly titolo: string;
  readonly colore: string;
  readonly foto: readonly { readonly src: string; readonly alt: string }[];
  readonly href: string;
}) {
  return (
    <div>
      <p className={stili.canaleTitolo} style={{ color: colore }}>
        {titolo}
      </p>
      <Galleria foto={foto} etichetta={`Foto di ${titolo}, scorri di lato`} />
      <a href={href} target="_blank" rel="noopener noreferrer" className={stili.canaleLink}>
        <span>{legaParole("Vedi tutte su Telegram", { vedova: true })}</span>
        <Gallone />
      </a>
    </div>
  );
}

/** Le foto delle serate, divise per canale Telegram: scorrono di lato, come le storie. */
export function LeFoto() {
  return (
    <section className="blocco" style={{ paddingTop: 0 }} aria-labelledby="le-foto">
      <div className="wrap">
        <div className="blocco-testa rivela">
          <p className="occhiello" style={{ margin: 0 }}>
            Dalle vostre serate
          </p>
          <Titolo2 id="le-foto" misura='clamp(25px, 7.6vw, 60px)'>Le foto</Titolo2>
        </div>

        <div className={`${stili.canali} rivela`}>
          <CanaleFoto titolo="Bàilame" colore="var(--red)" foto={FOTO_BAILAME} href="https://t.me/BAILAMEOFFICIAL" />
          <CanaleFoto titolo="ROOM26" colore="var(--cyan)" foto={FOTO_ROOM26} href="https://t.me/room26official" />
        </div>
      </div>
    </section>
  );
}

/**
 * Una pausa a tutta larghezza tra due sezioni: solo una foto e una riga,
 * senza scheda né bottoni. Serve a far respirare la pagina in mezzo alle
 * sezioni piene di testo e link, non a spiegare qualcosa.
 */
export function SpaccaPagina() {
  return (
    <section className={stili.spacca} data-sfondo="/foto/atmosfera/spacca-rosso.jpg" aria-hidden>
      <p className="display">
        <span className="cl">{legaParole("La musica non si racconta.", { titolo: true, vedova: false })}</span>{" "}
        <span className="cl">{legaParole("Si vive da dentro.", { titolo: true, vedova: false })}</span>
      </p>
    </section>
  );
}

/** Il riquadro con la faccia di Luca e il suo motto. */
export function ChiELuca() {
  return (
    <section className="blocco" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className={`${stili.luca} rivela`}>
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

/** Lo special guest: non c'è ancora un nome, quindi solo "In arrivo". Niente modulo, niente dati raccolti. */
export function SpecialGuest() {
  return (
    <section className="blocco" style={{ paddingTop: 0, paddingBottom: 24 }} aria-label={SPECIAL_GUEST.titolo}>
      <div className="wrap">
        <div className={`${stili.ospite} ${stili.ospiteFoto} rivela`} data-sfondo="/foto/atmosfera/special-guest.jpg">
          <div className={stili.ospiteTesto}>
            <strong>Special guest</strong>
            <p className={stili.arrivo}>
              <i aria-hidden />
              In arrivo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/*
 * Halloween: stessa attesa dello special guest, un locale diverso. Una foto
 * vera al posto del solo colore arancione, con lo stesso sistema (foto di
 * sfondo, sfumatura scura, testo chiaro sopra) usato per lo special guest.
 */
export function Halloween({ avvisami }: { readonly avvisami: React.ReactNode }) {
  return (
    <section className="blocco" style={{ paddingTop: 0, paddingBottom: 8 }} aria-label={HALLOWEEN.titolo}>
      <div className="wrap">
        <span className={stili.rigaDivisore} aria-hidden />
        <div className={`${stili.ospite} ${stili.halloween} rivela`} data-sfondo="/foto/atmosfera/halloween.jpg">
          <div className={stili.ospiteTesto}>
            <strong>Halloween</strong>
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

/** Il divisore tra "Le serate" e "Tutto il resto": invita a scorrere, senza dover scrivere un titolo. */
function FrecciaGiu() {
  return (
    <svg className={stili.divisoreFreccia} viewBox="0 0 24 24" width="20" height="20" aria-hidden focusable="false">
      <path
        d="M12 4v14m0 0l-6-6m6 6l6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
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
