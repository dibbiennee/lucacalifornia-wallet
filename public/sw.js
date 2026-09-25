/*
 * Il service worker: serve solo a ricevere il push mentre il pannello è
 * chiuso e a mostrare la notifica. Non fa cache, non intercetta richieste:
 * il resto del sito lavora come se lui non ci fosse.
 */

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
