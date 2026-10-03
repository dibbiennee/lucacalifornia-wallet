"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cambiaStato } from "@/app/pannello/azioni";
import { linkWhatsapp, messaggioRifiuto } from "@/lib/pannello/messaggi";
import { MOTIVI_RIFIUTO, type CodiceMotivo } from "@/lib/pannello/motivi";
import { giornoLungo, notaStato, type VoceRichiesta } from "@/lib/pannello/vista";
import { legaParole } from "@/lib/tipografia";

import { ChipStato } from "./AreaRichieste";
import { BigliettoWallet } from "./BigliettoWallet";
import stili from "./Dettaglio.module.css";
import { FoglioInferiore } from "./FoglioInferiore";
import { IconaIndietro, IconaInvia, IconaMessaggio, IconaTelefono } from "./Icone";
import { useToast } from "./Toast";

type Lavoro = "conferma" | "stato" | null;

/**
 * Una richiesta. Per Luca, con tutto quello che serve per decidere; per un PR,
 * in sola lettura e senza il telefono.
 *
 * Luca (comeLuca):
 *   in attesa  -> "Conferma e prepara il biglietto" oppure "Rifiuta" (con un motivo);
 *   confermata -> "Invia conferma su WhatsApp", e "Cambia decisione";
 *   rifiutata  -> "Conferma e prepara il biglietto", e "Cambia decisione".
 * Telefonare non cambia lo stato: è solo un link. Lo stato lo sceglie sempre lui.
 *
 * "Conferma" chiama /api/conferma mandando solo l'id della richiesta: il
 * server la porta a confermata e prepara il biglietto, partendo dai dati del
 * database. Se il biglietto non si genera la prenotazione resta confermata e
 * il pulsante diventa "Riprova". Poi si apre WhatsApp col messaggio già scritto.
 * WhatsApp non si apre da solo: il browser blocca le finestre che non nascono
 * da un tocco, e comunque ogni messaggio al cliente parte da Luca, mai dal
 * pannello.
 *
 * Il PR (comeLuca = false) non ha pulsanti, non ha il contatto e non ha il
 * biglietto: la voce che gli arriva non porta nemmeno il telefono. I permessi
 * veri stanno sul server; questa è solo la forma che prende per lui.
 */
