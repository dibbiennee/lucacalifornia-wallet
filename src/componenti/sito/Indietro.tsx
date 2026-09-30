"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Gallone } from "./Icone";
import stili from "./Pagina.module.css";

/**
 * Il ritorno indietro, in cima a ogni pagina interna.
 *
 * Chi arriva da un tasto in home (o in qualunque altra pagina) si aspetta di
 * tornare esattamente lì, scorrimento compreso: con la cronologia del
 * browser è così. "document.referrer" non serve a distinguerlo: Next.js
 * cambia pagina senza un vero caricamento, quindi resta quello di quando si
 * è aperta la scheda la primissima volta, mai quello della pagina precedente.
 * La lunghezza della cronologia è il segnale giusto: sopra 1 c'è una pagina
 * prima a cui tornare; a 1 (link diretto, scheda nuova) l'unica via sensata
 * resta il link fisso passato da chi usa questo componente.
 */
export function Indietro({ testo, dove }: { readonly testo: string; readonly dove: string }) {
  const router = useRouter();
  const [daQui, setDaQui] = useState(false);

  useEffect(() => {
    setDaQui(window.history.length > 1);
  }, []);

  if (daQui) {
    return (
      <div className={`wrap ${stili.cima}`}>
        <button
          type="button"
          onClick={() => router.back()}
          className="indietro"
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
        >
          <Gallone />
          Indietro
        </button>
      </div>
    );
  }

  return (
    <div className={`wrap ${stili.cima}`}>
      <Link href={dove} className="indietro">
        <Gallone />
        {testo}
      </Link>
    </div>
  );
}
