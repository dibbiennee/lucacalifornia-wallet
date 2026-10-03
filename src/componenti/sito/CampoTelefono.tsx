"use client";

import { bandiera, daNumeroInternazionale, PAESI, trovaPaese } from "@/contenuti/prefissi";

import stili from "./CampoTelefono.module.css";

/**
 * Il campo del telefono, con il prefisso internazionale a fianco.
 *
 * Il prefisso è un menu vero (quello del telefono, già pensato per scorrere con
 * un dito): da fuori Italia si sceglie il paese e si scrive il numero senza
 * prefisso. Chi incolla un numero già internazionale ("+44 7911 123456") lo vede
 * spezzarsi da solo in paese e numero.
 *
 * Il valore che esce verso il modulo sono le due cose separate: paese (codice ISO)
 * e numero come scritto. Le mette insieme `telefonoCompleto` in lib/telefono.ts.
 */
export function CampoTelefono({
  id,
  etichetta = "Telefono",
  iso,
  numero,
  cambia,
  errore,
  bordo = "forte",
  segnaposto = "333 123 4567",
}: {
  readonly id: string;
  readonly etichetta?: string;
  /** Il paese scelto, come codice ISO: "IT". */
  readonly iso: string;
  readonly numero: string;
  readonly cambia: (valore: { readonly iso: string; readonly numero: string }) => void;
  readonly errore?: string | undefined;
  /** "forte" è il contorno nero della pagina; "lieve" quello più chiaro dei fogli a comparsa. */
  readonly bordo?: "forte" | "lieve";
  readonly segnaposto?: string;
}) {
  const paese = trovaPaese(iso);
  const idErrore = `${id}-errore`;

  function scritto(testo: string) {
    // Incollato già internazionale: si divide in paese e numero.
    const spezzato = daNumeroInternazionale(testo);

    if (spezzato !== null) {
      cambia(spezzato);
      return;
    }

    cambia({ iso, numero: testo });
  }

  return (
    <div className={`${stili.campo} ${bordo === "lieve" ? stili.lieve : ""}`}>
      <label htmlFor={id}>{etichetta}</label>

      <div className={stili.riga}>
        {/* Il menu nativo sta sopra, trasparente: si vede il paese in breve, si apre l'elenco vero. */}
        <div className={stili.prefisso} data-errore={errore !== undefined ? "" : undefined}>
          <span aria-hidden className={stili.vista}>
            <span className={stili.bandiera}>{bandiera(paese.iso)}</span>
            <span>+{paese.prefisso}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden focusable="false">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </span>
          <select
            aria-label="Prefisso internazionale"
            value={paese.iso}
            onChange={(e) => cambia({ iso: e.target.value, numero })}
            className={stili.menu}
          >
            {PAESI.map((p) => (
              <option key={p.iso} value={p.iso}>
                {bandiera(p.iso)} {p.nome} (+{p.prefisso})
              </option>
            ))}
          </select>
        </div>

        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={numero}
          onChange={(e) => scritto(e.target.value)}
          maxLength={30}
          placeholder={segnaposto}
          aria-invalid={errore !== undefined}
          aria-describedby={errore === undefined ? undefined : idErrore}
        />
      </div>

      {errore !== undefined && (
        <p id={idErrore} role="alert" className={stili.errore}>
          {errore}
        </p>
      )}
    </div>
  );
}
