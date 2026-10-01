import { Bottone } from "@/componenti/sito/Bottone";
import { Indietro } from "@/componenti/sito/Indietro";
import { FotoPagina, Introduzione, Pillole, Punti, TestaPagina } from "@/componenti/sito/Pagina";

export const metadata = {
  title: "Tavoli al ROOM26 - Luca California",
  description:
    "Compleanni, lauree e bottiglie al ROOM26 di Roma: dimmi cosa festeggiate e preparo tutto io, dalla bottiglia alla torta.",
};

/** Le occasioni sono le stesse che si scelgono nel modulo. */
const OCCASIONI = [
  "Compleanno",
  "Laurea",
  "Diciottesimo",
  "Addio al nubilato",
  "Addio al celibato",
  "Anniversario",
] as const;

const COME_FUNZIONA = [
  {
    titolo: "Misto, solo ragazzi o solo ragazze",
    testo: "Me lo dici nel modulo: non ti chiedo quanti siete.",
  },
  {
    titolo: "Tre fasce di budget a testa",
    testo: "25–30 €, 35–50 € oppure oltre 50 €. Il prezzo esatto te lo dico io su WhatsApp.",
  },
  {
    titolo: "Richieste particolari",
    testo: "Torta, bottiglia, decorazioni: scrivile e le preparo prima che arrivi.",
  },
] as const;

export default function PaginaTavoli() {
  return (
    <>
      <Indietro testo="Home" dove="/" />
      <TestaPagina
        occhiello="Tavoli"
        colore="var(--sun)"
        righe={["La tua sera,", "con il tavolo pronto"]}
      />

      <section className="wrap" style={{ paddingBottom: 56 }}>
        <FotoPagina src="/foto/atmosfera/tavoli-bottiglie.jpg" alt="Bottiglie dorate al tavolo, con il logo inciso sul vetro" />

        <Introduzione>Compleanno, laurea o solo voglia di festeggiare: dimmi cosa festeggiate e ti preparo
          tutto io, dalla bottiglia alla torta. Arrivi, ti siedi, la serata è già partita.</Introduzione>

        <Pillole voci={OCCASIONI} />
        <Punti voci={COME_FUNZIONA} />

        <Bottone href="/prenota?tipo=tavolo" pieno stile={{ background: "var(--sun)", color: "var(--ink)" }}>
          Prenota un tavolo
        </Bottone>
      </section>
    </>
  );
}
