import Image from "next/image";

import stili from "./MosaicoFoto.module.css";

export interface FotoMosaico {
  readonly src: string;
  readonly alt: string;
}

/**
 * Le foto in un mosaico: quattro colonne sfalsate, le pari un po' più in basso,
 * così l'occhio ha un ritmo e non una tabella. Sul telefono due colonne, sfalsate
 * allo stesso modo. Le foto sono già alternate (Bàilame, ROOM26) da chi le passa.
 * Ogni foto è ritagliata in 4 a 5: tutte uguali, senza strisce vuote.
 */
export function MosaicoFoto({ foto, etichetta }: { readonly foto: readonly FotoMosaico[]; readonly etichetta: string }) {
  return (
    <ul className={stili.mosaico} aria-label={etichetta}>
      {foto.map((f) => (
        <li key={f.src}>
          <Image src={f.src} alt={f.alt} width={640} height={800} sizes="(min-width: 900px) 25vw, 50vw" />
        </li>
      ))}
    </ul>
  );
}
