"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { nuovoPr, type CredenzialiPr } from "@/app/pannello/azioni";
import { slugDaNome } from "@/lib/pannello/vista";
import { legaParole } from "@/lib/tipografia";

import { negliAppunti } from "./appunti";
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
export function AggiungiPr({
  aperto,
  chiudi,
  indirizzo,
}: {
  readonly aperto: boolean;
  readonly chiudi: () => void;
  /** L'indirizzo del sito, con il protocollo: lo compone il server dalla configurazione. */
  readonly indirizzo: string;
}) {
  const id = useId();
  const router = useRouter();
  const toast = useToast();
  const [nome, setNome] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");
  /*
   * L'accesso appena creato. La password si vede qui e solo qui: nel database
   * c'è soltanto l'hash, quindi chiusa questa schermata non si può più
   * rileggere (si può solo rigenerarne una nuova).
   */
  const [credenziali, setCredenziali] = useState<CredenzialiPr | null>(null);

  const slug = slugDaNome(nome);

  function finito() {
    setCredenziali(null);
    chiudi();
    router.refresh();
  }

  async function copiaAccesso(c: CredenzialiPr) {
    const testo =
      `Ciao ${c.nome.split(/\s+/)[0] ?? c.nome}, ecco il tuo accesso al pannello di Luca California.\n` +
      `Indirizzo: ${indirizzo}/pannello/accesso\n` +
      `Nome: ${c.codice}\nPassword: ${c.password}\n\n` +
      `Il tuo link per le prenotazioni: ${c.link}`;

    toast((await negliAppunti(testo)) ? "Accesso copiato" : "Non riesco a copiare, selezionalo a mano");
  }

  async function aggiungi(evento: FormEvent) {
    evento.preventDefault();

    if (slug === "" || inCorso) {
      return;
    }

    setErrore("");
    setInCorso(true);

    try {
      const esito = await nuovoPr(nome.trim());
      toast(`${nome.trim().split(/\s+/)[0] ?? nome} aggiunto: /${esito.codice}`);
      setNome("");
      // Non si chiude: Luca deve vedere la password e copiarla prima.
      setCredenziali(esito);
    } catch {
      setErrore("Non ha funzionato, riprova");
    } finally {
      setInCorso(false);
    }
  }

  return (
    <FoglioInferiore aperto={aperto} chiudi={credenziali === null ? chiudi : finito} titolo="Nuovo PR">
      {credenziali !== null ? (
        <div className={stili.modulo}>
          <div className={stili.testa}>
            <h2 className={stili.titolo}>Accesso di {credenziali.nome.split(/\s+/)[0] ?? credenziali.nome}</h2>
            <p className={stili.testo}>
              {legaParole("Copia la password adesso e mandala a lui: non si potrà più rivedere. Se la perdi, ne generi un'altra.", { vedova: true })}
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
              Copia l&apos;accesso
            </button>
          </div>
          <div className={stili.azioni}>
            <button type="button" className={`lc-press ${stili.aggiungi}`} onClick={finito}>
              Fatto
            </button>
          </div>
        </div>
      ) : (
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
            {indirizzo.replace(/^https?:\/\//, "")}/pr/<span className={stili.slug}>{slug === "" ? "nomecognome" : slug}</span>
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
      )}
    </FoglioInferiore>
  );
}
