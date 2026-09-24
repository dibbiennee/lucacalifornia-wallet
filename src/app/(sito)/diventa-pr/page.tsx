import { Bottone } from "@/componenti/sito/Bottone";
import { FoglioCandidatura } from "@/componenti/sito/FoglioCandidatura";
import { Indietro, Punti, TestaPagina } from "@/componenti/sito/Pagina";
import { INSTAGRAM_URL } from "@/contenuti/sito";

export const metadata = {
  title: "Diventa PR - Luca California",
  description:
    "Cerco nuovi PR per la mia squadra, a Roma e sul litorale. Non serve esperienza: la formazione la faccio io, di persona.",
};

const PERCHE = [
  { titolo: "Festa e networking", testo: "Lavori dove ti diverti e conosci gente nuova ogni settimana." },
  { titolo: "Guadagno immediato", testo: "Provvigioni e bonus su liste e tavoli che porti." },
  { titolo: "Crescita nel nightlife", testo: "Impari il mestiere da chi lo fa da anni." },
] as const;

const FORMAZIONE = [
  {
    titolo: "Teoria",
    testo: "Una giornata con me: come si costruisce una lista, come si gestiscono tavoli e clienti.",
  },
  { titolo: "Pratica", testo: "Una serata vera, dentro il locale, accanto a me." },
] as const;

export default function PaginaDiventaPr() {
  return (
    <>
      <Indietro testo="Home" dove="/" />
      <TestaPagina
        occhiello="All we have is now"
        colore="var(--red)"
        righe={["Per la figura", "di PR"]}
        introduzione="Cerco nuovi PR per la mia squadra, a Roma e sul litorale. Non serve esperienza: la formazione la faccio io, di persona, in un percorso individuale in due giorni."
      />

      <section className="wrap" style={{ paddingBottom: 56 }}>
        <p className="occhiello" style={{ color: "var(--muted)" }}>
          Perché farlo
        </p>
        <Punti voci={PERCHE} />

        <p className="occhiello" style={{ color: "var(--muted)", marginTop: 28 }}>
          La formazione
        </p>
        <Punti voci={FORMAZIONE} />

        <FoglioCandidatura />

        <div style={{ marginTop: 14 }}>
          <Bottone href={INSTAGRAM_URL} aspetto="contorno" esterno pieno>
            Seguimi su Instagram
          </Bottone>
        </div>
      </section>
    </>
  );
}
