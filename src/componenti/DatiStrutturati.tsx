import { INSTAGRAM_URL } from "@/contenuti/sito";
import { INDIRIZZO } from "@/lib/pubblico";

/**
 * I dati strutturati: servono a Google e ai motori che rispondono con l'AI
 * per capire chi è Luca California senza doverlo dedurre dal testo.
 *
 * Il nome pubblico è sempre e solo "Luca California": l'organizzazione e la
 * persona che la guida usano lo stesso nome. Il nome anagrafico non compare
 * qui (sta soltanto nell'informativa privacy, dove la legge lo richiede).
 *
 * Solo fatti verificabili: nome, sito, Instagram, che cosa fa. Niente
 * indirizzi o orari finché non li dà lui, perché un dato strutturato
 * sbagliato è peggio di uno assente: questo lo copiano.
 */
export function DatiStrutturati() {
  const dati = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${INDIRIZZO}/#sito`,
        url: INDIRIZZO,
        name: "Luca California",
        inLanguage: "it-IT",
        publisher: { "@id": `${INDIRIZZO}/#organizzazione` },
      },
      {
        "@type": "Organization",
        "@id": `${INDIRIZZO}/#organizzazione`,
        name: "Luca California",
        url: INDIRIZZO,
        logo: `${INDIRIZZO}/loghi/icona-512.png`,
        description: "PR di Roma: liste e tavoli al ROOM26, con la navetta per arrivarci.",
        sameAs: [INSTAGRAM_URL],
        areaServed: [
          { "@type": "City", name: "Roma" },
          { "@type": "City", name: "Civitavecchia" },
        ],
        founder: { "@id": `${INDIRIZZO}/#persona` },
        knowsAbout: ["liste discoteca", "prenotazione tavoli", "eventi notturni"],
      },
      {
        "@type": "Person",
        "@id": `${INDIRIZZO}/#persona`,
        name: "Luca California",
        jobTitle: "PR e organizzatore di eventi",
        url: INDIRIZZO,
        sameAs: [INSTAGRAM_URL],
        worksFor: { "@id": `${INDIRIZZO}/#organizzazione` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dati) }}
    />
  );
}
