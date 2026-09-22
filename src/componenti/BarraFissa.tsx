import Link from "next/link";

/**
 * La barra fissa in basso, su telefono.
 *
 * Le regole stanno nel CSS e non in linea: uno stile scritto in linea batte
 * il foglio di stile, e la barra non spariva più sul computer.
 *
 * Usa le zone sicure di iOS: senza, su iPhone finisce sotto la barra di
 * Safari e i pulsanti diventano impossibili da premere.
 */
export function BarraFissa() {
  return (
    <div className="barra-fissa">
      <Link href="/#prenota" className="barra-pieno">
        PRENOTA
      </Link>
      <Link href="/#prenota" className="barra-vuoto">
        LISTA
      </Link>
    </div>
  );
}
