import type { Metadata } from "next";

export const TITOLO_HOME = "Luca California, liste e tavoli al ROOM26 di Roma";
export const DESCRIZIONE_HOME =
  "Liste e tavoli al ROOM26 di Roma, da giovedì a domenica, con la navetta per arrivarci. Prenoti in mezzo minuto e il biglietto ti arriva nel telefono.";

/*
 * L'immagine che esce quando un link viene condiviso (WhatsApp, Instagram, social).
 * Luca manda i link centinaia di volte: un link nudo sembra sospetto.
 */
const ANTEPRIMA = "/anteprima-sito-2.jpg";

/**
 * I metadati di una pagina pubblica: titolo, descrizione, indirizzo canonico
 * e anteprime social, tutti della PAGINA e non della home.
 *
 * Next unisce i metadati di layout e pagina "in superficie": un campo che la
 * pagina non definisce resta quello del layout. Per questo ogni pagina deve
 * dire da sé il proprio canonical e l'intero blocco openGraph, altrimenti
 * dichiara a Google di essere una copia della home.
 *
 * `percorso` è il percorso senza dominio ("/tavoli"): il dominio lo mette
 * metadataBase. Niente parametri: il canonical non deve cambiare con
 * "?tipo=tavolo".
 */
export function metadatiPagina({
  percorso,
  titolo,
  descrizione,
}: {
  readonly percorso: string;
  readonly titolo: string;
  readonly descrizione: string;
}): Metadata {
  return {
    title: titolo,
    description: descrizione,
    alternates: { canonical: percorso },
    openGraph: {
      type: "website",
      siteName: "Luca California",
      locale: "it_IT",
      url: percorso,
      title: titolo,
      description: descrizione,
      images: [{ url: ANTEPRIMA, width: 1200, height: 630, alt: titolo }],
    },
    twitter: { card: "summary_large_image", title: titolo, description: descrizione, images: [ANTEPRIMA] },
  };
}
