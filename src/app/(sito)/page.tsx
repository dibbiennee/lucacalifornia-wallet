import type { Metadata } from "next";

import { DatiStrutturati } from "@/componenti/DatiStrutturati";
import { FoglioAvvisami } from "@/componenti/sito/FoglioAvvisami";
import { Apertura } from "@/componenti/sito/sezioni/Apertura";
import {
  ChiELuca,
  ComeFunziona,
  Halloween,
  LeFoto,
  Serate,
  SpaccaPagina,
  SpecialGuest,
  TuttoIlResto,
} from "@/componenti/sito/sezioni/Home";

import { DESCRIZIONE_HOME, metadatiPagina, TITOLO_HOME } from "@/lib/seo";

export const metadata: Metadata = metadatiPagina({ percorso: "/", titolo: TITOLO_HOME, descrizione: DESCRIZIONE_HOME });

export default function Home() {
  return (
    <>
      <DatiStrutturati />
      <Apertura />
      <Serate />
      <Halloween
        avvisami={
          <FoglioAvvisami
            tipo="halloween"
            etichetta="Avvisami"
            titolo="Ti avviso|appena esce|il programma"
            spiegazione="Quando pubblico data e biglietti, lo sai prima degli altri. Niente messaggi per altro."
          />
        }
      />
      <SpecialGuest />
      <TuttoIlResto />
      <ComeFunziona />
      <LeFoto />
      <SpaccaPagina />
      <ChiELuca />
    </>
  );
}
