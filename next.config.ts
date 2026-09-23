import type { NextConfig } from "next";

const config: NextConfig = {
  /**
   * passkit-generator usa node-forge e le API di Node: va lasciata fuori
   * dal bundle del server, non impacchettata.
   */
  serverExternalPackages: ["passkit-generator"],

  /**
   * Intestazioni di sicurezza.
   *
   * La CSP tiene 'unsafe-inline' sugli script perché Next mette in pagina i
   * dati per l'idratazione come script in linea: toglierlo richiede i nonce
   * e rompe la pagina. Vale comunque, perché blocca il caricamento di script
   * da domini esterni, che è il caso che conta.
   */
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "media-src 'self'",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:percorso*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=()" },
        ],
      },
    ];
  },

  /**
   * Le immagini del pass vivono su disco in assets/pass. Vercel include in una
   * funzione solo i file che riesce a tracciare leggendo il codice, e un
   * percorso costruito a runtime non lo vede: qui glieli dichiariamo a mano.
   */
  outputFileTracingIncludes: {
    "/api/pass/demo": ["./assets/pass/**/*"],
    "/api/pass/[token]": ["./assets/pass/**/*"],
  },
};

export default config;
