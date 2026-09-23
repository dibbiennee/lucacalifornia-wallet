"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { cambiaStato } from "@/app/pannello/azioni";
import type { RichiestaPannello } from "@/lib/pannello/dati";
import { tipoBiglietto } from "@/lib/pannello/testi";
import { giornoDellaSerata, prossimaSerata } from "@/lib/serate";

import { Avviso } from "./Avviso";
import { Conferma } from "./Conferma";
import { Errore } from "./Campo";
import { DuePulsanti, Pulsante, PulsanteLink } from "./Pulsante";

/**
 * Il gesto che chiude la richiesta.
 *
 * Non manda niente da solo: prepara il biglietto vero e apre WhatsApp col
 * messaggio già scritto. È una regola del brief, ogni messaggio al cliente
 * parte da Luca.
 *
 * Il biglietto è quello vero: /api/conferma crea il token cifrato e
 * restituisce il link al .pkpass, lo stesso che il cliente aggiunge al
 * Wallet. È l'unica parte del pannello che non è di esempio.
 */
export function ConfermaEScrivi({ r }: { readonly r: RichiestaPannello }) {
  const router = useRouter();
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");
  const [avviso, setAvviso] = useState("");
  const [chiedo, setChiedo] = useState(false);
  const [pronto, setPronto] = useState<{ whatsapp: string; biglietto: string } | null>(null);

  async function conferma() {
    setErrore("");
    setInCorso(true);

    try {
      const risposta = await fetch("/api/conferma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCliente: r.nome,
          telefono: r.telefono,
          /*
           * Il nome della serata, non il giorno: il messaggio diceva "sei
           * dentro per SABATO di sabato 27 settembre".
           */
          serata: r.nomeSerata,
          /*
           * La prossima volta che cade quella serata, ora di Roma. Prima era
           * sempre "la prossima domenica", per tutte le richieste.
           */
          inizioSerata: prossimaSerata(giornoDellaSerata(r.codiceSerata)).toISOString(),
          tipo: tipoBiglietto(r),
          locale: "room26",
          ...(r.sala === undefined ? {} : { sala: r.sala }),
        }),
      });

      if (!risposta.ok) {
        const d = (await risposta.json()) as { errore?: string };
        setErrore(d.errore ?? "Non ha funzionato");
        return;
      }

      const d = (await risposta.json()) as { linkWhatsapp: string; linkBiglietto: string };
      setPronto({ whatsapp: d.linkWhatsapp, biglietto: d.linkBiglietto });

      await cambiaStato(r.id, "confermata");
      router.refresh();
    } catch {
      setErrore("Non sono riuscito a preparare il biglietto");
    } finally {
      setInCorso(false);
    }
  }

  async function segna(stato: "in attesa" | "rifiutata") {
    setChiedo(false);
    setErrore("");
    setInCorso(true);

    try {
      setAvviso(await cambiaStato(r.id, stato));
      router.refresh();
    } catch {
      setErrore("Non sono riuscito a cambiare lo stato");
    } finally {
      setInCorso(false);
    }
  }

  if (pronto !== null) {
    return (
      <section className="sezione" role="status">
        <p className="testo" style={{ fontWeight: 700, color: "var(--text)" }}>
          Biglietto pronto.
        </p>
        <PulsanteLink aspetto="whatsapp" href={pronto.whatsapp} esterno>
          Apri WhatsApp col messaggio
        </PulsanteLink>
        <PulsanteLink aspetto="vuoto" href={pronto.biglietto} esterno>
          Guarda il biglietto
        </PulsanteLink>
      </section>
    );
  }

  const confermata = r.stato === "confermata";

  return (
    <section className="sezione" aria-labelledby="quando-confermi">
      <h2 className="titolo-sezione" id="quando-confermi">
        Quando confermi
      </h2>
      <p className="testo">
        Si apre WhatsApp con il messaggio già scritto e il link al biglietto da aggiungere al
        Wallet. Niente parte da solo.
      </p>

      {confermata && r.bigliettoInviatoAlle !== undefined && (
        <p className="testo-piccolo">Biglietto già inviato alle {r.bigliettoInviatoAlle}.</p>
      )}

      {errore !== "" && <Errore>{errore}</Errore>}

      <Pulsante onClick={() => void conferma()} disabled={inCorso}>
        {inCorso ? "Preparo il biglietto..." : confermata ? "Rimanda il biglietto" : "Conferma e scrivi"}
      </Pulsante>

      <DuePulsanti>
        <Pulsante
          aspetto="vuoto"
          onClick={() => void segna("in attesa")}
          disabled={inCorso || r.stato === "in attesa"}
        >
          In attesa
        </Pulsante>
        <Pulsante
          aspetto="vuoto"
          onClick={() => setChiedo(true)}
          disabled={inCorso || r.stato === "rifiutata"}
        >
          Rifiuta
        </Pulsante>
      </DuePulsanti>

      <Conferma
        aperta={chiedo}
        titolo={`Rifiuti ${r.nome.split(" ")[0]}?`}
        testo="La richiesta resta nell'elenco, segnata come rifiutata. Nessun messaggio parte da solo."
        azione="Rifiuta la richiesta"
        procedi={() => void segna("rifiutata")}
        annulla={() => setChiedo(false)}
      />

      <Avviso testo={avviso} chiudi={() => setAvviso("")} />
    </section>
  );
}
