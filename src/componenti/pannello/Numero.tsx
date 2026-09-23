import Link from "next/link";
import type { ReactNode } from "react";

import stili from "./Numero.module.css";

/** La griglia dei numeri: si adatta da sola a quanti ne metti. */
export function Numeri({ children }: { readonly children: ReactNode }) {
  return <div className={stili.numeri}>{children}</div>;
}

/**
 * Un numero con la sua etichetta sotto.
 *
 * Con "dove" diventa un link: lo usa "nuove" in Stasera, che porta alle
 * richieste da confermare.
 */
export function Numero({
  valore,
  etichetta,
  dove,
}: {
  readonly valore: number | string;
  readonly etichetta: string;
  readonly dove?: string;
}) {
  const dentro = (
    <>
      <b>{valore}</b>
      <span>{etichetta}</span>
    </>
  );

  return dove === undefined ? (
    <div className={stili.numero}>{dentro}</div>
  ) : (
    <Link href={dove} className={`${stili.numero} ${stili.link}`}>
      {dentro}
    </Link>
  );
}
