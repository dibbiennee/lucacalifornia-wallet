"use client";

import { useEffect } from "react";

import { segnaEvento } from "./traffico-client";

/**
 * Segna la visita: una volta per pagina caricata, e il server la conta una sola
 * volta per sessione. Non disegna niente. Nel sito sta nel layout; nella pagina
 * di un PR porta il codice del link.
 */
export function Tracciamento({ pr }: { readonly pr?: string }) {
  useEffect(() => {
    segnaEvento("visita", pr);
  }, [pr]);

  return null;
}
