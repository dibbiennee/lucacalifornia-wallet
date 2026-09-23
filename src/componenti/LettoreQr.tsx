"use client";

import jsQR from "jsqr";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { Esito, type DatiEsito } from "@/componenti/pannello/Esito";
import { Pulsante } from "@/componenti/pannello/Pulsante";

import stili from "./LettoreQr.module.css";
import { Testo } from "@/componenti/pannello/Messaggi";

/**
 * Il lettore del QR all'ingresso.
 *
 * Lo usano due pagine: la porta dentro il pannello e /staff/scan, che resta
 * per provarlo senza password. Stessa identica logica, scritta una volta.
 *
 * Pensata per essere usata al buio, con una mano, da qualcuno che ha gente
 * che spinge alle spalle: fondo nero, esito a tutto schermo, e un tocco
 * qualsiasi per passare al prossimo. Nessun pulsante piccolo.
 *
 * iOS non ha BarcodeDetector, quindi il QR si legge dai fotogrammi con jsqr:
 * senza, sull'iPhone non funzionerebbe niente.
 *
 * Il riquadro sta dentro la pagina e non più sopra tutto: da fisso che era,
 * finiva sotto la sezione che gli sta sotto e non si riusciva nemmeno ad
 * accendere la fotocamera.
 */

type Stato = "spenta" | "cerco" | "esito" | "errore";

/** Il fotogramma si analizza in piccolo: più veloce, e il QR si legge lo stesso. */
const LATO_ANALISI = 520;

export function LettoreQr({ intestazione }: { readonly intestazione?: ReactNode }) {
  const video = useRef<HTMLVideoElement | null>(null);
  const tela = useRef<HTMLCanvasElement | null>(null);
  const flusso = useRef<MediaStream | null>(null);
  const attivo = useRef(false);

  const [stato, setStato] = useState<Stato>("spenta");
  const [esito, setEsito] = useState<DatiEsito | null>(null);
  const [errore, setErrore] = useState("");

  const verifica = useCallback(async (token: string) => {
    try {
      const risposta = await fetch("/api/verifica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setEsito((await risposta.json()) as DatiEsito);
    } catch {
      setEsito({ valido: false });
    }
    setStato("esito");
  }, []);

  const cerca = useCallback(() => {
    if (!attivo.current) {
      return;
    }

    const v = video.current;
    const t = tela.current;
    const contesto = t?.getContext("2d", { willReadFrequently: true });

    if (v === null || t === null || contesto == null || v.readyState < 2) {
      requestAnimationFrame(cerca);
      return;
    }

    const scala = LATO_ANALISI / Math.max(v.videoWidth, v.videoHeight, 1);
    t.width = Math.round(v.videoWidth * scala);
    t.height = Math.round(v.videoHeight * scala);
    contesto.drawImage(v, 0, 0, t.width, t.height);

    const immagine = contesto.getImageData(0, 0, t.width, t.height);
    const letto = jsQR(immagine.data, immagine.width, immagine.height, {
      inversionAttempts: "dontInvert",
    });

    if (letto !== null && letto.data !== "") {
      attivo.current = false;
      void verifica(letto.data);
      return;
    }

    requestAnimationFrame(cerca);
  }, [verifica]);

  const accendi = useCallback(async () => {
    setErrore("");

    try {
      const f = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      flusso.current = f;

      if (video.current !== null) {
        video.current.srcObject = f;
        await video.current.play();
      }

      setEsito(null);
      setStato("cerco");
      attivo.current = true;
      requestAnimationFrame(cerca);
    } catch {
      setErrore(
        "Non riesco ad accendere la fotocamera. Serve un indirizzo https e il permesso del telefono.",
      );
      setStato("errore");
    }
  }, [cerca]);

  const prossimo = useCallback(() => {
    setEsito(null);
    setStato("cerco");
    attivo.current = true;
    requestAnimationFrame(cerca);
  }, [cerca]);

  useEffect(() => {
    return () => {
      attivo.current = false;
      flusso.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <>
      <div className={stili.lettore}>
        <video ref={video} playsInline muted style={{ display: "none" }} />
        <canvas ref={tela} style={{ display: "none" }} />

        {stato === "spenta" && (
          <>
            <p className={stili.occhiello}>Ingresso</p>
            <Pulsante aspetto="pillola" onClick={() => void accendi()}>
              Accendi la fotocamera
            </Pulsante>
          </>
        )}

        {stato === "errore" && (
          <>
            <Testo>{errore}</Testo>
            <Pulsante aspetto="pillola" onClick={() => void accendi()}>
              Riprova
            </Pulsante>
          </>
        )}

        {(stato === "cerco" || stato === "esito") && (
          <>
            {intestazione}
            <div className={stili.mira} />
            <p className={stili.inquadra}>Inquadra il QR</p>
          </>
        )}
      </div>

      {stato === "esito" && esito !== null && <Esito esito={esito} avanti={prossimo} />}
    </>
  );
}
