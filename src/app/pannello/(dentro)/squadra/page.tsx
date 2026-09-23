import { nuovoPr } from "@/app/pannello/azioni";
import { CopiaLink } from "@/componenti/pannello/CopiaLink";
import { NotaEsempio } from "@/componenti/pannello/Messaggi";
import { ModuloRapido } from "@/componenti/pannello/ModuloRapido";
import { Numeri, Numero } from "@/componenti/pannello/Numero";
import { PulsanteLink } from "@/componenti/pannello/Pulsante";
import { Riquadro } from "@/componenti/pannello/Scelta";
import { Testata } from "@/componenti/pannello/Testata";
import { compleanni, squadra } from "@/lib/pannello/dati";

import stili from "@/componenti/pannello/CopiaLink.module.css";

export const metadata = { title: "Squadra, pannello Luca California" };

const MESE = new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", month: "long" });

/** Il messaggio già scritto per il compleanno: lo manda Luca, non parte da solo. */
function auguri(nome: string): string {
  const primo = nome.split(" ")[0] ?? nome;
  return `Ciao ${primo}! Tra poco è il tuo compleanno: ti tengo un tavolo come l'anno scorso?`;
}

export default function Squadra() {
  return (
    <main className="pagina">
      <Testata occhiello={MESE.format(new Date())} titolo="Squadra" />

      <div className="lista">
        {squadra().map((pr) => (
          <Riquadro key={pr.nome}>
            <p className={stili.testa}>
              <b>{pr.nome.toUpperCase()}</b>
              <span>{pr.prenotazioni} prenotazioni</span>
            </p>

            <CopiaLink link={pr.link} />

            <Numeri>
              <Numero valore={pr.liste} etichetta="liste" />
              <Numero valore={pr.tavoli} etichetta="tavoli" />
              <Numero valore={`${pr.provvigioni} €`} etichetta="provvigioni" />
            </Numeri>
          </Riquadro>
        ))}
      </div>

      <ModuloRapido
        apri="Aggiungi un PR"
        etichetta="Nome del PR"
        invia="Crea il suo link"
        azione={nuovoPr}
      />

      <section className="sezione" aria-labelledby="compleanni">
        <h2 className="titolo-sezione" id="compleanni">
          Compleanni in arrivo
        </h2>

        <div className="lista">
          {compleanni().map((c) => (
            <Riquadro key={c.nome}>
              <p className={stili.testa}>
                <b className={stili["nome-persona"]}>{c.nome}</b>
                <span>{c.fra}</span>
              </p>
              <p className="testo">L&apos;anno scorso: {c.annoScorso.toLowerCase()}</p>
              <PulsanteLink
                aspetto="vuoto"
                href={`https://wa.me/${c.telefono}?text=${encodeURIComponent(auguri(c.nome))}`}
                esterno
              >
                Scrivi su WhatsApp
              </PulsanteLink>
            </Riquadro>
          ))}
        </div>
      </section>

      <NotaEsempio />
    </main>
  );
}
