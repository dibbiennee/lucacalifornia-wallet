"use client";

import jsQR from "jsqr";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * La porta.
 *
 * Pensata per essere usata al buio, con una mano, da qualcuno che ha gente
 * che spinge alle spalle: fondo nero, esito a tutto schermo, e un tocco
 * qualsiasi per passare al prossimo. Nessun bottone piccolo.
 *
 * iOS non ha BarcodeDetector, quindi il QR si legge dai fotogrammi con jsqr:
 * senza, sull'iPhone non funzionerebbe niente.
 */

interface Esito {
  readonly valido: boolean;
  readonly nome?: string;
  readonly tipo?: string;
  readonly serata?: string;
  readonly sala?: string;
  readonly locale?: string;
}

type Stato = "spenta" | "cerco" | "esito" | "errore";

/** Il fotogramma si analizza in piccolo: più veloce, e il QR si legge lo stesso. */
const LATO_ANALISI = 520;

export default function Porta() {
  const video = useRef<HTMLVideoElement | null>(null);
  const tela = useRef<HTMLCanvasElement | null>(null);
  const flusso = useRef<MediaStream | null>(null);
  const attivo = useRef(false);

  const [stato, setStato] = useState<Stato>("spenta");
  const [esito, setEsito] = useState<Esito | null>(null);
  const [errore, setErrore] = useState("");

  const verifica = useCallback(async (token: string) => {
    try {
      const risposta = await fetch("/api/verifica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setEsito((await risposta.json()) as Esito);
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
      setErrore("Non riesco ad accendere la fotocamera. Serve un indirizzo https e il permesso del telefono.");
      setStato("errore");
    }
  }, [cerca]);

  const prossimo = useCallback(() => {
    if (stato !== "esito") {
      return;
    }

    setEsito(null);
    setStato("cerco");
    attivo.current = true;
    requestAnimationFrame(cerca);
  }, [cerca, stato]);

  useEffect(() => {
    return () => {
      attivo.current = false;
      flusso.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const fondo = stato === "esito" ? (esito?.valido === true ? "#0B7A2F" : "#8E0B2B") : "#000";

  return (
    <main
      onClick={prossimo}
      style={{
        position: "fixed",
        inset: 0,
        background: fondo,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem calc(2rem + env(safe-area-inset-bottom))",
        textAlign: "center",
        transition: "background 120ms linear",
      }}
    >
      <video ref={video} playsInline muted style={{ display: "none" }} />
      <canvas ref={tela} style={{ display: "none" }} />

      {stato === "spenta" && (
        <>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.22em", color: "#8f8fb5", margin: "0 0 1.5rem" }}>
            INGRESSO
          </p>
          <button
            onClick={() => void accendi()}
            style={{
              minHeight: "4.5rem",
              padding: "0 2.5rem",
              borderRadius: "999px",
              border: "none",
              background: "#fff",
              color: "#000",
              fontSize: "1.375rem",
              fontWeight: 700,
              fontFamily: "inherit",
            }}
          >
            Accendi la fotocamera
          </button>
        </>
      )}

      {stato === "errore" && (
        <p style={{ fontSize: "1.25rem", lineHeight: 1.5, maxWidth: "22rem" }}>{errore}</p>
      )}

      {stato === "cerco" && (
        <>
          <div
            style={{
              width: "min(62vw, 15rem)",
              aspectRatio: "1",
              border: "3px solid rgba(255,255,255,0.5)",
              borderRadius: "1.5rem",
              marginBottom: "2rem",
            }}
          />
          <p style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>Inquadra il QR</p>
        </>
      )}

      {stato === "esito" && esito !== null && (
        <>
          <p style={{ fontSize: "clamp(3rem, 18vw, 5.5rem)", fontWeight: 800, margin: "0 0 1rem", lineHeight: 1 }}>
            {esito.valido ? "ENTRA" : "NO"}
          </p>

          {esito.valido ? (
            <>
              <p style={{ fontSize: "clamp(1.75rem, 8vw, 2.75rem)", fontWeight: 700, margin: "0 0 0.75rem", lineHeight: 1.1 }}>
                {esito.nome}
              </p>
              <p style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>{esito.tipo}</p>
              {esito.sala !== undefined && (
                <p style={{ fontSize: "1.25rem", margin: "0.5rem 0 0", opacity: 0.85 }}>{esito.sala}</p>
              )}
              <p style={{ fontSize: "1.125rem", margin: "0.75rem 0 0", opacity: 0.75 }}>{esito.serata}</p>
            </>
          ) : (
            <p style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0, maxWidth: "20rem" }}>
              Biglietto non valido
            </p>
          )}

          <p style={{ position: "absolute", bottom: "calc(2rem + env(safe-area-inset-bottom))", fontSize: "1.125rem", opacity: 0.8, margin: 0 }}>
            Tocca per il prossimo
          </p>
        </>
      )}
    </main>
  );
}
