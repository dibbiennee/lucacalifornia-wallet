import { Capodanno } from "@/componenti/sezioni/Extra";
import { Modulo } from "@/componenti/sezioni/Modulo";

export const metadata = { title: "Capodanno al Room 26 - Luca California" };

export default function PaginaCapodanno() {
  return (
    <>
      <Capodanno livello={1} />
      <Modulo />
    </>
  );
}
