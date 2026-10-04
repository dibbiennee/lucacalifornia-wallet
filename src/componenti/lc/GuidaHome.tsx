"use client";

import { useEffect, useState } from "react";

import stili from "./GuidaHome.module.css";
import { FoglioInferiore } from "./FoglioInferiore";

/**
 * La guida per mettere il pannello nella schermata Home del telefono, così si apre con un tocco
 * come un'app. Compare da sola la prima volta che un PR entra (e solo se il pannello non è già
 * aperto dalla Home), poi resta un riquadro in cima alla pagina finché non dice "fatto".
 *
 * I passaggi cambiano con il telefono e col browser, quindi la guida riconosce dove si trova chi
 * la legge e parte dal caso giusto; chi vuole può guardare anche gli altri.
 */

type Telefono = "iphone" | "android";
type Browser = "safari" | "chrome" | "samsung" | "firefox";

interface Passo {
  readonly testo: string;
  /** Un disegnino per capire quale tasto: serve dove il tasto è solo un'icona. */
  readonly icona?: "condividi" | "puntini" | "righe";
}

const GUIDE: Readonly<Record<Telefono, Readonly<Record<string, { readonly nome: string; readonly passi: readonly Passo[] }>>>> = {
  iphone: {
    safari: {
      nome: "Safari",
      passi: [
        { testo: "Tocca il tasto Condividi, il quadrato con la freccia verso l'alto, nella barra in basso.", icona: "condividi" },
        { testo: "Scorri il menu verso l'alto e tocca «Aggiungi alla schermata Home»." },
        { testo: "Tocca «Aggiungi» in alto a destra. Fatto: trovi l'icona in Home." },
      ],
    },
    chrome: {
      nome: "Chrome",
      passi: [
        { testo: "Tocca il tasto Condividi, in alto a destra accanto all'indirizzo.", icona: "condividi" },
        { testo: "Scorri il menu e tocca «Aggiungi alla schermata Home»." },
        { testo: "Tocca «Aggiungi». Fatto: trovi l'icona in Home." },
      ],
    },
  },
  android: {
    chrome: {
      nome: "Chrome",
      passi: [
        { testo: "Tocca i tre puntini in alto a destra.", icona: "puntini" },
        { testo: "Tocca «Aggiungi a schermata Home» (su alcuni telefoni si chiama «Installa app»)." },
        { testo: "Conferma con «Aggiungi» o «Installa». Fatto: trovi l'icona in Home." },
      ],
    },
    samsung: {
      nome: "Samsung Internet",
      passi: [
        { testo: "Tocca le tre righe in basso a destra.", icona: "righe" },
        { testo: "Tocca «Aggiungi pagina a» e scegli «Schermata Home»." },
        { testo: "Conferma con «Aggiungi». Fatto: trovi l'icona in Home." },
      ],
    },
    firefox: {
      nome: "Firefox",
      passi: [
        { testo: "Tocca i tre puntini, in alto a destra o in basso.", icona: "puntini" },
        { testo: "Tocca «Installa»." },
        { testo: "Conferma. Fatto: trovi l'icona in Home." },
      ],
    },
  },
};

const ORDINE: Readonly<Record<Telefono, readonly string[]>> = {
  iphone: ["safari", "chrome"],
  android: ["chrome", "samsung", "firefox"],
};

const VISTA = "lc-guida-home-vista";
const FATTA = "lc-guida-home-fatta";

function leggi(chiave: string): boolean {
  try {
    return window.localStorage.getItem(chiave) === "1";
  } catch {
    return false;
  }
}

function scrivi(chiave: string): void {
  try {
    window.localStorage.setItem(chiave, "1");
  } catch {
    /* senza memoria del browser la guida ricompare a ogni visita: meglio di niente */
  }
}

/** Dove si trova chi legge: telefono e browser, dall'agente utente. Null se non è un telefono. */
function riconosci(): { readonly telefono: Telefono; readonly browser: Browser } | null {
  const ua = window.navigator.userAgent;
  const iPadOs = /Macintosh/.test(ua) && window.navigator.maxTouchPoints > 1;

  if (/iPhone|iPad|iPod/.test(ua) || iPadOs) {
    return { telefono: "iphone", browser: /CriOS/.test(ua) ? "chrome" : "safari" };
  }

  if (/Android/.test(ua)) {
    return { telefono: "android", browser: /SamsungBrowser/.test(ua) ? "samsung" : /Firefox/.test(ua) ? "firefox" : "chrome" };
  }

  return null;
}

/** Già aperto dalla Home: niente da spiegare. */
function giaNellaHome(): boolean {
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const iosHome = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone || iosHome;
}

