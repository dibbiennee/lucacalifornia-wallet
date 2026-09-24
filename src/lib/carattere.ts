import localFont from "next/font/local";

/**
 * Archivo, ritagliato su misura per questo sito.
 *
 * Lo ospitiamo noi invece di prenderlo da Google: il file che serve loro pesa
 * 88 KB ed era la cosa più pesante della prima schermata. Dentro ci sono le
 * larghezze strette (l'asse va da 62, il sito parte da 100) e i pesi sottili,
 * che non usiamo da nessuna parte. Tolti quelli, il file scende a 48 KB.
 *
 * Lo produce scripts/genera-carattere.py dal file ufficiale in
 * materiale/carattere/. Se serve un carattere che non c'è, si allarga
 * l'elenco lì e si rigenera.
 *
 * Il font è sotto SIL Open Font License: la licenza viaggia insieme al file,
 * in public/font/OFL.txt.
 */
export const carattere = localFont({
  src: "../../public/font/archivo-sito.woff2",
  variable: "--carattere",
  /* Il testo compare subito col carattere di ripiego e viene sostituito
     quando Archivo arriva: meglio leggere mezzo secondo prima. */
  display: "swap",
  weight: "400 900",
  style: "normal",
  /* Senza questa riga il browser non sa che il file sa allargarsi, e
     font-stretch sui titoli non farebbe niente. */
  declarations: [{ prop: "font-stretch", value: "100% 125%" }],
});
