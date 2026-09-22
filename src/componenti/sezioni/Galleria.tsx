import { Pila } from "@/componenti/Pila";
import { INSTAGRAM, INSTAGRAM_URL } from "@/contenuti/sito";

/**
 * "Voi al Room 26": le storie verticali.
 *
 * Nel sito vero queste immagini le carica Luca dal pannello, e accanto
 * compaiono i post e i reel presi da Instagram. Qui sono quattro fotogrammi
 * del video del locale: non sono inventate, ma non sono nemmeno le storie
 * dei clienti.
 *
 * Ognuna ha la sua descrizione: sono immagini che raccontano com'è la serata,
 * quindi chi non le vede deve poter sapere cosa c'è dentro. Non sono
 * decorazione, e per questo non sono nascoste ai lettori di schermo.
 *
 * Scorre di lato con il dito: su un telefono è il gesto naturale, e non
 * costringe a impilare quattro immagini alte in colonna.
 */

const STORIE = [
  { file: "storia-1.jpg", descrizione: "Il dj alla consolle, con la sala illuminata di blu alle spalle" },
  { file: "storia-2.jpg", descrizione: "Due ragazze ridono in mezzo alla folla, sotto le luci" },
  { file: "storia-3.jpg", descrizione: "Una ragazza sorride guardando la pista" },
  { file: "storia-4.jpg", descrizione: "Due ragazze al bancone con i drink in mano" },
] as const;

export function Galleria() {
  return (
    <section className="fascia" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div className="dentro" style={{ padding: "0 var(--margine)" }}>
        <Pila occhiello="DALLE VOSTRE STORIE" righe={["VOI AL ROOM26"]} />
      </div>

      <ul className="scorrevole">
        {STORIE.map((storia) => (
          <li key={storia.file}>
            <img
              src={`/foto/storie/${storia.file}`}
              alt={storia.descrizione}
              loading="lazy"
              width={540}
              height={960}
              className="storia"
            />
          </li>
        ))}
      </ul>

      <div className="dentro" style={{ padding: "0 var(--margine)" }}>
        <a href={INSTAGRAM_URL} className="bottone bottone-vuoto">
          Segui @{INSTAGRAM}
        </a>
      </div>
    </section>
  );
}
