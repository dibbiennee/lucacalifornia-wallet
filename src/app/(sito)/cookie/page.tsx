import { Pila } from "@/componenti/Pila";

export const metadata = { title: "COOKIE - Luca California" };

export default function PaginaCOOKIE() {
  return (
    <section className="fascia">
      <div className="dentro">
        <Pila righe={["COOKIE"]} />
        <p
          style={{
            border: "2px dashed rgba(255,255,255,0.4)",
            padding: "1.2rem",
            margin: "2rem 0 0",
            color: "var(--testo-debole)",
          }}
        >
          Testo segnaposto. L&apos;informativa vera va scritta prima di pubblicare il sito
          davvero: [DA CONFERMARE].
        </p>
      </div>
    </section>
  );
}
