/**
 * Identificativi Apple del pass. Stanno in variabili d'ambiente, non nel
 * codice: il Team ID è un dato dell'account, non del progetto.
 */
export interface ConfigurazionePass {
  readonly passTypeIdentifier: string;
  readonly teamIdentifier: string;
}

export function leggiConfigurazionePass(): ConfigurazionePass {
  const passTypeIdentifier = process.env["PASS_TYPE_IDENTIFIER"];
  const teamIdentifier = process.env["APPLE_TEAM_IDENTIFIER"];

  if (!passTypeIdentifier) {
    throw new Error("Manca la variabile d'ambiente PASS_TYPE_IDENTIFIER");
  }
  if (!teamIdentifier) {
    throw new Error("Manca la variabile d'ambiente APPLE_TEAM_IDENTIFIER");
  }

  return { passTypeIdentifier, teamIdentifier };
}

/** Nome dell'emittente, mostrato da iOS nelle notifiche del pass. */
export const NOME_ORGANIZZAZIONE = "Luca California";

/** Testo accanto al logo, in alto a sinistra sul biglietto. */
export const TESTO_LOGO = "LUCA CALIFORNIA";

/** Profilo Instagram mostrato sul retro. */
export const INSTAGRAM = "@lucacurella_ninfeo";
