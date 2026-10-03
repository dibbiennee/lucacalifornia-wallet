"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";

import { linkMappaLocale, linkWhatsapp } from "@/contenuti/sito";
import { capisci, MENU, risposta, type Azione, type Destinazione, type Risposta } from "@/lib/assistente";
import { legaParole } from "@/lib/tipografia";

import { useBarraFissa } from "./useBarraFissa";
import stili from "./ChatBot.module.css";

interface Messaggio {
  readonly da: "bot" | "io";
  readonly testo: string;
}

/** La conversazione non cresce all'infinito: restano le ultime bolle, e "Menu" ricomincia da capo. */
const BOLLE_MASSIME = 8;

/**
 * Il cerchietto in basso a destra: si apre in un pannello che aiuta a
 * arrivare alla pagina o all'azione giusta, non a chiacchierare.
 *
 * Le risposte stanno in src/lib/assistente.ts, scritte a mano: qui c'è solo
 * come si vedono. Si può toccare un pulsante o scrivere una frase; quello che
 * non si capisce, o non è un dato confermato, manda a WhatsApp.
 *
 * Sta su ogni pagina, modulo compreso: è lì che servono i dubbi. Sul modulo
 * lascia spazio in fondo (vedi Modulo.module.css) per non coprire "Invia".
 */
export function ChatBot() {
  const barraFissa = useBarraFissa();
  const [aperto, setAperto] = useState(false);
  const [corrente, setCorrente] = useState<{ readonly id: Destinazione["id"]; readonly risposta: Risposta }>(() => ({
    id: "menu",
    risposta: risposta(MENU),
  }));
  const [messaggi, setMessaggi] = useState<readonly Messaggio[]>(() => [{ da: "bot", testo: risposta(MENU).testo }]);
  const [scritto, setScritto] = useState("");
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

  /** Va a una risposta. "eco" è quello che ha toccato o scritto la persona. */
  function vai(dove: Destinazione, eco?: string) {
    const r = risposta(dove);
    setCorrente({ id: dove.id, risposta: r });

    if (dove.id === "menu") {
      setMessaggi([{ da: "bot", testo: r.testo }]);
      return;
    }

    setMessaggi((m) =>
      [...m, ...(eco === undefined ? [] : [{ da: "io" as const, testo: eco }]), { da: "bot" as const, testo: r.testo }].slice(-BOLLE_MASSIME),
    );
  }

  function invia(evento: FormEvent) {
    evento.preventDefault();
    const frase = scritto.trim();
    if (frase === "") {
      return;
    }
    setScritto("");
    vai(capisci(frase), frase);
  }

  function pulsante(a: Azione, chiave: string) {
    switch (a.tipo) {
      case "vai":
        return (
          <button key={chiave} type="button" className={stili.domanda} onClick={() => vai(a.dove, a.etichetta)}>
            {a.etichetta}
          </button>
        );
      case "pagina":
        return (
          <Link key={chiave} href={a.href} className={`${stili.domanda} ${stili.cta}`} onClick={() => setAperto(false)}>
            {a.etichetta}
          </Link>
        );
      case "whatsapp":
        return (
          <a
            key={chiave}
            href={linkWhatsapp(a.messaggio)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${stili.domanda} ${stili.cta}`}
          >
            {a.etichetta}
          </a>
        );
      case "mappa":
        return (
          <a key={chiave} href={linkMappaLocale()} target="_blank" rel="noopener noreferrer" className={`${stili.domanda} ${stili.cta}`}>
            {a.etichetta}
          </a>
        );
    }
  }

  return (
    <>
      <div
        className={`${stili.pannello} ${aperto ? stili.aperto : ""} ${barraFissa ? stili.sollevato : ""}`}
        role="dialog"
        aria-label="Assistente Luca California"
        aria-hidden={!aperto}
        inert={!aperto}
      >
        <div className={stili.testa}>
          <div>
            <strong>Assistente Luca California</strong>
            <span>Ti porto alla pagina giusta, o scrivimi su WhatsApp</span>
          </div>
          <button type="button" className={stili.chiudi} onClick={() => setAperto(false)} aria-label="Chiudi">
            <IconaChiudi />
          </button>
        </div>

        <div className={stili.corpo} ref={corpoRef} role="log" aria-live="polite" aria-label="Conversazione">
          {messaggi.map((m, i) => (
            <p key={i} className={`${stili.bolla} ${m.da === "io" ? stili.io : stili.bot}`}>
              {legaParole(m.testo, { vedova: true })}
            </p>
          ))}
        </div>

        <div className={stili.domande}>
          {corrente.risposta.azioni.map((a, i) => pulsante(a, `${corrente.id}-${i}`))}
          {corrente.id !== "menu" && (
            <button type="button" className={`${stili.domanda} ${stili.menu}`} onClick={() => vai(MENU)}>
              ‹ Menu
            </button>
          )}
        </div>

        <form className={stili.scrivi} onSubmit={invia}>
          <input
            type="text"
            value={scritto}
            onChange={(e) => setScritto(e.target.value)}
            placeholder="Oppure scrivi qui"
            aria-label="Scrivi una domanda"
            maxLength={120}
            enterKeyHint="send"
            autoComplete="off"
          />
          <button type="submit" aria-label="Invia" disabled={scritto.trim() === ""}>
            <IconaInvia />
          </button>
        </form>
      </div>

      <button
        type="button"
        className={`${stili.fab} ${barraFissa ? stili.sollevato : ""}`}
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

function IconaInvia() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M4 12l16-8-6 16-3-7-7-1z" fill="currentColor" />
    </svg>
  );
}
