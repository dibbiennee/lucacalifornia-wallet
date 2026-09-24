import Image from "next/image";

import { Bottone } from "@/componenti/sito/Bottone";
import { VideoApertura } from "@/componenti/VideoApertura";

import stili from "./Apertura.module.css";

/**
 * La prima schermata: il video del locale, il marchio, e le due strade.
 *
 * Sotto il video c'è sempre il fotogramma fermo: è quello che si vede subito,
 * quello che resta a chi ha chiesto meno movimento, e quello che resta se il
 * codice non parte.
 */
export function Apertura() {
  return (
    <section className={stili.apertura} aria-label="Luca California al Room 26">
      <svg className={stili.raggi} viewBox="0 0 700 700" fill="#FF3EA5" aria-hidden focusable="false">
        <polygon points="0,0 700,0 700,173" />
        <polygon points="0,0 700,325 700,525" />
      </svg>

      <VideoApertura />

      <picture>
        <source srcSet="/video/apertura-computer.jpg" media="(min-width: 52rem)" />
        <img src="/video/apertura-telefono.jpg" alt="" aria-hidden className={stili.fermo} />
      </picture>

      <div className={`wrap ${stili.dentro}`}>
        <Image
          src="/foto/california.webp"
          alt="California"
          width={272}
          height={78}
          priority
          sizes="136px"
          className={stili.california}
        />

        <p className={stili.giorni}>Giovedì, venerdì, sabato, domenica</p>

        <h1 className="display" tabIndex={-1}>
          <span className="cl">La notte</span> <span className="cl">ti dà libertà</span>
        </h1>

        <p className="introduzione">
          Ciao, sono Luca. Liste e tavoli al&nbsp;Room&nbsp;26 di&nbsp;Roma, da&nbsp;giovedì a
          domenica, con&nbsp;la&nbsp;navetta per&nbsp;arrivarci.
        </p>

        <div className={stili.azioni}>
          <Bottone href="/prenota?tipo=lista">Entra in lista o prenota</Bottone>
          <Bottone href="/serate" aspetto="contorno">
            Vedi le serate
          </Bottone>
        </div>
      </div>
    </section>
  );
}
