import Image from "next/image";
import Link from "next/link";

import type { SerataSito } from "@/contenuti/sito";

import { Bottone } from "./Bottone";
import stili from "./CardSerata.module.css";

/** Il link al modulo, già con la serata scelta. */
export function perPrenotare(serata: string, tipo: "lista" | "tavolo" = "lista"): string {
  return `/prenota?tipo=${tipo}&serata=${encodeURIComponent(serata)}`;
}

/**
 * Una serata, col suo colore.
 *
 * Il sabato è l'eccezione: due sale con due musiche diverse, quindi due porte
 * invece di un pulsante solo. Su fondo scuro, perché il colore lì sarebbe una
 * scelta fra le due sale.
 */
export function CardSerata({ serata }: { readonly serata: SerataSito }) {
  const due = serata.dueSale === true;
  const colore = `var(--${serata.colore})`;

  return (
    <article
      className={stili.card}
      style={due ? { background: "var(--surface)", color: "var(--text)" } : { background: colore }}
    >
      <Link href={`/serate/${serata.codice}`} className={stili.foto} aria-label={`${serata.nome}, dettagli`}>
        <Image src={serata.copertina} alt={serata.alt} width={640} height={624} sizes="(min-width: 860px) 320px, 86vw" />
        <span
          className={stili.etichetta}
          style={due ? { background: "var(--text)", color: "var(--ink)" } : { color: colore }}
        >
          {serata.etichetta}
        </span>
      </Link>

      <div className={stili.corpo}>
        <p className={stili.giorno} style={due ? { color: "var(--muted)" } : undefined}>
          {serata.giorno}
        </p>

        <h3 className="display" style={serata.codice === "venerdi" ? { fontStretch: "112%" } : undefined}>
          <Link href={`/serate/${serata.codice}`}>{serata.nome}</Link>
        </h3>

        {due && (
          /*
            Al posto della riga "musica piu' Prenota" delle altre serate, e
            dentro al corpo come quella: attaccate in fondo alla card, la
            rendevano cento pixel piu' alta delle sorelle.
          */
          <div className={stili["due-sale"]}>
            <Link
              href={perPrenotare("Sab sala 1 house")}
              className={stili.sala}
              style={{ background: "var(--cyan)" }}
              aria-label="Sala 1, house"
            >
              <small>Sala 1</small>
              <strong>HOUSE</strong>
            </Link>
            <Link
              href={perPrenotare("Sab sala 2 reggaeton")}
              className={stili.sala}
              style={{ background: "var(--magenta)" }}
              aria-label="Sala 2, reggaeton"
            >
              <small>Sala 2</small>
              {/*
                La parola intera dove ci sta, l'abbreviazione dove la card è
                stretta: in quattro colonne "REGGAETON" non entra nemmeno a
                dieci pixel. Chi legge con la voce sente il nome per esteso,
                che sta nell'aria-label del link.
              */}
              <strong>
                <span className={stili.intero}>REGGAETON</span>
                <span className={stili.corto}>REGG.</span>
              </strong>
            </Link>
          </div>
        )}

        {!due && (
          <div className={stili.piede}>
            <Link href={`/serate/${serata.codice}`} className={stili.musica}>
              {/* Non legata: in una card stretta "Afro e reggaeton" tutto
                  attaccato sfonda il riquadro, e qui l'a capo ci sta bene. */}
              {serata.musica}
            </Link>
            <Bottone href={perPrenotare(serata.perModulo)} aspetto="nero" stretto>
              Prenota
            </Bottone>
          </div>
        )}
      </div>
    </article>
  );
}

/** Le quattro serate che scorrono di lato. */
export function StrisciaSerate({ serate }: { readonly serate: readonly SerataSito[] }) {
  return (
    <>
      <div className={stili.striscia}>
        {serate.map((s) => (
          <CardSerata key={s.codice} serata={s} />
        ))}
      </div>
      <p className={stili.suggerimento} aria-hidden>
        Scorri per le altre serate
      </p>
    </>
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
