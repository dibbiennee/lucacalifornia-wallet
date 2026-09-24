import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import stili from "./Pulsante.module.css";

export type Aspetto = "pieno" | "vuoto" | "whatsapp" | "pillola" | "wallet";

/**
 * Il pulsante, in tutte le forme che servono al pannello.
 *
 * Alto almeno 52 px e su una riga sola: si preme di notte, con una mano.
 * Quando è disabilitato il testo dentro dice cosa sta succedendo
 * ("Preparo il biglietto..."), perché un pulsante spento e muto sembra rotto.
 */
export function Pulsante({
  aspetto = "pieno",
  piccolo = false,
  children,
  ...resto
}: {
  readonly aspetto?: Aspetto;
  readonly piccolo?: boolean;
  readonly children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classi(aspetto, piccolo)} {...resto}>
      {children}
    </button>
  );
}

/** Lo stesso pulsante, quando porta da qualche parte invece di fare qualcosa. */
export function PulsanteLink({
  aspetto = "pieno",
  piccolo = false,
  href,
  esterno = false,
  children,
}: {
  readonly aspetto?: Aspetto;
  readonly piccolo?: boolean;
  readonly href: string;
  /** Vero per WhatsApp e per il file del biglietto: fuori dall'applicazione. */
  readonly esterno?: boolean;
  readonly children: ReactNode;
}) {
  const classe = classi(aspetto, piccolo);

  return esterno ? (
    <a className={classe} href={href}>
      {children}
    </a>
  ) : (
    <Link className={classe} href={href}>
      {children}
    </Link>
  );
}

/** Due pulsanti affiancati, larghi uguale. */
export function DuePulsanti({ children }: { readonly children: ReactNode }) {
  return <div className={stili.due}>{children}</div>;
}

function classi(aspetto: Aspetto, piccolo: boolean): string {
  return [stili.btn, stili[aspetto], piccolo ? stili.piccolo : ""].filter(Boolean).join(" ");
}
