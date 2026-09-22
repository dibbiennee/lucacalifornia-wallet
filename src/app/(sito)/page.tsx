import { Nastro } from "@/componenti/Nastro";
import { Apertura } from "@/componenti/sezioni/Apertura";
import { ComeFunziona } from "@/componenti/sezioni/ComeFunziona";
import { Galleria } from "@/componenti/sezioni/Galleria";
import {
  Capodanno,
  ChiELuca,
  DiventaPr,
  Estate,
  Navetta,
  SpecialGuest,
} from "@/componenti/sezioni/Extra";
import { Modulo } from "@/componenti/sezioni/Modulo";
import { Serate } from "@/componenti/sezioni/Serate";

export default function Home() {
  return (
    <>
      <Apertura />
      <Nastro />
      <Serate />
      <SpecialGuest />
      <Galleria />
      <ChiELuca />
      <Navetta />
      <Capodanno />
      <Estate />
      <DiventaPr />
      <ComeFunziona />
      <Modulo />
    </>
  );
}
