import { Pila } from "@/componenti/Pila";
import { VideoApertura } from "@/componenti/VideoApertura";

/**
 * L'apertura, col video del Room 26 tagliato e in loop.
 *
 * Sotto c'è sempre il fotogramma fermo, nelle due versioni: è quello che si
 * vede subito, è quello che resta a chi ha chiesto meno movimento, ed è
 * quello che resta se javascript non parte. Il video ci si appoggia sopra
 * quando è pronto.
 */

export function Apertura() {
  return (
    <section className="apertura">
      <VideoApertura />

      <picture>
        <source srcSet="/video/apertura-computer.jpg" media="(min-width: 52rem)" />
        <img
          src="/video/apertura-telefono.jpg"
          alt=""
          aria-hidden
          className="apertura-media apertura-fermo"
        />
      </picture>

      <div aria-hidden className="apertura-velo" />

      <div className="dentro apertura-testo">
        <p className="debole apertura-giorni">GIOVEDÌ, VENERDÌ, SABATO, DOMENICA</p>

        <Pila righe={["LA NOTTE", "TI DÀ LIBERTÀ"]} livello={1} />

        {/*
          Niente a capo forzati: la riga la decide la larghezza in caratteri.
          Gli spazi indivisibili servono solo a non far finire una riga su una
          preposizione o un articolo staccati da quello che reggono.
        */}
        <p className="testo-lungo apertura-sottotitolo">
          Ciao, sono Luca. Liste e tavoli al&nbsp;Room&nbsp;26 di&nbsp;Roma, da&nbsp;giovedì a
          domenica, con&nbsp;la&nbsp;navetta per&nbsp;arrivarci.
        </p>

        <div className="apertura-azioni">
          <a href="?tipo=lista#prenota" className="bottone">
            Entra in lista o prenota
          </a>
          <a href="/serate" className="bottone bottone-vuoto">
            Vedi le serate
          </a>
        </div>
      </div>
    </section>
  );
}
