import Image from "next/image";

import { Bottone } from "@/componenti/sito/Bottone";
import { VideoApertura } from "@/componenti/VideoApertura";
import { legaParole } from "@/lib/tipografia";

import stili from "./Apertura.module.css";

/**
 * La prima schermata: il video del locale, il marchio, e le due strade.
 *
 * Sul telefono il filmato fa da sfondo a tutta la pagina, col testo sopra e
 * un velo scuro sotto perché resti leggibile. Su uno schermo largo diventa
 * un riquadro verticale accanto al testo: allargato riempirebbe lo schermo
 * di pixel sgranati, e il velo coprirebbe un video che nessuno vede.
 *
 * Sotto il video c'è sempre la foto: è quella che si vede subito, quella che
 * resta a chi ha chiesto meno movimento, e quella che resta se il codice non
 * parte.
 */
export function Apertura() {
  return (
    <section id="apertura" className={stili.apertura} aria-label="Luca California al Room 26">
      <svg className={stili.raggi} viewBox="0 0 700 700" fill="#FF3EA5" aria-hidden focusable="false">
        <polygon points="0,0 700,0 700,173" />
        <polygon points="0,0 700,325 700,525" />
      </svg>

      <div className={`wrap ${stili.dentro}`}>
        <div className={stili.media}>
          {/* La foto prima del video: dipinta per ultima gli finirebbe sopra.
              Ha la precedenza sul resto perché riempie subito lo schermo. */}
          <img
            src="/foto/poster.webp"
            alt=""
            aria-hidden
            fetchPriority="high"
            width={480}
            height={853}
          />
          <VideoApertura />
        </div>

        <div className={stili.testo}>
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
            <span className="cl">Tu scegli la&nbsp;serata.</span> <span className="cl">Io ti faccio entrare</span>
          </h1>

          <p className="introduzione">{legaParole("Ciao, sono Luca, PR ed organizzatore di eventi.", { vedova: true })}</p>

          <div className={stili.azioni}>
            <Bottone href="/prenota?tipo=tavolo">Prenota il tavolo</Bottone>
            <Bottone href="/prenota?tipo=lista" aspetto="contorno">
              Entra in lista
            </Bottone>
          </div>
        </div>
      </div>
    </section>
  );
}
