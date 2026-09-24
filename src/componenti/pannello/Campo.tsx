import type { InputHTMLAttributes } from "react";

import stili from "./Campo.module.css";

/**
 * Un campo con la sua etichetta e il suo errore.
 *
 * L'etichetta è sempre collegata, anche quando è nascosta alla vista (la
 * ricerca in Stasera): chi legge con la voce deve sapere cosa ci va dentro.
 * L'errore sta sotto il campo, non in cima alla pagina, e si annuncia da solo.
 */
export function Campo({
  id,
  etichetta,
  etichettaNascosta = false,
  errore,
  ...resto
}: {
  readonly id: string;
  readonly etichetta: string;
  readonly etichettaNascosta?: boolean;
  readonly errore?: string | undefined;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={stili.campo}>
      <label htmlFor={id} className={etichettaNascosta ? "sr" : undefined}>
        {etichetta}
      </label>
      <input
        id={id}
        aria-invalid={errore !== undefined && errore !== ""}
        aria-describedby={errore === undefined || errore === "" ? undefined : `${id}-errore`}
        {...resto}
      />
      {errore !== undefined && errore !== "" && (
        <p id={`${id}-errore`} role="alert" className={stili.errore}>
          {errore}
        </p>
      )}
    </div>
  );
}

/** L'errore da solo, quando non appartiene a un campo preciso. */
export function Errore({ id, children }: { readonly id?: string; readonly children: string }) {
  return (
    <p id={id} role="alert" className={stili.errore}>
      {children}
    </p>
  );
}
