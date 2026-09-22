import { Pila } from "@/componenti/Pila";
import { INSTAGRAM, INSTAGRAM_URL } from "@/contenuti/sito";

/**
 * "Voi al Room 26": le storie verticali.
 *
 * Nel sito vero queste immagini le carica Luca dal pannello, e accanto
 * compaiono i post e i reel presi da Instagram. In anteprima sono fotogrammi
 * veri del locale, presi dal video: non sono inventati, ma non sono nemmeno
 * le storie dei clienti.
 *
 * Scorre di lato con il dito: su un telefono è il gesto naturale, e non
 * costringe a impilare sei immagini alte in colonna.
 */

const STORIE = [1, 2, 3, 4, 5, 6] as const;

export function Galleria() {
  return (
    <section className="fascia" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div className="dentro" style={{ padding: "0 var(--margine)" }}>
        <Pila occhiello="DALLE VOSTRE STORIE" righe={["VOI AL ROOM26"]} />
      </div>

      <div className="scorrevole">
        {STORIE.map((n) => (
          <img
            key={n}
            src={`/foto/storie/storia-${n}.jpg`}
            alt=""
            aria-hidden
            loading="lazy"
            width={540}
            height={960}
            className="storia"
          />
        ))}
      </div>

      <div className="dentro" style={{ padding: "0 var(--margine)" }}>
        <a href={INSTAGRAM_URL} className="bottone bottone-vuoto">
          Segui @{INSTAGRAM}
        </a>
      </div>
    </section>
  );
}
