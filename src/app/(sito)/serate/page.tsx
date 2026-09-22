import { Pila } from "@/componenti/Pila";
import { Serate } from "@/componenti/sezioni/Serate";
import { Modulo } from "@/componenti/sezioni/Modulo";

export const metadata = { title: "Le serate al Room 26 - Luca California" };

export default function PaginaSerate() {
  return (
    <>
      <section className="fascia" style={{ paddingBottom: 0 }}>
        <div className="dentro">
          <Pila occhiello="DA GIOVEDÌ A DOMENICA" righe={["QUATTRO", "SERATE"]} />
          <p className="debole" style={{ margin: "1.5rem 0 0" }}>
            Ogni sera ha la sua musica e il suo pubblico. Scegli la tua e prenota.
          </p>
        </div>
      </section>
      <Serate />
      <Modulo />
    </>
  );
}