export function DettaglioRichiesta({
  voce,
  locale,
  walletStato,
  indietro,
  comeLuca,
}: {
  readonly voce: VoceRichiesta;
  readonly locale: "room26" | "ninfeo";
  /** Com'è andata la preparazione del biglietto: se è "errore" si può riprovare. */
  readonly walletStato: "pronto" | "errore" | undefined;
  /** Dove torna la freccia: l'elenco, con lo stesso filtro. */
  readonly indietro: string;
  readonly comeLuca: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [lavoro, setLavoro] = useState<Lavoro>(null);
  const [errore, setErrore] = useState("");
  /** Dopo la conferma: il link WhatsApp già scritto e, se c'è, il biglietto. La navetta non ha il biglietto. */
  const [pronto, setPronto] = useState<{ whatsapp: string | null; biglietto: string | null } | null>(null);
  const [chiedoRifiuto, setChiedoRifiuto] = useState(false);
  const [chiedoCambio, setChiedoCambio] = useState(false);
  const [motivo, setMotivo] = useState<CodiceMotivo | "">(voce.motivoCodice ?? "");

  const confermata = voce.stato === "confermata";
  const attesa = voce.stato === "in attesa";
  const primoNome = voce.nome.split(" ")[0] ?? voce.nome;
  // Per un PR il telefono non c'è: sono tutte stringhe vuote e il blocco del contatto non si disegna.
  const telefono = comeLuca ? (voce.telefono ?? "") : "";
  const numero = telefono.replace(/\D/g, "");
  const numeroWhatsapp = numero.startsWith("39") ? numero : `39${numero}`;

  async function conferma() {
    if (lavoro !== null) {
      return;
    }

    setChiedoCambio(false);
    setErrore("");
    setLavoro("conferma");

    try {
      // Solo l'id: nome, telefono, serata e il resto li legge il server dal database.
      const risposta = await fetch("/api/conferma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ richiestaId: voce.id }),
      });

      const d = (await risposta.json()) as {
        errore?: string;
        wallet?:
          | { stato: "pronto"; linkBiglietto: string; linkWhatsapp: string | null }
          | { stato: "non_previsto"; linkWhatsapp: string | null }
          | { stato: "errore"; errore: string };
      };

      if (!risposta.ok || d.wallet === undefined) {
        setErrore(d.errore ?? "Non ha funzionato");
        // Può essere cambiata da un'altra scheda: si ricarica per mostrare lo stato vero.
        router.refresh();
        return;
      }

      // La richiesta è confermata in entrambi i casi: si ricarica per mostrarlo.
      router.refresh();

      if (d.wallet.stato === "errore") {
        setErrore(d.wallet.errore);
        return;
      }

      if (d.wallet.stato === "non_previsto") {
        setPronto({ whatsapp: d.wallet.linkWhatsapp, biglietto: null });
        toast("Messaggio pronto");
      } else {
        setPronto({ whatsapp: d.wallet.linkWhatsapp, biglietto: d.wallet.linkBiglietto });
        toast("Biglietto pronto");
      }
    } catch {
      setErrore("Non sono riuscito a preparare il biglietto");
    } finally {
      setLavoro(null);
    }
  }

  async function segna(stato: "in attesa" | "rifiutata") {
    if (lavoro !== null) {
      return;
    }

    if (stato === "rifiutata" && motivo === "") {
      return;
    }

    setChiedoRifiuto(false);
    setChiedoCambio(false);
    setErrore("");
    setLavoro("stato");

    try {
      const esito = await cambiaStato(voce.id, stato, stato === "rifiutata" ? motivo : undefined);

      if (esito.ok) {
        toast(esito.messaggio);
        // Cambiare decisione cancella il biglietto appena mostrato: il link di WhatsApp non vale più per questa scelta.
        setPronto(null);
      } else {
        setErrore(esito.messaggio);
      }

      // Anche se non è riuscito: lo stato vero può essere cambiato da un'altra scheda.
      router.refresh();
    } catch {
      setErrore("Non sono riuscito a cambiare lo stato");
    } finally {
      setLavoro(null);
    }
  }

  const occupato = lavoro !== null;
  const senzaBiglietto = voce.tipoBase === "navetta";
  const preparo = senzaBiglietto ? "Preparo il messaggio…" : "Preparo il biglietto…";
  const confermaTesto = senzaBiglietto ? "Conferma la navetta" : "Conferma e prepara il biglietto";

  // Il messaggio di rifiuto, già scritto, verso il numero del cliente. Lo apre Luca a mano: non parte niente da solo.
  const linkRifiuto =
    comeLuca && voce.stato === "rifiutata" && telefono !== ""
      ? linkWhatsapp(
          telefono,
          messaggioRifiuto({
            nome: voce.nome,
            serata: voce.notte.toUpperCase(),
            data: voce.dataIso === undefined ? null : giornoLungo(voce.dataIso).toLowerCase(),
            motivo: voce.motivoCodice,
          }),
        )
      : null;

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
    const rotella = <span className={`lc-spin ${stili.rotella}`} aria-hidden />;

    // In attesa o rifiutata: si conferma (da rifiutata è un cambio di decisione).
    if (voce.stato === "rifiutata" || attesa) {
      return (
        <button type="button" className={`lc-press ${stili.primario}`} onClick={() => void conferma()} disabled={occupato}>
          {lavoro === "conferma" ? rotella : <IconaInvia misura={18} />}
          {lavoro === "conferma" ? preparo : confermaTesto}
        </button>
      );
    }

    // Confermata. Se il biglietto è pronto ed è noto il numero, WhatsApp si apre con un tocco.
    if (pronto?.whatsapp) {
      return (
        <a className={`lc-press ${stili.primario}`} href={pronto.whatsapp} target="_blank" rel="noopener noreferrer">
          <IconaMessaggio misura={18} />
          Invia conferma su WhatsApp
        </a>
      );
    }

    return (
      <button type="button" className={`lc-press ${stili.primario}`} onClick={() => void conferma()} disabled={occupato}>
        {lavoro === "conferma" ? rotella : <IconaInvia misura={18} />}
        {lavoro === "conferma" ? preparo : walletStato === "errore" ? "Riprova il biglietto" : "Invia conferma su WhatsApp"}
      </button>
    );
  }

  function secondari() {
    if (attesa) {
      return (
        <button type="button" className={`lc-press ${stili.rifiuta}`} disabled={occupato} onClick={() => setChiedoRifiuto(true)}>
          Rifiuta
        </button>
      );
    }

    return (
      <>
        {confermata && pronto?.biglietto != null && (
          <a className={`lc-press ${stili.secondario}`} href={pronto.biglietto} target="_blank" rel="noopener noreferrer">
            Guarda il biglietto
          </a>
        )}
        {linkRifiuto !== null && (
          <a className={`lc-press ${stili.secondario}`} href={linkRifiuto} target="_blank" rel="noopener noreferrer">
            Scrivi il rifiuto su WhatsApp
          </a>
        )}
        <button type="button" className={`lc-press ${stili.secondario}`} disabled={occupato} onClick={() => setChiedoCambio(true)}>
          Cambia decisione
        </button>
      </>
    );
  }

  return (
    <>
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
            {comeLuca && (
              <span className={`lc-up ${stili.provenienza}`} style={{ animationDelay: "80ms" }} data-pr={voce.prNome === undefined ? undefined : ""}>
                {voce.prNome === undefined ? "Richiesta diretta" : `PR ${voce.prNome}`}
              </span>
            )}
          </div>
          {comeLuca && <div className={stili.azioniAlto}>{azioni("scrivania")}</div>}
        </div>

        <div className={stili.griglia}>
          {comeLuca && !senzaBiglietto && (
            <div className={`lc-up ${stili.bigliettoCol}`} style={{ animationDelay: "100ms" }}>
              <BigliettoWallet
                id={voce.id}
                notte={voce.notte}
                giorno={voce.giorno}
                tipo={voce.tipo}
                locale={locale === "ninfeo" ? "NINFEO" : "ROOM26"}
                timbro={pronto !== null}
              />
            </div>
          )}

          <div className={stili.sinistra}>
            <div className={`lc-up ${stili.fatti}`} style={{ animationDelay: "200ms" }}>
              <Fatto k="Serata" v={voce.giorno} s={voce.sala === undefined ? voce.notte : `${voce.notte} · ${voce.sala}`} />
              <Fatto k="Tipo" v={voce.tipo} s={voce.persone ?? "-"} />
              {comeLuca && (
                <>
                  <Fatto
                    k="Budget a testa"
                    v={voce.budget ?? "-"}
                    s={voce.budget !== undefined ? "a persona" : voce.tipoBase === "tavolo" ? "non indicato" : "solo per i tavoli"}
                  />
                  <Fatto
                    k="Occasione"
                    v={voce.occasione ?? "-"}
                    s={voce.occasione !== undefined ? "" : voce.tipoBase === "tavolo" ? "non indicata" : "solo per i tavoli"}
                  />
                </>
              )}
            </div>

            {voce.stato === "rifiutata" && voce.motivo !== undefined && (
              <div className={`lc-up ${stili.richiesta}`} style={{ animationDelay: "210ms" }}>
                <span className="lc-eyebrow">Motivo del rifiuto</span>
                <p>{voce.motivo}</p>
              </div>
            )}

            {comeLuca && telefono !== "" && (
              <div className={`lc-up ${stili.contatto}`} style={{ animationDelay: "150ms" }}>
                <div className={stili.contattoTesto}>
                  <span className={stili.etichetta}>Contatto</span>
                  <span className={stili.telefono}>{telefono}</span>
                </div>
                <div className={stili.contattoAzioni}>
                  <a href={`tel:${telefono.replace(/[^\d+]/g, "")}`} className={stili.chiama} aria-label={`Chiama ${primoNome}`}>
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
            )}

            {comeLuca && voce.messaggio !== undefined && (
              <div className={`lc-up ${stili.richiesta}`} style={{ animationDelay: "230ms" }}>
                <span className="lc-eyebrow">Altre richieste</span>
                <p>{legaParole(voce.messaggio, { vedova: true })}</p>
              </div>
            )}

            <p className={`lc-up ${stili.nota}`} style={{ animationDelay: "250ms" }}>
              {legaParole(notaStato(voce, comeLuca), { vedova: true })}
            </p>
          </div>
        </div>
      </div>

    </article>

      {/*
        La barra e i fogli stanno fuori dall'article: l'article ha container-type, che crea un contenimento di layout,
        e un elemento fixed lì dentro si ancora all'article invece che allo schermo (la barra finiva a metà pagina).
      */}
      {/* Il PR non decide: nessuna barra di azioni. */}
      {comeLuca && <div className={stili.barraBasso}>{azioni("barra")}</div>}

      {comeLuca && (
        <>
          <FoglioInferiore aperto={chiedoRifiuto} chiudi={() => setChiedoRifiuto(false)} titolo={`Rifiuti ${primoNome}?`}>
            <div className={stili.conferma}>
              <h2 className={stili.confermaTitolo}>Rifiuti {primoNome}?</h2>
              <p className={stili.confermaTesto}>
                {legaParole("Scegli il motivo: lo vedono Luca e il PR che l'ha portata. Nessun messaggio parte da solo.", { vedova: true })}
              </p>
              <div className={stili.motivi} role="radiogroup" aria-label="Motivo del rifiuto">
                {MOTIVI_RIFIUTO.map((m) => (
                  <button
                    key={m.codice}
                    type="button"
                    role="radio"
                    aria-checked={motivo === m.codice}
                    className={`lc-press ${stili.motivo} ${motivo === m.codice ? stili.motivoScelto : ""}`}
                    onClick={() => setMotivo(m.codice)}
                  >
                    {m.etichetta}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={`lc-press ${stili.confermaRifiuta}`}
                onClick={() => void segna("rifiutata")}
                disabled={motivo === "" || occupato}
              >
                {voce.stato === "rifiutata" ? "Salva il motivo" : "Rifiuta la richiesta"}
              </button>
              <button type="button" className={`lc-press ${stili.confermaAnnulla}`} onClick={() => setChiedoRifiuto(false)}>
                Annulla
              </button>
            </div>
          </FoglioInferiore>

          <FoglioInferiore aperto={chiedoCambio} chiudi={() => setChiedoCambio(false)} titolo="Cambia decisione">
            <div className={stili.conferma}>
              <h2 className={stili.confermaTitolo}>Cambia decisione</h2>
              <p className={stili.confermaTesto}>
                {legaParole("La richiesta resta nell'elenco con il nuovo stato. Il cliente non riceve niente da solo.", { vedova: true })}
              </p>
              {voce.stato !== "in attesa" && (
                <button type="button" className={`lc-press ${stili.confermaNeutra}`} onClick={() => void segna("in attesa")} disabled={occupato}>
                  Rimetti in attesa
                </button>
              )}
              <button
                type="button"
                className={`lc-press ${stili.confermaRifiuta}`}
                onClick={() => {
                  setChiedoCambio(false);
                  setChiedoRifiuto(true);
                }}
              >
                {voce.stato === "rifiutata" ? "Cambia il motivo del rifiuto" : "Rifiuta con un motivo"}
              </button>
              <button type="button" className={`lc-press ${stili.confermaAnnulla}`} onClick={() => setChiedoCambio(false)}>
                Annulla
              </button>
            </div>
          </FoglioInferiore>
        </>
      )}
    </>
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
