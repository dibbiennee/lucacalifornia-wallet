import Link from "next/link";
import type { ReactNode } from "react";

import stili from "./CardRichiesta.module.css";

/**
 * La scheda di una richiesta, in elenco.
 *
 * "destra" è quello che cambia da una schermata all'altra: in Richieste è
 * l'etichetta di stato, in Stasera è la sala, in Oggi era l'ora.
 */
export function CardRichiesta({
  dove,
  nome,
  destra,
  riassunto,
  messaggio,
  nota,
}: {
  readonly dove: string;
  readonly nome: string;
  readonly destra?: ReactNode;
  readonly riassunto?: string;
  readonly messaggio?: string;
  readonly nota?: string;
}) {
  return (
    <Link href={dove} className={stili.card}>
      <b className={stili.nome}>{nome}</b>
      {destra !== undefined && <span className={stili.destra}>{destra}</span>}
      {riassunto !== undefined && riassunto !== "" && (
        <span className={stili.riga}>{riassunto}</span>
      )}
      {messaggio !== undefined && <span className={stili.messaggio}>{messaggio}</span>}
      {nota !== undefined && <span className={stili["riga-piccola"]}>{nota}</span>}
    </Link>
  );
}
