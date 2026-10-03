import Link from "next/link";

import { Bottone } from "@/componenti/sito/Bottone";
import { DatiBriciole } from "@/componenti/DatiBriciole";
import { Indietro } from "@/componenti/sito/Indietro";
import { Altre, Domande, FotoPagina, Introduzione, Pillole, Punti, TestaPagina, Titolo2 } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Pagina.module.css";
import { percorsoSerata, SERATE } from "@/contenuti/sito";
import { metadatiPagina } from "@/lib/seo";

export const metadata = metadatiPagina({
  percorso: "/tavoli",
  titolo: "Tavolo al ROOM26 di Roma: prenota con me - Luca California",
  descrizione:
    "Prenota un tavolo al ROOM26 di Roma con me: scegli la serata, il gruppo e il budget a persona, e ti rispondo io su WhatsApp. Nessun pagamento sul sito.",
});

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
    titolo: "Indica serata e data",
    testo: "Giovedì, venerdì, sabato o domenica: nel modulo indichi la serata e la data.",
  },
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
  {
    titolo: "Ti rispondo io",
    testo: "Su WhatsApp, con disponibilità e prezzo. Quando confermo, il biglietto arriva nel Wallet.",
  },
] as const;

const DOMANDE = [
  {
    domanda: "Quanto costa un tavolo al ROOM26?",
    risposta:
      "Nel modulo scegli una fascia di budget a persona: 25–30 €, 35–50 € oppure oltre 50 €. Con la tua richiesta ti propongo la soluzione e ti rispondo su WhatsApp con disponibilità e prezzo.",
  },
  {
    domanda: "Come funzionano i tavoli in discoteca?",
    risposta:
      "Scegli serata e data, mi dici come siete (misto, solo ragazzi o solo ragazze), il budget a persona e se c'è un'occasione da festeggiare. Poi ti confermo e ricevi il biglietto da aggiungere al Wallet.",
  },
  {
    domanda: "Qual è l'età minima?",
    risposta: "L'età minima per entrare è 18 anni.",
  },
  {
    domanda: "Posso entrare senza prenotare un tavolo?",
    risposta:
      "Sì. Con il bracciale VIP accedi all'area tavoli dietro la consolle senza prenotare il tavolo, con la lista entri in pista.",
  },
  {
    domanda: "Devo pagare sul sito?",
    risposta: "No, sul sito non si paga niente.",
  },
] as const;

export default function PaginaTavoli() {
  return (
    <>
      <DatiBriciole voci={[{ nome: "Home", percorso: "/" }, { nome: "Tavoli", percorso: "/tavoli" }]} />
      <Indietro testo="Home" dove="/" />
      <TestaPagina
        occhiello="Tavoli"
        righe={["Prenota un tavolo", "al ROOM26 con me"]}
      />

      <section className="wrap" style={{ paddingBottom: 56 }}>
        <div className={stili.corpo}>
          <FotoPagina src="/foto/atmosfera/tavoli-bottiglie.jpg" alt="Bottiglie dorate al tavolo, con il logo inciso sul vetro" />

          <div className={stili.corpoTesto}>
            <Introduzione>La tua sera, con il tavolo pronto. Compleanno, laurea o solo voglia di festeggiare:
              dimmi cosa festeggiate e ti preparo tutto io, dalla bottiglia alla torta. Arrivi, ti siedi, la serata
              è già partita.</Introduzione>

            <Pillole voci={OCCASIONI} />
            <Punti voci={COME_FUNZIONA} />

            <Bottone href="/prenota?tipo=tavolo" pieno classe="cta-prenota">
              Prenota un tavolo
            </Bottone>
          </div>
        </div>

        <div className={stili.serataSezioni}>
          <Titolo2 id="scegli-serata" misura="clamp(22px, 6vw, 30px)">
            Scegli la serata
          </Titolo2>
          <Altre>
            {SERATE.map((s) => (
              <Link key={s.codice} href={percorsoSerata(s)} style={{ background: `var(--${s.colore})` }}>
                {s.giorno} {s.nome}
              </Link>
            ))}
          </Altre>
          <p className="nota">
            Vieni da&nbsp;fuori Roma? Puoi chiedere anche <Link href="/navetta">la&nbsp;navetta</Link>.
          </p>

          <Titolo2 id="domande" misura="clamp(22px, 6vw, 30px)">
            Domande frequenti
          </Titolo2>
          <Domande voci={DOMANDE} />
        </div>
      </section>
    </>
  );
}
