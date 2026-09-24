import { redirect } from "next/navigation";

/**
 * Il pannello si apre sulle richieste.
 *
 * Prima si apriva su "Oggi", che raccontava la serata. Ma il pannello serve
 * prima di tutto a rispondere a chi ha prenotato: la prima cosa che si vede
 * aprendolo deve essere chi aspetta una risposta.
 *
 * I numeri della serata non sono spariti: stanno in "Stasera".
 */
export default function Pannello() {
  redirect("/pannello/richieste");
}
