"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cambiaStato } from "@/app/pannello/azioni";
import { notaStato, type VoceRichiesta } from "@/lib/pannello/vista";
import { legaParole } from "@/lib/tipografia";

import { ChipStato } from "./AreaRichieste";
import { BigliettoWallet } from "./BigliettoWallet";
import stili from "./Dettaglio.module.css";
import { FoglioInferiore } from "./FoglioInferiore";
import { IconaIndietro, IconaInvia, IconaMessaggio, IconaTelefono } from "./Icone";
import { useToast } from "./Toast";

/** Quello che serve a /api/conferma per preparare il biglietto: lo calcola la pagina, sul server. */
export interface DatiInvio {
  readonly nomeCliente: string;
  readonly telefono: string;
  readonly serata: string;
  readonly inizioSerata: string;
  readonly tipo: string;
  readonly locale: "room26" | "ninfeo";
  readonly sala?: string;
}

type Lavoro = "conferma" | "stato" | null;

/**
 * Una richiesta, con tutto quello che serve per rispondere.
 *
 * Il flusso è quello di prima, solo ridisegnato: "Conferma" prepara il
 * biglietto vero (/api/conferma) e segna la richiesta come confermata; poi si
 * apre WhatsApp col messaggio già scritto. WhatsApp non si apre da solo: il
 * browser blocca le finestre che non nascono da un tocco, e comunque ogni
 * messaggio al cliente parte da Luca, mai dal pannello.
 */
