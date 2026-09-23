import { InterruttoriSerate } from "@/componenti/pannello/InterruttoriSerate";
import { NotaEsempio, Testo } from "@/componenti/pannello/Messaggi";
import { ModuloRapido, PulsanteAzione } from "@/componenti/pannello/ModuloRapido";
import { Testata } from "@/componenti/pannello/Testata";
import { nuovoOspite, pubblica } from "@/app/pannello/azioni";
import { listeDiAttesa, serate } from "@/lib/pannello/dati";

export const metadata = { title: "Serate, pannello Luca California" };

export default function Serate() {
  const attesa = listeDiAttesa();

  return (
    <main className="pagina">
      <Testata occhiello="Room 26" titolo="Serate" sottotitolo="Cosa vede la gente sul sito." />

      <InterruttoriSerate serate={serate()} />

      <section className="sezione" aria-labelledby="special-guest">
        <h2 className="titolo-sezione" id="special-guest">
          Special guest, {attesa.specialGuest} in attesa
        </h2>
        <Testo>Quando aggiungi un ospite, chi è in attesa riceve l&apos;avviso.</Testo>
        <ModuloRapido
          apri="Aggiungi un ospite"
          etichetta="Nome dell'ospite"
          invia={`Avvisa ${attesa.specialGuest} persone`}
          azione={nuovoOspite}
        />
      </section>

      <section className="sezione" aria-labelledby="capodanno">
        <h2 className="titolo-sezione" id="capodanno">
          Capodanno, {attesa.capodanno} in attesa
        </h2>
        <Testo>Pacchetti non ancora pubblicati.</Testo>
        <PulsanteAzione testo="Pubblica i pacchetti" azione={pubblica} />
      </section>

      <NotaEsempio />
    </main>
  );
}
