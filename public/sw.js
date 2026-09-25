/*
 * Il service worker: serve solo a ricevere il push mentre il pannello è
 * chiuso e a mostrare la notifica. Non fa cache, non intercetta richieste:
 * il resto del sito lavora come se lui non ci fosse. Ogni pagina del
 * pannello arriva sempre fresca dalla rete, a ogni deploy: non serve mai
 * togliere l'icona dalla schermata home e rimetterla.
 *
 * Le due righe qui sotto sono l'unica parte che riguarda lui stesso:
 * prendono subito il comando appena installata una versione nuova di
 * questo file, invece di aspettare che tutte le schede del pannello siano
 * chiuse. Senza, un telefono con il pannello aperto da giorni potrebbe
 * restare sulla versione vecchia del service worker.
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (evento) => evento.waitUntil(self.clients.claim()));

self.addEventListener("push", (evento) => {
  let dati = { titolo: "Luca California", corpo: "Nuova richiesta", url: "/pannello/richieste" };

  try {
    dati = { ...dati, ...evento.data.json() };
  } catch {
    // Un push senza corpo leggibile mostra comunque l'avviso generico.
  }

  evento.waitUntil(
    self.registration.showNotification(dati.titolo, {
      body: dati.corpo,
      icon: "/loghi/icona-192.png",
      badge: "/loghi/icona-192.png",
      data: { url: dati.url },
    }),
  );
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const url = evento.notification.data && evento.notification.data.url ? evento.notification.data.url : "/pannello";

  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((finestre) => {
      for (const finestra of finestre) {
        if (finestra.url.includes("/pannello") && "focus" in finestra) {
          finestra.navigate(url);
          return finestra.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