export function DettaglioRichiesta({
  voce,
  invio,
  indietro,
}: {
  readonly voce: VoceRichiesta;
  readonly invio: DatiInvio;
  /** Dove torna la freccia: l'elenco, con lo stesso filtro. */
  readonly indietro: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [lavoro, setLavoro] = useState<Lavoro>(null);
  const [errore, setErrore] = useState("");
  const [pronto, setPronto] = useState<{ whatsapp: string; biglietto: string } | null>(null);
  const [chiedoRifiuto, setChiedoRifiuto] = useState(false);

  const confermata = voce.stato === "confermata";
  const attesa = voce.stato === "in attesa";
  const primoNome = voce.nome.split(" ")[0] ?? voce.nome;
  const numero = voce.telefono.replace(/\D/g, "");
  const numeroWhatsapp = numero.startsWith("39") ? numero : `39${numero}`;

  async function conferma() {
    if (lavoro !== null) {
      return;
    }

    setErrore("");
    setLavoro("conferma");

    try {
      const risposta = await fetch("/api/conferma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invio),
      });

      if (!risposta.ok) {
        const d = (await risposta.json()) as { errore?: string };
        setErrore(d.errore ?? "Non ha funzionato");
        return;
      }

      const d = (await risposta.json()) as { linkWhatsapp: string; linkBiglietto: string };
      setPronto({ whatsapp: d.linkWhatsapp, biglietto: d.linkBiglietto });

      await cambiaStato(voce.id, "confermata");
      router.refresh();
      toast("Biglietto pronto");
    } catch {
      setErrore("Non sono riuscito a preparare il biglietto");
    } finally {
      setLavoro(null);
    }
  }

  async function segna(stato: "nuova" | "in attesa" | "rifiutata") {
    if (lavoro !== null) {
      return;
    }

    setChiedoRifiuto(false);
    setErrore("");
    setLavoro("stato");

    try {
      toast(await cambiaStato(voce.id, stato));
      router.refresh();
    } catch {
      setErrore("Non sono riuscito a cambiare lo stato");
    } finally {
      setLavoro(null);
    }
  }

  const occupato = lavoro !== null;

  function azioni(variante: "barra" | "scrivania") {
    return (
      <div className={variante === "barra" ? stili.barraAzioni : stili.azioniScrivania}>
        {errore !== "" && (
          <p role="alert" className={stili.errore}>
            {errore}
          </p>
        )}

        {variante === "barra" ? (
          <>
            {primario()}
            <div className={stili.duePulsanti}>{secondari()}</div>
          </>
        ) : (
          <div className={stili.rigaScrivania}>
            {secondari()}
            {primario()}
          </div>
        )}
      </div>
    );
  }

  function primario() {
    if (pronto !== null) {
      return (
        <a className={`lc-press ${stili.primario}`} href={pronto.whatsapp} target="_blank" rel="noopener noreferrer">
          <IconaMessaggio misura={18} />
          Apri WhatsApp col messaggio
        </a>
      );
    }

    return (
      <button type="button" className={`lc-press ${stili.primario}`} onClick={() => void conferma()} disabled={occupato}>
        {lavoro === "conferma" ? <span className={`lc-spin ${stili.rotella}`} aria-hidden /> : <IconaInvia misura={18} />}
        {lavoro === "conferma" ? "Preparo il biglietto…" : confermata ? "Rimanda il biglietto" : "Conferma e invia biglietto"}
      </button>
    );
  }

  function secondari() {
    return (
      <>
        {pronto !== null ? (
          <a className={`lc-press ${stili.secondario}`} href={pronto.biglietto} target="_blank" rel="noopener noreferrer">
            Guarda il biglietto
          </a>
        ) : (
          <button
            type="button"
            className={`lc-press ${stili.secondario}`}
            disabled={occupato}
            onClick={() => void segna(attesa ? "nuova" : "in attesa")}
          >
            {attesa ? "Segna come nuova" : "Metti in attesa"}
          </button>
        )}
        <button
          type="button"
          className={`lc-press ${stili.rifiuta}`}
          disabled={occupato || voce.stato === "rifiutata"}
          onClick={() => setChiedoRifiuto(true)}
        >
          Rifiuta
        </button>
      </>
    );
  }

  return (
    <article className={stili.dettaglio}>
      <header className={stili.barraTop}>
        <Link href={indietro} scroll={false} className={`lc-press ${stili.indietro}`}>
          <IconaIndietro />
          Richieste
        </Link>
        <ChipStato tono={voce.tono} testo={voce.statoEsteso} grande />
      </header>

      <div className={stili.corpo}>
        <div className={stili.intestazione}>
          <div className={stili.titoli}>
            <span className={`lc-up lc-eyebrow`}>Richiesta · {voce.arrivata}</span>
            <h2 className={`lc-up ${stili.nome}`} style={{ animationDelay: "50ms" }} tabIndex={-1}>
              {voce.nome}
            </h2>
            <span className={stili.chipScrivania}>
              <ChipStato tono={voce.tono} testo={voce.statoEsteso} grande />
            </span>
          </div>
          <div className={stili.azioniAlto}>
            {azioni("scrivania")}
          </div>
        </div>

        <div className={stili.griglia}>
          <div className={`lc-up ${stili.bigliettoCol}`} style={{ animationDelay: "100ms" }}>
            <BigliettoWallet
              id={voce.id}
              notte={voce.notte}
              giorno={voce.giorno}
              tipo={voce.tipo}
              locale={invio.locale === "ninfeo" ? "NINFEO" : "ROOM26"}
              timbro={pronto !== null}
            />
          </div>

          <div className={stili.sinistra}>
            <div className={`lc-up ${stili.fatti}`} style={{ animationDelay: "200ms" }}>
              <Fatto k="Serata" v={voce.giorno} s={voce.sala === undefined ? voce.notte : `${voce.notte} · ${voce.sala}`} />
              <Fatto k="Tipo" v={voce.tipo} s={voce.persone ?? "—"} />
              <Fatto
                k="Budget a testa"
                v={voce.budget ?? "—"}
                s={voce.budget !== undefined ? "a persona" : voce.tipoBase === "tavolo" ? "non indicato" : "solo per i tavoli"}
              />
              <Fatto
                k="Occasione"
                v={voce.occasione ?? "—"}
                s={voce.occasione !== undefined ? "" : voce.tipoBase === "tavolo" ? "non indicata" : "solo per i tavoli"}
              />
            </div>

            <div className={`lc-up ${stili.contatto}`} style={{ animationDelay: "150ms" }}>
              <div className={stili.contattoTesto}>
                <span className={stili.etichetta}>Contatto</span>
                <span className={stili.telefono}>{voce.telefono}</span>
              </div>
              <div className={stili.contattoAzioni}>
                <a href={`tel:${voce.telefono.replace(/[^\d+]/g, "")}`} className={stili.chiama} aria-label={`Chiama ${primoNome}`}>
                  <IconaTelefono misura={18} />
                </a>
                <a
                  href={`https://wa.me/${numeroWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={stili.whatsapp}
                  aria-label={`Scrivi a ${primoNome} su WhatsApp`}
                >
                  <IconaMessaggio misura={18} />
                  WhatsApp
                </a>
              </div>
            </div>

            {voce.messaggio !== undefined && (
              <div className={`lc-up ${stili.richiesta}`} style={{ animationDelay: "230ms" }}>
                <span className="lc-eyebrow">Altre richieste</span>
                <p>{legaParole(voce.messaggio, { vedova: true })}</p>
              </div>
            )}

            <p className={`lc-up ${stili.nota}`} style={{ animationDelay: "250ms" }}>
              {legaParole(notaStato(voce), { vedova: true })}
            </p>
          </div>
        </div>
      </div>

      <div className={stili.barraBasso}>
        {azioni("barra")}
      </div>

      <FoglioInferiore aperto={chiedoRifiuto} chiudi={() => setChiedoRifiuto(false)} titolo={`Rifiuti ${primoNome}?`}>
        <div className={stili.conferma}>
          <h2 className={stili.confermaTitolo}>Rifiuti {primoNome}?</h2>
          <p className={stili.confermaTesto}>
            {legaParole("La richiesta resta nell'elenco, segnata come rifiutata. Nessun messaggio parte da solo.", { vedova: true })}
          </p>
          <button type="button" className={`lc-press ${stili.confermaRifiuta}`} onClick={() => void segna("rifiutata")}>
            Rifiuta la richiesta
          </button>
          <button type="button" className={`lc-press ${stili.confermaAnnulla}`} onClick={() => setChiedoRifiuto(false)}>
            Annulla
          </button>
        </div>
      </FoglioInferiore>
    </article>
  );
}

function Fatto({ k, v, s }: { readonly k: string; readonly v: string; readonly s: string }) {
  return (
    <div className={stili.fatto}>
      <span className={stili.fattoK}>{k}</span>
      <span className={stili.fattoV}>{v}</span>
      <span className={stili.fattoS}>{s}</span>
    </div>
  );
}
