import { INSTAGRAM_URL } from "@/contenuti/sito";
import { INDIRIZZO } from "@/lib/pubblico";

/**
 * I dati strutturati: servono a Google e ai motori che rispondono con l'AI
 * per capire chi è Luca senza doverlo dedurre dal testo.
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
        publisher: { "@id": `${INDIRIZZO}/#persona` },
      },
      {
        "@type": "Person",
        "@id": `${INDIRIZZO}/#persona`,
        name: "Luca Curella",
        alternateName: "Luca California",
        jobTitle: "PR e organizzatore di eventi",
        url: INDIRIZZO,
        sameAs: [INSTAGRAM_URL],
        areaServed: [
          { "@type": "City", name: "Roma" },
          { "@type": "City", name: "Civitavecchia" },
        ],
        knowsAbout: ["liste discoteca", "prenotazione tavoli", "eventi notturni"],
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
