import Image from "next/image";

import { Bottone } from "@/componenti/sito/Bottone";
import { VideoApertura } from "@/componenti/VideoApertura";
import { HERO_VIDEO } from "@/contenuti/hero-video";

import stili from "./Apertura.module.css";

/**
 * La prima schermata: il video del locale, il marchio, e le due strade.
 *
 * Sul telefono il filmato fa da sfondo a tutta la pagina, col testo sopra e
 * un velo scuro sotto perché resti leggibile. Su uno schermo largo diventa
 * un riquadro verticale accanto al testo: allargato riempirebbe lo schermo
 * di pixel sgranati, e il velo coprirebbe un video che nessuno vede.
 *
 * Sotto il video c'è sempre la foto: il primo fotogramma esatto del video, quindi
 * si passa dalla foto al filmato senza stacco. È quella che si vede subito,
 * quella che resta a chi ha chiesto meno movimento, e quella che resta se il
 * browser non fa partire il video (risparmio batteria, per esempio).
 */
export function Apertura() {
  return (
    <section id="apertura" className={stili.apertura} aria-label="Luca California al ROOM26">
      <svg className={stili.raggi} viewBox="0 0 700 700" fill="#FF3EA5" aria-hidden focusable="false">
        <polygon points="0,0 700,0 700,173" />
        <polygon points="0,0 700,325 700,525" />
      </svg>

      <div className={`wrap ${stili.dentro}`}>
        <div className={stili.media}>
          {/* La foto prima del video: dipinta per ultima gli finirebbe sopra.
              Ha la precedenza sul resto perché riempie subito lo schermo. */}
          <img
            src={HERO_VIDEO.poster}
            alt=""
            aria-hidden
            fetchPriority="high"
            width={HERO_VIDEO.larghezza}
            height={HERO_VIDEO.altezza}
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

          <p className="introduzione">
            <span className="cl">Ciao, sono&nbsp;Luca California, PR</span> <span className="cl">ed organizzatore di eventi a&nbsp;Roma.</span>{" "}
            <span className="cl">Liste, tavoli e bracciali per le serate del ROOM26,</span>{" "}
            <span className="cl">con la navetta per chi viene da fuori Roma.</span>
          </p>

          <div className={stili.azioni}>
            <Bottone href="/prenota?tipo=tavolo">Prenota il tavolo</Bottone>
            <Bottone href="/prenota?tipo=braccialetto" aspetto="contorno">
              Prenota il bracciale VIP
            </Bottone>
            <Bottone href="/prenota?tipo=lista" aspetto="contorno">
              Entra in lista
            </Bottone>
          </div>
        </div>
      </div>
    </section>
  );
}
