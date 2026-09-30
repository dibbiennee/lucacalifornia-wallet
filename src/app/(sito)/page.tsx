import { DatiStrutturati } from "@/componenti/DatiStrutturati";
import { FoglioAvvisami } from "@/componenti/sito/FoglioAvvisami";
import { Apertura } from "@/componenti/sito/sezioni/Apertura";
import {
  ChiELuca,
  ComeFunziona,
  Halloween,
  Serate,
  SpecialGuest,
  TuttoIlResto,
} from "@/componenti/sito/sezioni/Home";

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
            titolo="Ti avviso appena esce il programma"
            spiegazione="Quando pubblico data e biglietti, lo sai prima degli altri. Niente messaggi per altro."
            aspetto="nero"
          />
        }
      />
      <SpecialGuest
        avvisami={
          <FoglioAvvisami
            tipo="special_guest"
            etichetta="Avvisami"
            titolo="Ti avviso appena esce il nome"
            spiegazione="Quando c'è un ospite, lo sai prima degli altri. Niente messaggi per altro."
          />
        }
      />
      <TuttoIlResto />
      <ComeFunziona />
      <ChiELuca />
    </>
  );
}
