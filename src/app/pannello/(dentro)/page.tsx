import { redirect } from "next/navigation";

import { sessioneOAccesso } from "@/lib/pannello/sessione";

/**
 * Dove si arriva aprendo /pannello, o subito dopo l'accesso.
 *
 * Luca si apre sulle richieste: il pannello serve prima di tutto a rispondere
 * a chi ha prenotato, quindi la prima cosa che vede è chi aspetta. Un PR si
 * apre sulla sua home, con i suoi numeri. Chi sia lo decide il server.
 */
export default async function Pannello() {
  const sessione = await sessioneOAccesso();

  redirect(sessione.ruolo === "owner" ? "/pannello/richieste" : "/pannello/home");
}
