import { redirect } from "next/navigation";

/**
 * /pr da solo non è più una pagina: il link di un PR è /pr/<codice>. Chi ha in
 * mano il vecchio indirizzo finisce sul sito, non su un modulo senza PR.
 */
export default function PrSenzaCodice(): never {
  redirect("/");
}
