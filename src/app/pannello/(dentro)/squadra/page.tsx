import { nuovoPr } from "@/app/pannello/azioni";
import { CopiaLink } from "@/componenti/pannello/CopiaLink";
import { NotaEsempio, Testo } from "@/componenti/pannello/Messaggi";
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

export default async function Squadra() {
  const pr = await squadra();

  return (
    <main className="pagina">
      <Testata occhiello={MESE.format(new Date())} titolo="Squadra" />

      <div className="lista">
        {pr.map((p) => (
          <Riquadro key={p.codice}>
            <p className={stili.testa}>
              <b>{p.nome.toUpperCase()}</b>
              <span>{p.confermate} confermate</span>
            </p>

            <CopiaLink link={p.link} />

            <Numeri>
              <Numero valore={p.liste} etichetta="liste" />
              <Numero valore={p.tavoli} etichetta="tavoli" />
              <Numero valore={p.braccialetti} etichetta="bracciali" />
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
              <Testo>L&apos;anno scorso: {c.annoScorso.toLowerCase()}</Testo>
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
