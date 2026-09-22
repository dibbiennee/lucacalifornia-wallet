import { LettoreQr } from "@/componenti/LettoreQr";

export const metadata = {
  title: "Ingresso, Luca California",
  robots: { index: false, follow: false },
};

/** La porta senza password, per provare il biglietto. Quella vera è nel pannello. */
export default function Scan() {
  return <LettoreQr />;
}
