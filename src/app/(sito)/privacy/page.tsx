import { Pila } from "@/componenti/Pila";

export const metadata = { title: "PRIVACY - Luca California" };

export default function PaginaPRIVACY() {
  return (
    <section className="fascia">
      <div className="dentro">
        <Pila righe={["PRIVACY"]} />
        <p className="testo-lungo" style={{ margin: "2rem 0 0" }}>
          Questa è un&apos;anteprima del sito. L&apos;informativa completa viene pubblicata
          insieme al sito vero, prima che il modulo di prenotazione raccolga dati di persone
          reali.
        </p>
      </div>
    </section>
  );
}
