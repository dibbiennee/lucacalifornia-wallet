/**
 * Copiare negli appunti può non funzionare: senza https, in una scheda che non
 * ha il fuoco, o con i permessi negati. Prima la strada moderna, poi quella
 * vecchia che funziona anche senza https. Torna se è riuscita o no, così chi
 * chiama può dirlo invece di lasciare il pulsante muto.
 */
export async function negliAppunti(testo: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(testo);
    return true;
  } catch {
    // Si continua sotto.
  }

  try {
    const area = document.createElement("textarea");
    area.value = testo;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const fatto = document.execCommand("copy");
    document.body.removeChild(area);
    return fatto;
  } catch {
    return false;
  }
}
