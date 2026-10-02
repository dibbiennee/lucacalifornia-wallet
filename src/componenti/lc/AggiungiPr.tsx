"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { nuovoPr } from "@/app/pannello/azioni";
import { slugDaNome } from "@/lib/pannello/vista";
import { legaParole } from "@/lib/tipografia";

import { FoglioInferiore } from "./FoglioInferiore";
import stili from "./AggiungiPr.module.css";
import { useToast } from "./Toast";

/**
 * "Nuovo PR": un nome, e il suo link personale esce subito, già funzionante.
 *
 * Sul telefono è un foglio dal basso, sul computer una finestra al centro. La
 * anteprima del link si aggiorna mentre si scrive: è la stessa regola che usa
 * il server, quindi il link che si vede è quello che nasce (salvo due PR con
 * lo stesso nome: il secondo prende un paio di cifre in più, e l'avviso a
 * fine operazione riporta il link vero).
 */
export function AggiungiPr({ aperto, chiudi }: { readonly aperto: boolean; readonly chiudi: () => void }) {
  const id = useId();
  const router = useRouter();
  const toast = useToast();
  const [nome, setNome] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");

  const slug = slugDaNome(nome);

  async function aggiungi(evento: FormEvent) {
    evento.preventDefault();

    if (slug === "" || inCorso) {
      return;
    }

    setErrore("");
    setInCorso(true);

    try {
      const esito = await nuovoPr(nome.trim());
      // "Link creato: lucacalifornia.satoshiweb.it/marco42": si riporta la parte che conta.
      const vero = esito.slice(esito.lastIndexOf("/") + 1);
      toast(`${nome.trim().split(/\s+/)[0] ?? nome} aggiunto: /${vero}`);
      setNome("");
      chiudi();
      router.refresh();
    } catch {
      setErrore("Non ha funzionato, riprova");
    } finally {
      setInCorso(false);
    }
  }

  return (
    <FoglioInferiore aperto={aperto} chiudi={chiudi} titolo="Nuovo PR">
      <form className={stili.modulo} onSubmit={(e) => void aggiungi(e)} noValidate>
        <div className={stili.testa}>
          <h2 className={stili.titolo}>Nuovo PR</h2>
          <p className={stili.testo}>
            {legaParole("Riceve un link personale. Ogni prenotazione da lì viene contata a suo nome.", { vedova: true })}
          </p>
        </div>

        <label className={stili.campo} htmlFor={`${id}-nome`}>
          Nome e cognome
          <input
            id={`${id}-nome`}
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Es. Marco Rossi"
            autoComplete="off"
            maxLength={60}
          />
        </label>

        <div className={stili.anteprima}>
          <span className="lc-eyebrow">Anteprima link</span>
          <span className={stili.indirizzo}>
            lucacalifornia.satoshiweb.it/<span className={stili.slug}>{slug === "" ? "nomecognome" : slug}</span>
          </span>
        </div>

        {errore !== "" && (
          <p role="alert" className={stili.errore}>
            {errore}
          </p>
        )}

        <div className={stili.azioni}>
          <button type="button" className={`lc-press ${stili.annulla}`} onClick={chiudi}>
            Annulla
          </button>
          <button type="submit" className={`lc-press ${stili.aggiungi}`} disabled={slug === "" || inCorso}>
            {inCorso ? "Un attimo…" : "Aggiungi alla squadra"}
          </button>
        </div>
      </form>
    </FoglioInferiore>
  );
}
