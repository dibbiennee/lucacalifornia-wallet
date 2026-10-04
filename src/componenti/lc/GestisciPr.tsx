"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { cambiaCodice, riaccendiPr, rigeneraPassword, spegniPr, type CredenzialiPr } from "@/app/pannello/azioni";
import { messaggioAccesso } from "@/lib/pannello/messaggi";
import { legaParole } from "@/lib/tipografia";

import { negliAppunti } from "./appunti";
import stili from "./AggiungiPr.module.css";
import { FoglioInferiore } from "./FoglioInferiore";
import { useToast } from "./Toast";

export interface PrGestito {
  readonly id: string;
  readonly nome: string;
  readonly codice: string;
  readonly attivo: boolean;
  /** Il link intero: https://dominio/pr/<codice>. */
  readonly link: string;
}

/**
 * Tutto quello che Luca fa su un PR già creato, in un foglio solo: copiare il
 * link, dargli una nuova password, cambiare il codice, spegnerlo o riaccenderlo,
 * vedere i suoi numeri. Decide solo lui: ogni azione ricontrolla sul server.
 *
 * La password nuova si vede qui, una volta: nel database resta solo l'hash.
 */
export function GestisciPr({
  pr,
  indirizzo,
  chiudi,
}: {
  readonly pr: PrGestito | null;
  /** L'indirizzo del sito, con il protocollo: serve al messaggio con l'accesso. */
  readonly indirizzo: string;
  readonly chiudi: () => void;
}) {
  const id = useId();
  const router = useRouter();
  const toast = useToast();
  const [credenziali, setCredenziali] = useState<CredenzialiPr | null>(null);
  const [codice, setCodice] = useState("");
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [confermaSpegni, setConfermaSpegni] = useState(false);

  function finito() {
    setCredenziali(null);
    setCodice("");
    setErrore("");
    setConfermaSpegni(false);
    chiudi();
    router.refresh();
  }

  async function copiaLink(p: PrGestito) {
    toast((await negliAppunti(p.link)) ? "Link copiato" : "Non riesco a copiare, selezionalo a mano");
  }

  async function copiaAccesso(c: CredenzialiPr) {
    toast((await negliAppunti(messaggioAccesso(c, indirizzo))) ? "Messaggio copiato" : "Non riesco a copiare, selezionalo a mano");
  }

  async function nuovaPassword(p: PrGestito) {
    if (inCorso) {
      return;
    }
    setErrore("");
    setInCorso(true);

    try {
      setCredenziali(await rigeneraPassword(p.id));
    } catch {
      setErrore("Non ha funzionato, riprova");
    } finally {
      setInCorso(false);
    }
  }

  async function salvaCodice(evento: FormEvent, p: PrGestito) {
    evento.preventDefault();

    if (inCorso || codice.trim() === "") {
      return;
    }
    setErrore("");
    setInCorso(true);

    try {
      const esito = await cambiaCodice(p.id, codice);

      if (esito.ok) {
        toast(esito.messaggio);
        finito();
      } else {
        setErrore(esito.messaggio);
      }
    } catch {
      setErrore("Non ha funzionato, riprova");
    } finally {
      setInCorso(false);
    }
  }

  async function accendiSpegni(p: PrGestito) {
    if (inCorso) {
      return;
    }
    setErrore("");
    setInCorso(true);

    try {
      const esito = p.attivo ? await spegniPr(p.id) : await riaccendiPr(p.id);
      toast(esito.messaggio);

      if (esito.ok) {
        finito();
      } else {
        setErrore(esito.messaggio);
      }
    } catch {
      setErrore("Non ha funzionato, riprova");
    } finally {
      setInCorso(false);
    }
  }

  return (
    <FoglioInferiore aperto={pr !== null} chiudi={finito} titolo={pr === null ? "Gestisci PR" : `Gestisci ${pr.nome}`} focusIniziale="finestra">
      {pr !== null && credenziali !== null ? (
        <div className={stili.modulo}>
          <div className={stili.testa}>
            <h2 className={stili.titolo}>Nuova password di {pr.nome.split(/\s+/)[0] ?? pr.nome}</h2>
            <p className={stili.testo}>
              {legaParole("Copia il messaggio e mandalo a lui su WhatsApp: dentro ci sono link, nome e password, e la password non si potrà più rivedere. La vecchia non vale più.", { vedova: true })}
            </p>
          </div>
          <div className={stili.anteprima}>
            <span className="lc-eyebrow">Nome</span>
            <span className={stili.indirizzo}>{credenziali.codice}</span>
          </div>
          <div className={stili.anteprima}>
            <span className="lc-eyebrow">Password</span>
            <span className={stili.indirizzo}>{credenziali.password}</span>
          </div>
          <div className={stili.azioni}>
            <button type="button" className={`lc-press ${stili.aggiungi}`} onClick={() => void copiaAccesso(credenziali)}>
              Copia il messaggio per {pr.nome.split(/\s+/)[0] ?? pr.nome}
            </button>
          </div>
          <div className={stili.azioni}>
            <button type="button" className={`lc-press ${stili.secondario}`} onClick={finito}>
              Fatto
            </button>
          </div>
        </div>
      ) : pr !== null ? (
        <div className={stili.modulo}>
          <div className={stili.testa}>
            <h2 className={stili.titolo}>{pr.nome}</h2>
            <p className={stili.testo}>
              {pr.attivo
                ? "Il suo link e il suo accesso funzionano."
                : "Disattivato: il link non si apre più e lui non può entrare. Richieste e storico restano a te."}
            </p>
          </div>

          <div className={stili.anteprima}>
            <span className="lc-eyebrow">Il suo link</span>
            <span className={stili.indirizzo}>{pr.link.replace(/^https?:\/\//, "")}</span>
          </div>

          <div className={stili.azioni}>
            <button type="button" className={`lc-press ${stili.secondario}`} onClick={() => void copiaLink(pr)}>
              Copia il link
            </button>
            <Link href={`/pannello/analisi?pr=${pr.id}`} className={`lc-press ${stili.secondario}`} onClick={finito}>
              Vedi i numeri
            </Link>
          </div>

          <div className={stili.azioni}>
            <button type="button" className={`lc-press ${stili.aggiungi}`} onClick={() => void nuovaPassword(pr)} disabled={inCorso}>
              {inCorso ? "Un attimo…" : "Genera una nuova password"}
            </button>
          </div>

          <form className={stili.modulo} onSubmit={(e) => void salvaCodice(e, pr)} noValidate>
            <label className={stili.campo} htmlFor={`${id}-codice`}>
              Cambia il codice (fine del link e nome per entrare)
              <input
                id={`${id}-codice`}
                type="text"
                value={codice}
                onChange={(e) => setCodice(e.target.value)}
                placeholder={pr.codice}
                autoComplete="off"
                autoCapitalize="none"
                maxLength={30}
              />
            </label>
            <div className={stili.azioni}>
              <button type="submit" className={`lc-press ${stili.secondario}`} disabled={codice.trim() === "" || inCorso}>
                Salva il nuovo codice
              </button>
            </div>
          </form>

          {errore !== "" && (
            <p role="alert" className={stili.errore}>
              {errore}
            </p>
          )}

          {pr.attivo && !confermaSpegni ? (
            <div className={stili.azioni}>
              <button type="button" className={`lc-press ${stili.secondario}`} onClick={() => setConfermaSpegni(true)}>
                Disattiva il PR
              </button>
            </div>
          ) : pr.attivo ? (
            <div className={stili.modulo}>
              <p className={stili.testo}>
                {legaParole("Il link smette di funzionare per nuove richieste e lui non entra più. Niente viene cancellato. Confermi?", { vedova: true })}
              </p>
              <div className={stili.azioni}>
                <button type="button" className={`lc-press ${stili.secondario}`} onClick={() => setConfermaSpegni(false)}>
                  Annulla
                </button>
                <button type="button" className={`lc-press ${stili.aggiungi}`} onClick={() => void accendiSpegni(pr)} disabled={inCorso}>
                  Sì, disattiva
                </button>
              </div>
            </div>
          ) : (
            <div className={stili.azioni}>
              <button type="button" className={`lc-press ${stili.aggiungi}`} onClick={() => void accendiSpegni(pr)} disabled={inCorso}>
                Riattiva il PR
              </button>
            </div>
          )}
        </div>
      ) : null}
    </FoglioInferiore>
  );
}
