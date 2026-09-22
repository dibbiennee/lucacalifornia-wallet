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

        <p className="testo-lungo apertura-sottotitolo">
          Ciao, sono Luca. Liste e tavoli al Room 26 di Roma, da giovedì a domenica, con la
          navetta per arrivarci.
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
