import { INDIRIZZO } from "@/lib/pubblico";

/**
 * Le briciole di pane per i motori di ricerca (BreadcrumbList): dicono in che
 * punto del sito sta una pagina. Sulle pagine di serata c'è già il link
 * "Tutte le serate" a vista, quindi il percorso dichiarato è anche quello
 * che la persona vede.
 */
export function DatiBriciole({ voci }: { readonly voci: readonly { readonly nome: string; readonly percorso: string }[] }) {
  const dati = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: voci.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: v.nome,
      item: v.percorso === "/" ? INDIRIZZO : `${INDIRIZZO}${v.percorso}`,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dati) }} />;
}
