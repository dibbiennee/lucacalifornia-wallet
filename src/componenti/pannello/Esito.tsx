import stili from "./Esito.module.css";

export interface DatiEsito {
  readonly valido: boolean;
  readonly giaEntrato?: boolean;
  readonly nome?: string;
  readonly tipo?: string;
  readonly serata?: string;
  readonly sala?: string;
  readonly ora?: string;
}

/**
 * La risposta della porta, a tutto schermo.
 *
 * Un tocco in qualunque punto passa al prossimo: nessun bersaglio da
 * centrare, perché chi sta alla porta ha una mano sola libera.
 *
 * "Già dentro" esiste nel componente ma oggi non arriva mai: per sapere chi
 * è passato serve il database. Quando ci sarà, basterà che /api/verifica lo
 * dica.
 */
export function Esito({ esito, avanti }: { readonly esito: DatiEsito; readonly avanti: () => void }) {
  const come = esito.giaEntrato === true ? "gia" : esito.valido ? "ok" : "no";
  const parola = come === "gia" ? "GIÀ DENTRO" : come === "ok" ? "ENTRA" : "NO";

  return (
    <button type="button" className={`${stili.esito} ${stili[come]}`} onClick={avanti}>
      <strong>{parola}</strong>

      {esito.valido ? (
        <>
          <b>{esito.nome}</b>
          {esito.tipo !== undefined && <span>{esito.tipo}</span>}
          {esito.sala !== undefined && <span>{esito.sala}</span>}
          {esito.serata !== undefined && <small>{esito.serata}</small>}
          {esito.ora !== undefined && <small>Entrato alle {esito.ora}</small>}
        </>
      ) : (
        <b>Biglietto non valido</b>
      )}

      <em className={stili.tocca}>Tocca per il prossimo</em>
    </button>
  );
}
