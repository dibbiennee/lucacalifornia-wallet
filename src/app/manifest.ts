import type { MetadataRoute } from "next";

/**
 * Serve a installare il pannello sulla schermata home del telefono, come
 * chiede il brief: Luca lo apre come un'app, non cercando un indirizzo.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pannello Luca California",
    short_name: "Pannello",
    description: "Liste, tavoli e porta delle serate di Luca California.",
    start_url: "/pannello",
    scope: "/pannello",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait",
    icons: [
      { src: "/loghi/icona-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/loghi/icona-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
