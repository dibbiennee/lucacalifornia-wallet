import Link from "next/link";
import type { ReactNode } from "react";

import stili from "./Scelta.module.css";

/**
 * Il gruppo di scelte: una sola alla volta, come i vecchi pulsanti della radio.
 *
 * Due forme, perché sono due cose diverse. I filtri delle richieste sono
 * link, così la scelta sta nell'indirizzo e sopravvive al ricaricamento; le
 * etichette delle serate sono bottoni, perché cambiano un dato.
 */

export function Scelta({
  etichettatoDa,
  children,
}: {
  readonly etichettatoDa: string;
  readonly children: ReactNode;
}) {
  return (
    <div className={stili.scelta} role="radiogroup" aria-labelledby={etichettatoDa}>
      {children}
    </div>
  );
}

export function VoceScelta({
  testo,
  scelta,
  premi,
}: {
  readonly testo: string;
  readonly scelta: boolean;
  readonly premi: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={scelta}
      onClick={premi}
      className={stili.voce}
    >
      {testo}
    </button>
  );
}

/** Le stesse pillole, quando la scelta è un indirizzo. */
export function Filtri({ children }: { readonly children: ReactNode }) {
  return <div className={stili.scelta}>{children}</div>;
}

export function Filtro({
  testo,
  dove,
  attivo,
}: {
  readonly testo: string;
  readonly dove: string;
  readonly attivo: boolean;
}) {
  return (
    <Link href={dove} className={stili.voce} aria-current={attivo ? "true" : undefined}>
      {testo}
    </Link>
  );
}

/** Il riquadro che tiene insieme un titolo e le sue scelte. */
export function Riquadro({
  titolo,
  id,
  children,
}: {
  readonly titolo?: string;
  readonly id?: string;
  readonly children: ReactNode;
}) {
  return (
    <div className={stili.riquadro}>
      {titolo !== undefined && (
        <h2 className={stili["riquadro-titolo"]} id={id}>
          {titolo}
        </h2>
      )}
      {children}
    </div>
  );
}
