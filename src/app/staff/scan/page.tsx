import { LettoreQr } from "@/componenti/LettoreQr";
import { AvvisoExtra } from "@/componenti/pannello/Messaggi";
import { Testata } from "@/componenti/pannello/Testata";

export const metadata = {
  title: "Ingresso, Luca California",
  robots: { index: false, follow: false },
};

/** La porta senza password, per provare il biglietto. Quella vera è nel pannello. */
export default function Scan() {
  return (
    <main className="pagina senza-barra">
      <AvvisoExtra>Extra, non incluso: il lettore QR alla porta, se un giorno servirà.</AvvisoExtra>
      <Testata occhiello="Luca California" titolo="Ingresso" />
      <LettoreQr />
    </main>
  );
}
