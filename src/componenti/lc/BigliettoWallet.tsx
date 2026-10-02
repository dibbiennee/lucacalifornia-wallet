import stili from "./Biglietto.module.css";

/**
 * L'anteprima del biglietto che il cliente aggiunge al Wallet.
 *
 * Il QR qui è decorativo: il vero nasce dentro il pass, quando si conferma, e
 * prima di allora non esiste. Si ricava dall'identificativo della richiesta,
 * così per la stessa richiesta resta sempre uguale e non "balla" a ogni
 * ridisegno. Non va mai letto da un lettore: è un segnaposto, e la didascalia
 * lo dice.
 */

const LATO = 11;

function cella(id: string, x: number, y: number): boolean {
  const inQuadrato = (cx: number, cy: number) => x >= cx && x < cx + 3 && y >= cy && y < cy + 3;

  // I tre quadrati agli angoli, come in un QR vero.
  if (inQuadrato(0, 0) || inQuadrato(LATO - 3, 0) || inQuadrato(0, LATO - 3)) {
    return true;
  }

  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }

  return (((h >>> ((x * 7 + y * 3) % 29)) ^ (x * y + x + y)) & 1) === 1;
}

export function BigliettoWallet({
  id,
  notte,
  giorno,
  tipo,
  locale,
  timbro,
}: {
  readonly id: string;
  readonly notte: string;
  readonly giorno: string;
  readonly tipo: string;
  readonly locale: string;
  /** Vero subito dopo l'invio: compare il timbro "INVIATO". */
  readonly timbro: boolean;
}) {
  const quadrati: { x: number; y: number }[] = [];
  for (let y = 0; y < LATO; y++) {
    for (let x = 0; x < LATO; x++) {
      if (cella(id, x, y)) {
        quadrati.push({ x, y });
      }
    }
  }

  return (
    <figure className={stili.biglietto}>
      <div className={stili.testo}>
        <div className={stili.sopra}>
          <span>Luca California</span>
          <span>{locale}</span>
        </div>
        {/* Il nome lungo ("INTERNATIONAL") rimpicciolisce per starci, non si spezza: vedi .notte[data-lunga]. */}
        <div className={stili.notte} data-lunga={notte.length > 10 ? "" : undefined}>
          {notte}
        </div>
        <dl className={stili.dati}>
          <div>
            <dt>Quando</dt>
            <dd>{giorno}</dd>
          </div>
          <div>
            <dt>Ingresso</dt>
            <dd>{tipo}</dd>
          </div>
        </dl>
      </div>

      <svg className={stili.qr} viewBox={`0 0 ${LATO} ${LATO}`} role="img" aria-label="Codice QR di esempio, non valido">
        <rect width={LATO} height={LATO} fill="#ffffff" />
        {quadrati.map(({ x, y }) => (
          <rect key={`${x}-${y}`} x={x + 0.04} y={y + 0.04} width={0.92} height={0.92} rx={0.1} fill="#0a0a0b" />
        ))}
      </svg>

      <figcaption className={stili.didascalia}>Anteprima biglietto Wallet</figcaption>

      {timbro && <div className={`lc-stamp ${stili.timbro}`}>INVIATO</div>}
    </figure>
  );
}
