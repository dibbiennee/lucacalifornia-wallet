"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { IconaSpunta } from "./Icone";
import stili from "./Toast.module.css";

/**
 * L'avviso che compare in alto e se ne va da solo dopo due secondi e mezzo.
 *
 * Uno alla volta: un secondo avviso sostituisce il primo e riparte il conto.
 * Sta in un contesto perché lo chiamano schermate lontane fra loro (il menu,
 * la conferma di una richiesta, la copia di un link) e deve comparire sempre
 * nello stesso punto.
 */

const DURATA_MS = 2600;

const Contesto = createContext<(testo: string) => void>(() => undefined);

export function useToast(): (testo: string) => void {
  return useContext(Contesto);
}

export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [testo, setTesto] = useState<string | null>(null);
  const [giro, setGiro] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const mostra = useCallback((nuovo: string) => {
    window.clearTimeout(timer.current);
    setTesto(nuovo);
    // La chiave cambia a ogni avviso: l'animazione riparte anche se il testo è lo stesso.
    setGiro((g) => g + 1);
    timer.current = window.setTimeout(() => setTesto(null), DURATA_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <Contesto.Provider value={mostra}>
      {children}
      {/* Il contenitore c'è sempre: un'area "status" che compare di colpo non viene letta da tutti i lettori di schermo. */}
      <div role="status" aria-live="polite" className={stili.area}>
        {testo !== null && (
          <div key={giro} className={stili.toast}>
            <span className={stili.spunta}>
              <IconaSpunta misura={14} tratto={3} />
            </span>
            {testo}
          </div>
        )}
      </div>
    </Contesto.Provider>
  );
}
