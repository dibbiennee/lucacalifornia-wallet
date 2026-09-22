import type { NextConfig } from "next";

const config: NextConfig = {
  /**
   * passkit-generator usa node-forge e le API di Node: va lasciata fuori
   * dal bundle del server, non impacchettata.
   */
  serverExternalPackages: ["passkit-generator"],

  /**
   * Le immagini del pass vivono su disco in assets/pass. Vercel include in una
   * funzione solo i file che riesce a tracciare leggendo il codice, e un
   * percorso costruito a runtime non lo vede: qui glieli dichiariamo a mano.
   */
  outputFileTracingIncludes: {
    "/api/pass/demo": ["./assets/pass/**/*"],
  },
};

export default config;
