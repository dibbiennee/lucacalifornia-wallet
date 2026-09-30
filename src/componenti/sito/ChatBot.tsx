"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { legaParole } from "@/lib/tipografia";

import stili from "./ChatBot.module.css";

interface Domanda {
  readonly id: string;
  readonly domanda: string;
  readonly risposta: string;
}

/**
 * Le risposte sono ferme, scritte a mano: un punto di partenza da addestrare
 * più avanti, non ancora un'intelligenza vera. Finché restano queste, devono
 * bastare da sole a rispondere alle domande più comuni.
 */
const DOMANDE: readonly Domanda[] = [
  {
    id: "come-funziona",
    domanda: "Come funziona?",
    risposta:
      "Scegli lista o tavolo dal modulo, Luca ti conferma su WhatsApp con disponibilità e prezzo, e il biglietto ti arriva nel telefono.",
  },
  {
    id: "dove",
    domanda: "Dove siete?",
    risposta: "Siamo al Room 26, in Piazza Guglielmo Marconi 31 a Roma, all'EUR.",
  },
  {
    id: "navetta",
    domanda: "C'è la navetta?",
    risposta: "Sì: ti viene a prendere dalla tua zona e ti riporta a fine serata. La trovi nella pagina Navetta.",
  },
  {
    id: "prezzo",
    domanda: "Quanto costa entrare?",
    risposta: "Dipende dalla serata e da cosa scegli: te lo dice Luca su WhatsApp appena confermi la richiesta.",
  },
  {
    id: "tavolo",
    domanda: "Come prenoto un tavolo?",
    risposta: "Vai al modulo, scegli «Tavolo» e la serata: Luca ti ricontatta con disponibilità e prezzo.",
  },
];

interface Messaggio {
  readonly da: "bot" | "io";
  readonly testo: string;
}

/**
 * Il cerchietto in basso a destra: si apre in un pannello con domande già
 * pronte, per chi non vuole scrivere di suo pugno alle undici di sera.
 *
 * Sparisce sul modulo, come la barra in basso: sei già arrivato, e coprirebbe
 * proprio il pulsante che manda la richiesta.
 */
export function ChatBot() {
  const percorso = usePathname();
  const [aperto, setAperto] = useState(false);
  const [chieste, setChieste] = useState<readonly string[]>([]);
  const [messaggi, setMessaggi] = useState<readonly Messaggio[]>([
    {
      da: "bot",
      testo: "Ciao, sono l'assistente di Luca California. Scegli una domanda qui sotto.",
    },
  ]);
  const corpoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const corpo = corpoRef.current;
    if (corpo !== null) {
      corpo.scrollTo({ top: corpo.scrollHeight, behavior: "smooth" });
    }
  }, [messaggi]);

  useEffect(() => {
    if (!aperto) {
      return;
    }

    function suEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAperto(false);
      }
    }

    document.addEventListener("keydown", suEsc);
    return () => document.removeEventListener("keydown", suEsc);
  }, [aperto]);

  if (percorso === "/prenota") {
    return null;
  }

  function chiedi(d: Domanda) {
    setMessaggi((m) => [...m, { da: "io", testo: d.domanda }, { da: "bot", testo: d.risposta }]);
    setChieste((c) => (c.includes(d.id) ? c : [...c, d.id]));
  }

  const restanti = DOMANDE.filter((d) => !chieste.includes(d.id));

  return (
    <>
      <div
        className={`${stili.pannello} ${aperto ? stili.aperto : ""}`}
        role="dialog"
        aria-label="Assistente Luca California"
        aria-hidden={!aperto}
      >
        <div className={stili.testa}>
          <div>
            <strong>Assistente Luca California</strong>
            <span>Risposte rapide, o scrivi a Luca su WhatsApp</span>
          </div>
          <button type="button" className={stili.chiudi} onClick={() => setAperto(false)} aria-label="Chiudi">
            <IconaChiudi />
          </button>
        </div>

        <div className={stili.corpo} ref={corpoRef}>
          {messaggi.map((m, i) => (
            <p key={i} className={`${stili.bolla} ${m.da === "io" ? stili.io : stili.bot}`}>
              {legaParole(m.testo, { vedova: true })}
            </p>
          ))}
        </div>

        {restanti.length > 0 && (
          <div className={stili.domande}>
            {restanti.map((d) => (
              <button key={d.id} type="button" className={stili.domanda} onClick={() => chiedi(d)}>
                {d.domanda}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className={stili.fab}
        onClick={() => setAperto((a) => !a)}
        aria-expanded={aperto}
        aria-label={aperto ? "Chiudi la chat" : "Hai domande? Aprimi"}
      >
        {aperto ? <IconaChiudi /> : <IconaChat />}
      </button>
    </>
  );
}

function IconaChat() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-4.5 4v-4H5a2.5 2.5 0 0 1-2-1V5.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconaChiudi() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