function Icona({ tipo }: { readonly tipo: NonNullable<Passo["icona"]> }) {
  return (
    <svg className={stili.icona} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      {tipo === "condividi" && (
        <>
          <path d="M12 3v12" />
          <path d="M8 7l4-4 4 4" />
          <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
        </>
      )}
      {tipo === "puntini" && (
        <>
          <circle cx="12" cy="5" r="1.4" fill="currentColor" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" />
          <circle cx="12" cy="19" r="1.4" fill="currentColor" />
        </>
      )}
      {tipo === "righe" && (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function GuidaHome() {
  const [pronta, setPronta] = useState(false);
  const [aperta, setAperta] = useState(false);
  const [telefono, setTelefono] = useState<Telefono>("iphone");
  const [browser, setBrowser] = useState<string>("safari");
  const [daMostrare, setDaMostrare] = useState(false);

  useEffect(() => {
    if (giaNellaHome() || leggi(FATTA)) {
      return;
    }

    const dove = riconosci();

    // Da computer non serve: il pannello si usa dal telefono, e il riquadro non c'entra.
    if (dove === null) {
      return;
    }

    setTelefono(dove.telefono);
    setBrowser(dove.browser);
    setDaMostrare(true);
    setPronta(true);

    // La prima volta si apre da sola, una volta sola per telefono: poi resta il riquadro.
    if (!leggi(VISTA)) {
      scrivi(VISTA);
      setAperta(true);
    }
  }, []);

  function fatto() {
    scrivi(FATTA);
    setDaMostrare(false);
    setAperta(false);
  }

  function cambiaTelefono(t: Telefono) {
    setTelefono(t);
    setBrowser(ORDINE[t][0] ?? "safari");
  }

  if (!pronta || !daMostrare) {
    return null;
  }

  const guida = GUIDE[telefono][browser] ?? GUIDE[telefono][ORDINE[telefono][0] ?? ""];

  return (
    <>
      <div className={stili.riquadro}>
        <span className={stili.riquadroTesto}>
          <strong>Aggiungi il pannello alla Home</strong>
          <span>Lo apri con un tocco, come un&apos;app.</span>
        </span>
        <button type="button" className={`lc-press ${stili.riquadroTasto}`} onClick={() => setAperta(true)}>
          Come si fa
        </button>
      </div>

      <FoglioInferiore aperto={aperta} chiudi={() => setAperta(false)} titolo="Aggiungi il pannello alla Home" focusIniziale="finestra">
        <div className={stili.guida}>
          <div className={stili.testa}>
            <h2 className={stili.titolo}>Aggiungi alla Home</h2>
            <p className={stili.testo}>Così il pannello si apre con un tocco dalla schermata Home, a tutto schermo, come un&apos;app.</p>
          </div>

          <div className={stili.scelta} role="group" aria-label="Il tuo telefono">
            {(["iphone", "android"] as const).map((t) => (
              <button key={t} type="button" aria-pressed={telefono === t} className={`lc-press ${stili.pillola}`} onClick={() => cambiaTelefono(t)}>
                {t === "iphone" ? "iPhone" : "Android"}
              </button>
            ))}
          </div>

          <div className={stili.scelta} role="group" aria-label="Il tuo browser">
            {ORDINE[telefono].map((b) => (
              <button key={b} type="button" aria-pressed={browser === b} className={`lc-press ${stili.pillola}`} onClick={() => setBrowser(b)}>
                {GUIDE[telefono][b]?.nome ?? b}
              </button>
            ))}
          </div>

          {guida !== undefined && (
            <ol className={stili.passi}>
              {guida.passi.map((p, i) => (
                <li key={p.testo}>
                  <span className={stili.numero} aria-hidden>
                    {i + 1}
                  </span>
                  <span className={stili.passoTesto}>{p.testo}</span>
                  {p.icona !== undefined && <Icona tipo={p.icona} />}
                </li>
              ))}
            </ol>
          )}

          <p className={stili.nota}>
            Se il link si è aperto dentro WhatsApp, prima aprilo con {telefono === "iphone" ? "Safari" : "Chrome"}: tocca i tre puntini o il tasto Condividi e scegli «Apri nel browser».
          </p>

          <div className={stili.azioni}>
            <button type="button" className={`lc-press ${stili.primario}`} onClick={fatto}>
              Fatto, l&apos;ho aggiunto
            </button>
            <button type="button" className={`lc-press ${stili.secondario}`} onClick={() => setAperta(false)}>
              Non ora
            </button>
          </div>
        </div>
      </FoglioInferiore>
    </>
  );
}
