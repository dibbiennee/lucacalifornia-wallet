import Link from "next/link";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

import stili from "./Bottone.module.css";

export type Aspetto = "caldo" | "contorno" | "nero" | "chiaro";

interface Comuni {
  readonly aspetto?: Aspetto | undefined;
  /** Largo quanto la riga: in fondo a una colonna, o dentro un modulo. */
  readonly pieno?: boolean | undefined;
  /** Più basso: nella testata, dove lo spazio è quello che è. */
  readonly stretto?: boolean | undefined;
  /** Una classe in più, per chi deve nasconderlo o spostarlo. */
  readonly classe?: string | undefined;
  readonly children: ReactNode;
}

/* I tipi qui accettano undefined perché il progetto ha exactOptionalPropertyTypes. */
function classi({
  aspetto = "caldo",
  pieno,
  stretto,
  classe,
}: {
  readonly aspetto?: Aspetto | undefined;
  readonly pieno?: boolean | undefined;
  readonly stretto?: boolean | undefined;
  readonly classe?: string | undefined;
}): string {
  return [
    stili.btn,
    stili[aspetto],
    pieno === true ? stili.pieno : "",
    stretto === true ? stili.stretto : "",
    classe ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Il pulsante che porta da qualche parte. */
export function Bottone({
  href,
  esterno = false,
  stile,
  ...resto
}: Comuni & {
  readonly href: string;
  /** Vero per Instagram e WhatsApp: escono dal sito. */
  readonly esterno?: boolean;
  readonly stile?: CSSProperties;
}) {
  const classe = classi(resto);

  return esterno ? (
    <a className={classe} href={href} style={stile}>
      {resto.children}
    </a>
  ) : (
    <Link className={classe} href={href} style={stile}>
      {resto.children}
    </Link>
  );
}

/** Lo stesso, quando invece fa qualcosa. */
export function BottoneAzione({
  aspetto,
  pieno,
  stretto,
  classe,
  children,
  ...resto
}: Comuni & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classi({ aspetto, pieno, stretto, classe })} {...resto}>
      {children}
    </button>
  );
}
