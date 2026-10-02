# 08. UI / visual audit

Ambiente: build di produzione locale, Chromium, 360, 390, 768, 1280 e 1440 px. Schermate guardate con screenshot: elenco (mobile e desktop), filtri, dettaglio, foglio dei motivi, rifiutata, squadra, "Gestisci", analisi, home PR, dettaglio PR, `/pr/<codice>`, Wallet (fronte del biglietto in Apple Wallet, simulatore iOS).

## Difetti trovati e già corretti durante il lavoro (storico, non aperti)

| Difetto | Correzione |
|---|---|
| Home PR: quattro numeri in 3 + 1 | Griglia 2×2 sul telefono, 4 in fila altrove |
| Grafico: testi e linee ingranditi su schermo largo | Linee vettoriali a spessore costante, scritte in testo |
| Foglio "Gestisci" sul telefono senza "Copia il link", "Vedi i numeri", "Disattiva" | Pulsante secondario sempre visibile |
| Link dei PR in Analisi alti 18 px (minimo di legge 24); Giorno/Settimana/Mese 36 px | Bersagli da 44 px |
| `/pr/<codice>` senza titolo di pagina | `h1` per gli screen reader |
| CLS 0,272 con filtri nell'indirizzo (storico, blocco richieste) | Parte in caricamento; CLS 0 |

## Stato attuale

- **Coerenza:** i componenti nuovi (foglio, chip, tabella, grafico) usano i token del pannello (superfici scure, accento rosa per l'azione e per i moduli inviati). Nessuna deriva visiva rilevata fra Luca e PR.
- **Gerarchia:** una azione primaria per schermata (Conferma, o Invia conferma su WhatsApp); "Rifiuta" e "Cambia decisione" secondari; stato e provenienza ("PR Antonio" o "Diretta") in chip.
- **Wallet, fronte (RUNTIME-CONFIRMED, simulatore iOS, firma Apple vera, dati di esempio):** logo nitido, data in alto a destra, serata grande sopra la foto, TIPO e NOME, LOCALE e DALLE allineati, QR grande, colori leggibili. **Nome lungo e retro: NOT-VERIFIED.**
- **Audit automatico (design-web, tipografia-web):** 0 errori nuovi. Resta un falso positivo noto: il contrasto di "Tutte" (pulsante attivo crema con testo scuro) e il badge sulla barra mobile.

## Aperti

| ID | Difetto | Gravità |
|---|---|---|
| F-19 | "Vedi tutte su Telegram" sfora a 360/390 px (340 su 320, 370 su 350). Era già così | P3 |
| F-17 | Nessun `h1` nel dettaglio richiesta su telefono e tablet (il dettaglio copre la pagina) | P3 |
| F-16 | Pagina 404 e di errore predefinite di Next, senza il marchio; manca `apple-touch-icon` | P3 |
| F-08 | Home da 4,6 a 5,0 MB (video e foto), budget consigliato 1 MB | P2 |

Non verificati: stati hover, focus, disabilitato e caricamento uno per uno; navigazione da tastiera; screen reader; Safari e Firefox.
