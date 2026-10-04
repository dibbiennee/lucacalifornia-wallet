/**
 * Il manifest del pannello: serve ad Android (e a Chrome) per aggiungerlo alla Home a tutto schermo,
 * con il nome e l'icona giusti. Parte sempre da /pannello, che porta alla pagina giusta
 * (l'accesso, se non si è dentro). L'ambito è solo /pannello: il resto del sito non c'entra.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const manifest = {
    name: "Luca California, pannello",
    short_name: "Pannello",
    start_url: "/pannello",
    scope: "/pannello",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      { src: "/loghi/icona-192.png", sizes: "192x192", type: "image/png" },
      { src: "/loghi/icona-512.png", sizes: "512x512", type: "image/png" },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
