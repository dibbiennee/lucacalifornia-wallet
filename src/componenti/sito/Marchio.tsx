/**
 * Il marchio: un quadrato pieno con tre tagli.
 *
 * È disegnato e non un file immagine, così prende il colore del testo che lo
 * circonda e resta nitido a qualunque misura. Gli stessi quattro poligoni
 * stanno in scripts/genera-immagini.mjs per le icone del biglietto.
 */
export function Marchio({ misura = 30 }: { readonly misura?: number }) {
  return (
    <svg
      viewBox="0 0 700 700"
      width={misura}
      height={misura}
      fill="currentColor"
      aria-hidden
      focusable="false"
      style={{ flex: "none" }}
    >
      <polygon points="0,0 700,0 700,173" />
      <polygon points="0,0 700,325 700,525" />
      <polygon points="0,0 351,700 0,700" />
      <polygon points="351,700 700,525 700,700" />
    </svg>
  );
}
