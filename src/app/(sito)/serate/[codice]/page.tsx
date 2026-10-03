import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Bottone } from "@/componenti/sito/Bottone";
import { CardMappa } from "@/componenti/sito/CardMappa";
import { perPrenotare } from "@/componenti/sito/CardSerata";
import { DatiBriciole } from "@/componenti/DatiBriciole";
import { Indietro } from "@/componenti/sito/Indietro";
import { Altre, Azioni, Dati, Domande, Introduzione, Punti, Titolo2 } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Pagina.module.css";
import { LOCALE, percorsoSerata, SERATE } from "@/contenuti/sito";
import type { NotteSerata } from "@/lib/calendario-serate";
import { prezzoBraccialetto } from "@/lib/prezzo-braccialetto";
import { metadatiPagina } from "@/lib/seo";

export function generateStaticParams() {
  return SERATE.map((serata) => ({ codice: serata.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params;
  const serata = SERATE.find((s) => s.slug === codice);

  return serata === undefined
    ? {}
    : metadatiPagina({
        percorso: percorsoSerata(serata),
        titolo: `Serate ${serata.giorno.toLowerCase()} a Roma: ${serata.nome} al ROOM26 - Luca California`,
        descrizione: serata.presentazione,
      });
}

const ARTICOLO: Record<string, string> = { Giovedì: "Il", Venerdì: "Il", Sabato: "Il", Domenica: "La" };

function comeEntri(prezzo: string | null) {
  return [
    {
      titolo: "Tavolo",
      testo:
        "Per te e il tuo gruppo, misto, solo ragazzi o solo ragazze. Scegli la fascia di budget a persona e dimmi se c'è un'occasione da festeggiare.",
    },
    {
      titolo: "Bracciale VIP",
      testo: `Accesso all'area tavoli dietro la consolle, senza prenotare il tavolo.${prezzo === null ? "" : ` ${prezzo}`}`,
    },
    { titolo: "Lista", testo: "Ingresso in pista, senza tavolo." },
  ];
}

export default async function PaginaSerata({ params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params;
  const serata = SERATE.find((s) => s.slug === codice);

  if (serata === undefined) {
    notFound();
  }

  const colore = `var(--${serata.colore})`;
  const altre = SERATE.filter((s) => s.codice !== serata.codice);
  const prezzo = prezzoBraccialetto(serata.codice as NotteSerata, "Misti");
  const articolo = ARTICOLO[serata.giorno] ?? "Il";
  const giornoMinuscolo = serata.giorno.toLowerCase();
  const domande = [
    {
      domanda: `Che serata c'è ${articolo.toLowerCase()} ${giornoMinuscolo} a Roma?`,
      risposta: `Al ROOM26 c'è ${serata.nome}, con ${serata.genere.toLowerCase()}.`,
    },
    {
      domanda: "Come prenoto una serata con te?",
      risposta:
        "Scegli tavolo, bracciale VIP o lista e compili il modulo in circa mezzo minuto. Ti rispondo io su WhatsApp e, quando confermo, il biglietto ti arriva da aggiungere al Wallet. Sul sito non si paga niente.",
    },
    {
      domanda: "Qual è l'età minima?",
      risposta: "L'età minima per entrare è 18 anni.",
    },
    ...(prezzo === null
      ? []
      : [
          {
            domanda: `Quanto costa il bracciale VIP ${serata.giorno === "Venerdì" ? "il venerdì" : "il sabato"}?`,
            risposta: prezzo,
          },
        ]),
    {
      domanda: "Che differenza c'è tra tavolo, bracciale VIP e lista?",
      risposta:
        "Il tavolo è per il tuo gruppo. Il bracciale VIP dà accesso all'area tavoli dietro la consolle, senza prenotare il tavolo. La lista è l'ingresso in pista.",
    },
    {
      domanda: "C'è la navetta?",
      risposta: (
        <>
          Sì: se vieni da&nbsp;fuori Roma posso organizzarla da&nbsp;qualsiasi zona. Disponibilità, orari e&nbsp;costo li
          concordiamo insieme. <Link href="/navetta">Scopri la&nbsp;navetta</Link>.
        </>
      ),
    },
  ];

  return (
    <>
      <DatiBriciole voci={[{ nome: "Home", percorso: "/" }, { nome: "Le serate", percorso: "/serate" }, { nome: serata.nome, percorso: percorsoSerata(serata) }]} />
      <Indietro testo="Tutte le serate" dove="/serate" />

      <section className="wrap" style={{ padding: "10px 20px 56px" }}>
        <div className={stili["serata-griglia"]}>
          <div className={stili.serata} style={{ background: colore }}>
            <div>
              <Image
                src={serata.copertina}
                alt={serata.alt}
                width={1280}
                height={1088}
                sizes="(min-width: 860px) 50vw, 100vw"
                priority
                style={serata.copertinaPosizione === undefined ? undefined : { objectPosition: serata.copertinaPosizione }}
              />
              <span className={stili.targhetta} style={{ color: colore }}>
                {serata.etichetta}
              </span>
            </div>

            <div className={stili.banda}>
              <h1 className="display" style={serata.codice === "sabato" ? { fontStretch: "100%" } : undefined} tabIndex={-1}>
                <span className={stili.giorno}>{serata.giorno}</span> {serata.nome}
              </h1>
              <p className={stili.musica}>{serata.genere}</p>
            </div>
          </div>

          <div>
            <div style={{ marginTop: 22 }}>
              <Introduzione>{serata.presentazione}</Introduzione>
            </div>

            <Dati voci={[["Quando", serata.quando]]} />
            <CardMappa nome={LOCALE.nome} indirizzo={LOCALE.indirizzo} lat={LOCALE.lat} lon={LOCALE.lon} />

            <Azioni>
              <Bottone href={perPrenotare(serata.codice, "tavolo")} classe="cta-prenota">
                Prenota il tavolo
              </Bottone>
              <Bottone href={perPrenotare(serata.codice, "braccialetto")} aspetto="contorno" classe="cta-prenota">
                Prenota il bracciale VIP
              </Bottone>
              <Bottone href={perPrenotare(serata.codice)} aspetto="contorno" classe="cta-prenota">
                Entra in lista
              </Bottone>
              <Bottone href={`/api/calendario/${serata.codice}`} aspetto="chiaro" esterno>
                Aggiungi al calendario
              </Bottone>
            </Azioni>

            <div style={{ marginTop: 36 }}>
              <p className="occhiello" style={{ color: "var(--muted)" }}>
                Le altre serate
              </p>
              <Altre>
                {altre.map((a) => (
                  <Link key={a.codice} href={percorsoSerata(a)} style={{ background: `var(--${a.colore})` }}>
                    {a.breve} {a.nome}
                  </Link>
                ))}
              </Altre>
            </div>
          </div>
        </div>

        <div className={stili.serataSezioni}>
          <Titolo2 id="musica" misura="clamp(22px, 6vw, 30px)">
            {`La musica ${articolo.toLowerCase() === "la" ? "della" : "del"} ${giornoMinuscolo}`}
          </Titolo2>
          <Introduzione>{serata.musicaTesto}</Introduzione>
          <p className="nota">Ogni giorno al ROOM26 c&apos;è una musica diversa:</p>
          <ul className={stili.settimana}>
            {SERATE.map((s) => (
              <li key={s.codice}>
                {s.codice === serata.codice ? (
                  <span aria-current="page">
                    <strong>{s.giorno}</strong> {s.nome} <em>{s.genere}</em>
                  </span>
                ) : (
                  <Link href={percorsoSerata(s)}>
                    <strong>{s.giorno}</strong> {s.nome} <em>{s.genere}</em>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <Titolo2 id="come-entri" misura="clamp(22px, 6vw, 30px)">
            Come entri con me
          </Titolo2>
          <Punti voci={comeEntri(prezzo)} />
          <p className="nota">
            Vuoi sapere come funzionano i&nbsp;tavoli?{" "}
            <Link href="/tavoli">Guarda qui</Link>.
          </p>
          <div>
            <Bottone href={perPrenotare(serata.codice)} classe="cta-prenota">
              Prenota con me
            </Bottone>
          </div>
          <p className="nota">
            Vieni da&nbsp;fuori Roma? <Link href="/navetta">Scopri la&nbsp;navetta</Link>
          </p>

          <Titolo2 id="domande" misura="clamp(22px, 6vw, 30px)">
            Domande frequenti
          </Titolo2>
          <Domande voci={domande} />
        </div>
      </section>
    </>
  );
}
