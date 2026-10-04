import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { percorsoSerata, type SerataSito } from "@/contenuti/sito";
import { legaParole } from "@/lib/tipografia";

import { Bottone } from "./Bottone";
import stili from "./CardSerata.module.css";

/**
 * Il link al modulo, già con la serata scelta.
 *
 * "codice" è il codice della notte (milkshake, venerdi, sabato, bailame):
 * il modulo lo usa per selezionare la prossima data vera di quella notte,
 * non più una scritta fissa come "Ven Drip".
 */
export function perPrenotare(codice: string, tipo: "lista" | "tavolo" | "braccialetto" = "lista"): string {
  return `/prenota?tipo=${tipo}&serata=${encodeURIComponent(codice)}`;
}

/** Una serata, col suo colore. */
export function CardSerata({ serata }: { readonly serata: SerataSito }) {
  const colore = `var(--${serata.colore})`;

  return (
    <article className={stili.card} style={{ background: colore }}>
      <Link href={percorsoSerata(serata)} className={stili.foto} aria-label={`${serata.nome}, dettagli`}>
        <Image
          src={serata.copertina}
          alt={serata.alt}
          width={640}
          height={624}
          sizes="(min-width: 860px) 320px, 86vw"
          style={serata.copertinaPosizione === undefined ? undefined : { objectPosition: serata.copertinaPosizione }}
        />
        <span className={stili.etichetta} style={{ color: colore }}>
          {serata.etichetta}
        </span>
      </Link>

      <div className={stili.corpo}>
        <p className={stili.giorno}>{serata.giorno}</p>

        <h3 className="display" style={serata.codice === "sabato" ? { fontStretch: "100%" } : undefined}>
          <Link href={percorsoSerata(serata)}>{serata.nome}</Link>
        </h3>

        <div className={stili.piede}>
          <Link href={percorsoSerata(serata)} className={stili.musica}>
            {legaParole(serata.musica)}
          </Link>
          <Bottone href={perPrenotare(serata.codice, "tavolo")} aspetto="nero" stretto>
            Prenota
          </Bottone>
        </div>
      </div>
    </article>
  );
}

/**
 * Le quattro serate, una riga sottile ciascuna.
 *
 * Chi ha già un marchio suo (Milkshake, Bàilame) lo indossa per intero: la
 * foto aderisce a tutta la riga, a destra, e si spegne verso sinistra dentro
 * il colore della riga, proprio dove serve spazio pulito per il testo. Le
 * altre, finché non hanno una foto, restano un tassello del loro colore con
 * il giorno in tre lettere dentro: non un pallino qualunque.
 */
export function ListaSerate({ serate }: { readonly serate: readonly SerataSito[] }) {
  return (
    <>
      <RigheSerate serate={serate} />
      <LocandineSerate serate={serate} />
    </>
  );
}

/**
 * Dal computer in su le quattro serate sono quattro locandine una accanto all'altra,
 * intere: le righe sottili della versione telefono tagliavano la grafica a strisce
 * (un pezzo di bicchiere, un pezzo di faccia). Qui la locandina si vede com'è, con sotto
 * il giorno nel suo colore, il nome e la musica. Sul telefono resta la riga.
 */
function LocandineSerate({ serate }: { readonly serate: readonly SerataSito[] }) {
  return (
    <div className={stili.locandine}>
      {serate.map((s) => (
        <Link key={s.codice} href={percorsoSerata(s)} className={stili.locandina} style={{ "--giorno": `var(--${s.colore})` } as CSSProperties}>
          <span className={stili.locandinaFoto}>
            <Image src={s.copertina} alt={s.alt} width={640} height={640} sizes="(min-width: 900px) 280px, 0px" />
          </span>
          <span className={stili.locandinaTesto}>
            <span className={stili.locandinaGiorno}>{s.giorno}</span>
            <strong className={`display ${stili.locandinaNome}`}>{s.nome}</strong>
            <span className={stili.locandinaGenere}>{legaParole(s.genere, { vedova: true })}</span>
          </span>
          <Freccia />
        </Link>
      ))}
    </div>
  );
}

function RigheSerate({ serate }: { readonly serate: readonly SerataSito[] }) {
  return (
    <div className={stili.righe}>
      {serate.map((s) => {
        const conFoto = s.badge !== undefined;

        return (
          <Link
            key={s.codice}
            href={percorsoSerata(s)}
            className={`${stili.riga} ${conFoto ? stili.rigaConFoto : ""}`}
            data-sfondo={s.badge}
            style={
              conFoto
                ? {
                    backgroundImage: `linear-gradient(to right, rgba(20, 19, 24, 0.45), rgba(20, 19, 24, 0.55)), var(--foto, none)`,
                    backgroundPosition: s.badgePosizione ?? "center",
                  }
                : undefined
            }
          >
            {!conFoto && (
              <span className={stili.rigaBadge} style={{ background: `var(--${s.colore})` }}>
                <strong aria-hidden>{s.breve}</strong>
              </span>
            )}
            <span className={stili.rigaTesto}>
              <strong className={`display ${stili.rigaNome}`}>{s.nome}</strong>
              <span className={stili.rigaGenere}>
                {s.giorno} · {s.genere}
              </span>
            </span>
            <Freccia />
          </Link>
        );
      })}
    </div>
  );
}

function Freccia() {
  return (
    <svg className={stili.rigaFreccia} width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Le stesse, una sotto l'altra: nella pagina delle serate. */
export function ElencoSerate({ serate }: { readonly serate: readonly SerataSito[] }) {
  return (
    <div className={stili.elenco}>
      {serate.map((s) => (
        <CardSerata key={s.codice} serata={s} />
      ))}
    </div>
  );
}
