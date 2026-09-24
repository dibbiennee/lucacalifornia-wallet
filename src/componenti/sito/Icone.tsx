/**
 * Le icone disegnate delle tessere.
 *
 * Sono disegni e non file: prendono il colore di chi le contiene, restano
 * nitide a qualunque misura e non costano una richiesta in più.
 */

/** La navetta. I finestrini prendono il colore del fondo della tessera. */
export function Navetta({ colore }: { readonly colore: string }) {
  return (
    <svg viewBox="0 0 120 64" width="75" height="40" aria-hidden focusable="false">
      <rect x="4" y="6" width="108" height="42" rx="12" fill="currentColor" />
      <path d="M92 6h8a12 12 0 0 1 12 12v8H92z" fill={colore} opacity=".85" />
      <rect x="14" y="14" width="18" height="14" rx="3" fill={colore} opacity=".85" />
      <rect x="38" y="14" width="18" height="14" rx="3" fill={colore} opacity=".85" />
      <rect x="62" y="14" width="18" height="14" rx="3" fill={colore} opacity=".85" />
      <rect x="4" y="34" width="108" height="4" fill="#000" opacity=".25" />
      <circle cx="28" cy="50" r="10" fill="#000" />
      <circle cx="28" cy="50" r="4.5" fill="#f5f2ec" />
      <circle cx="90" cy="50" r="10" fill="#000" />
      <circle cx="90" cy="50" r="4.5" fill="#f5f2ec" />
      <rect x="106" y="30" width="6" height="6" rx="2" fill="#ffe27a" />
    </svg>
  );
}

/** I due calici del brindisi, per il Capodanno. */
export function Brindisi() {
  return (
    <svg viewBox="16 0 92 64" width="66" height="40" aria-hidden focusable="false">
      <g fill="currentColor">
        <path d="M44 10h18l-3 22a6 6 0 0 1-12 0z" transform="rotate(-14 53 36)" />
        <rect x="51" y="38" width="3" height="16" rx="1.5" transform="rotate(-14 53 36)" />
        <rect x="44" y="53" width="17" height="3.5" rx="1.75" transform="rotate(-14 53 36)" />
        <path d="M60 10h18l-3 22a6 6 0 0 1-12 0z" transform="rotate(14 69 36)" />
        <rect x="67" y="38" width="3" height="16" rx="1.5" transform="rotate(14 69 36)" />
        <rect x="60" y="53" width="17" height="3.5" rx="1.75" transform="rotate(14 69 36)" />
      </g>
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M61 2v5M51 4l3 4M71 4l-3 4" />
      </g>
      <g fill="currentColor">
        <circle cx="28" cy="14" r="2.5" />
        <circle cx="96" cy="20" r="2.5" />
        <circle cx="20" cy="34" r="1.8" />
        <circle cx="104" cy="40" r="1.8" />
        <path d="M34 26l1.6 3.4 3.4 1.6-3.4 1.6L34 36l-1.6-3.4L29 31l3.4-1.6z" />
        <path d="M88 6l1.6 3.4 3.4 1.6-3.4 1.6L88 16l-1.6-3.4L83 11l3.4-1.6z" />
      </g>
    </svg>
  );
}

/** Il pass dello staff, per la pagina dei PR. */
export function Pass({ colore }: { readonly colore: string }) {
  return (
    <svg viewBox="34 0 52 64" width="37" height="40" aria-hidden focusable="false">
      <path d="M46 0l14 20M74 0L60 20" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="51" y="16" width="18" height="8" rx="2" fill="currentColor" />
      <rect x="36" y="22" width="48" height="40" rx="7" fill="currentColor" />
      <circle cx="50" cy="38" r="7" fill={colore} />
      <rect x="61" y="33" width="16" height="4" rx="2" fill={colore} />
      <rect x="61" y="41" width="11" height="4" rx="2" fill={colore} />
      <text
        x="60"
        y="58"
        textAnchor="middle"
        fontFamily="Archivo, Arial, sans-serif"
        fontWeight="900"
        fontSize="9"
        fill={colore}
        letterSpacing="1"
      >
        STAFF
      </text>
    </svg>
  );
}

/** Il gallone del ritorno indietro. */
export function Gallone() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
