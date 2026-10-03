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
      /*
       * I domini secondari (il vecchio indirizzo di prova e quello di Vercel)
       * servono lo stesso sito, ma non devono comparire nei risultati: il
       * canonical di ogni pagina già indica il dominio vero, e questa
       * intestazione lo conferma anche per i motori che il canonical lo
       * trattano solo come un suggerimento. Il dominio principale NON è qui.
       */
      {
        source: "/:percorso*",
        has: [{ type: "host", value: "lucacalifornia.satoshiweb.it" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:percorso*",
        has: [{ type: "host", value: "lucacurellapr.vercel.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      /*
       * I file della Hero hanno il nome legato al contenuto (hero-<impronta>.ext,
       * vedi scripts/genera-apertura.mjs): se il video cambia, cambia il nome.
       * Si possono quindi tenere in cache per un anno senza rivalidarli a ogni
       * visita, come faceva "max-age=0" per i file di public/.
       */
      {
        source: "/video/:file(hero-.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  /**
   * Gli indirizzi delle serate sono il giorno, non il nome del format.
   * I due vecchi indirizzi rimandano ai nuovi in modo permanente.
   */
  async redirects() {
    return [
      { source: "/serate/milkshake", destination: "/serate/giovedi", permanent: true },
      { source: "/serate/bailame", destination: "/serate/domenica", permanent: true },
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
