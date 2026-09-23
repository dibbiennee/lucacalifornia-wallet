"use client";

import { useState } from "react";

import { Avviso } from "./Avviso";
import { Pulsante } from "./Pulsante";
import stili from "./CopiaLink.module.css";

/**
 * Il link personale di un PR, col tasto per copiarlo.
 *
 * Copiare può non funzionare: senza https, in una scheda che non ha il
 * fuoco, o con i permessi negati. Prima in quel caso non succedeva niente e
 * il pulsante restava lì, muto. Adesso c'è una seconda strada, e se fallisce
 * anche quella lo dice, spiegando come fare a mano.
 */
export function CopiaLink({ link }: { readonly link: string }) {
  const [copiato, setCopiato] = useState(false);
  const [avviso, setAvviso] = useState("");

  const taglio = link.lastIndexOf("/");
  const dominio = link.slice(0, taglio);
  const slug = link.slice(taglio);
  const intero = `https://${link}`;

  async function copia() {
    if (await negliAppunti(intero)) {
      setCopiato(true);
      window.setTimeout(() => setCopiato(false), 2000);
      return;
    }

    setAvviso("Non riesco a copiare: tieni premuto il link per copiarlo a mano.");
  }

  return (
    <>
      <div className={stili.link}>
        <code>
          <span className={stili.dominio}>{dominio}</span>
          {slug}
        </code>
        <Pulsante aspetto="vuoto" piccolo onClick={() => void copia()}>
          {copiato ? "Copiato" : "Copia"}
        </Pulsante>
      </div>

      <Avviso testo={avviso} chiudi={() => setAvviso("")} />
    </>
  );
}

/** Prima la strada moderna, poi quella vecchia che funziona anche senza https. */
async function negliAppunti(testo: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(testo);
    return true;
  } catch {
    // Si continua sotto.
  }

  try {
    const area = document.createElement("textarea");
    area.value = testo;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const fatto = document.execCommand("copy");
    document.body.removeChild(area);
    return fatto;
  } catch {
    return false;
  }
}
