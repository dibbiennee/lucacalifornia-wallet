import { LettoreQr } from "@/componenti/LettoreQr";
import { AvvisoExtra } from "@/componenti/pannello/Messaggi";
import { PulsanteLink } from "@/componenti/pannello/Pulsante";
import { Testata } from "@/componenti/pannello/Testata";
import { stasera, ultimiIngressi } from "@/lib/pannello/dati";

import stili from "./porta.module.css";

export const metadata = { title: "Porta, pannello Luca California" };

/**
 * La porta.
 *
 * È fuori dalla barra: forse non verrà mai usata, e finché Luca non dice che
 * la vuole non ci si investe altro tempo. Ci si arriva solo dall'indirizzo.
 *
 * Il lettore adesso sta dentro la pagina. Prima era fisso su tutto lo
 * schermo, quindi fuori dal flusso, e la sezione qui sotto gli finiva sopra
 * coprendolo: non si riusciva nemmeno ad accendere la fotocamera.
 */
export default function Porta() {
  const sera = stasera();
  const ingressi = ultimiIngressi();

  return (
    <main className="pagina">
      <AvvisoExtra>Extra, non incluso: il lettore QR alla porta, se un giorno servirà.</AvvisoExtra>

      <Testata occhiello={`Porta, ${sera.serata}`} titolo="Porta" titoloNascosto />

      {/* Il numero cresce mentre la gente entra: chi legge con la voce lo sente. */}
      <p className={stili.conteggio} aria-live="polite">
        <b>{sera.entrati}</b>
        <span>/ {sera.attesi} entrati</span>
      </p>

      <LettoreQr />

      <section className="sezione" aria-labelledby="a-mano">
        <h2 className="titolo-sezione" id="a-mano">
          Se il QR non si legge
        </h2>
        <PulsanteLink aspetto="vuoto" href="/pannello/richieste">
          Cerca a mano nella lista
        </PulsanteLink>
      </section>

      <section className="sezione" aria-labelledby="ultimi-ingressi">
        <h2 className="titolo-sezione" id="ultimi-ingressi">
          Ultimi ingressi
        </h2>
        <div className="lista">
          {ingressi.map((i) => (
            <p key={i.nome} className={stili.ingresso}>
              <span>
                {i.nome}
                {i.giaEntrato && <em>, già entrato</em>}
              </span>
              <time>{i.ora}</time>
            </p>
          ))}
        </div>
      </section>

      <p className="testo-piccolo">
        Il lettore è vero e riconosce i biglietti veri. Il conteggio e gli ultimi ingressi sono di
        esempio: per ricordare chi è già passato serve il database.
      </p>
    </main>
  );
}
