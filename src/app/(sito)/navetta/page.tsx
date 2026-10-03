import { Bottone } from "@/componenti/sito/Bottone";
import { DatiBriciole } from "@/componenti/DatiBriciole";
import { Indietro } from "@/componenti/sito/Indietro";
import { Introduzione, TestaPagina, Titolo2 } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Pagina.module.css";
import { linkWhatsapp, MESSAGGI_WHATSAPP, NAVETTA } from "@/contenuti/sito";
import { legaParole } from "@/lib/tipografia";

import stiliPagina from "./page.module.css";
import { metadatiPagina } from "@/lib/seo";

export const metadata = metadatiPagina({
  percorso: "/navetta",
  titolo: "Navetta per il ROOM26, da qualsiasi zona - Luca California",
  descrizione:
    "Vieni da fuori Roma? Organizzo la navetta per le serate al ROOM26 da qualsiasi zona. Disponibilità, orari e costo li concordiamo insieme.",
});

/**
 * Il messaggio che si apre in WhatsApp. La zona non si può precompilare in un
 * link, quindi il testo non la nomina: la dice chi scrive.
 */
const LINK_WHATSAPP = linkWhatsapp(MESSAGGI_WHATSAPP.navetta);

const IN_MACCHINA = [
  "Uno di voi non beve per tutta la sera",
  "Mezz'ora a girare per il parcheggio",
  "Il palloncino all'uscita",
] as const;

const CON_LA_NAVETTA = [
  "Bevete tutti, nessuno escluso",
  "Niente parcheggio da cercare",
  "Si va e si torna in navetta",
] as const;

export default function PaginaNavetta() {
  return (
    <>
      <DatiBriciole voci={[{ nome: "Home", percorso: "/" }, { nome: "Servizio navetta", percorso: "/navetta" }]} />
      <Indietro testo="Home" dove="/" />
      <div className={stiliPagina.sfondo}>
        <TestaPagina
          occhiello={NAVETTA.occhiello.charAt(0) + NAVETTA.occhiello.slice(1).toLowerCase()}
          righe={["Navetta per il ROOM26"]}
          introduzione="Vieni da fuori Roma? Posso organizzare la navetta per il ROOM26 da qualsiasi zona. Disponibilità, orari e costo li concordiamo insieme, in base alla tua richiesta."
        />
      </div>

      <section className="wrap" style={{ paddingBottom: 56 }}>
        <div style={{ marginTop: 28 }}>
          <Titolo2 id="come-fare" misura="clamp(22px, 6vw, 30px)">
            Come vuoi partire
          </Titolo2>
        </div>

        <div className={stiliPagina.percorsi}>
          <div className={stiliPagina.percorso}>
            <strong>{legaParole("Voglio prenotare la serata", { vedova: false })}</strong>
            <p>
              {legaParole("Scegli tavolo, bracciale VIP o lista. Quando ti ricontatto, concordiamo anche la navetta.", {
                vedova: true,
              })}
            </p>
            <Bottone href="/prenota" pieno classe="cta-prenota">
              Prenota la tua serata
            </Bottone>
          </div>

          <div className={stiliPagina.percorso}>
            <strong>{legaParole("Prima voglio informazioni", { vedova: false })}</strong>
            <p>{legaParole("Scrivimi su WhatsApp: ti dico disponibilità, orari e costo.", { vedova: true })}</p>
            <Bottone href={LINK_WHATSAPP} esterno pieno aspetto="contorno">
              Info navetta su WhatsApp
            </Bottone>
          </div>
        </div>

        <div className={stili.confronto}>
          <div className={stili.male}>
            <p>In macchina</p>
            <ul>
              {IN_MACCHINA.map((riga) => (
                <li key={riga}>
                  <svg viewBox="0 0 24 24" aria-hidden focusable="false">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                  {riga}
                </li>
              ))}
            </ul>
          </div>

          <div className={stili.bene}>
            <p>Con la navetta</p>
            <ul>
              {CON_LA_NAVETTA.map((riga) => (
                <li key={riga}>
                  <svg viewBox="0 0 24 24" aria-hidden focusable="false">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  {riga}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h2 className="display" style={{ fontSize: "clamp(20px, 6.4vw, 44px)", marginBottom: 12 }}>
          <span className="cl">Meglio&nbsp;la&nbsp;navetta</span>{" "}
          <span className="cl">che&nbsp;perdere la&nbsp;patente</span>
        </h2>
        <div>
          <Introduzione>
            Neopatentato o sotto i 21 anni? Per te il limite è zero: basta un drink per rischiare la sospensione.
            Con la navetta, di chi guida non devi preoccuparti.
          </Introduzione>
        </div>
      </section>
    </>
  );
}
