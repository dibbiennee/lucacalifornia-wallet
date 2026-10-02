import type { ReactNode } from "react";

/**
 * Le icone del pannello, quelle del prototipo: tratto 1,8, set tipo Lucide.
 * Decorative: hanno sempre accanto un testo o un aria-label sul pulsante.
 */

function Icona({
  misura = 20,
  tratto = 1.8,
  children,
}: {
  readonly misura?: number;
  readonly tratto?: number;
  readonly children: ReactNode;
}) {
  return (
    <svg
      width={misura}
      height={misura}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={tratto}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  );
}

type Props = { readonly misura?: number; readonly tratto?: number };

export const IconaRichieste = (p: Props) => (
  <Icona {...p}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Icona>
);

export const IconaRiepilogo = (p: Props) => (
  <Icona {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 16v-5" />
    <path d="M12 16V8" />
    <path d="M17 16V6" />
  </Icona>
);

export const IconaAndamento = (p: Props) => (
  <Icona {...p}>
    <path d="M22 7l-8.5 8.5-5-5L2 17" />
    <path d="M16 7h6v6" />
  </Icona>
);

export const IconaSquadra = (p: Props) => (
  <Icona {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icona>
);

export const IconaCampanella = (p: Props) => (
  <Icona {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Icona>
);

export const IconaPuntini = (p: Props) => (
  <Icona tratto={2.2} {...p}>
    <path d="M5 12h.01" />
    <path d="M12 12h.01" />
    <path d="M19 12h.01" />
  </Icona>
);

export const IconaInvia = (p: Props) => (
  <Icona tratto={2} {...p}>
    <path d="m22 2-7 20-4-9-9-4z" />
    <path d="M22 2 11 13" />
  </Icona>
);

export const IconaTelefono = (p: Props) => (
  <Icona {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </Icona>
);

export const IconaMessaggio = (p: Props) => (
  <Icona {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </Icona>
);

export const IconaCopia = (p: Props) => (
  <Icona {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icona>
);

export const IconaSpunta = (p: Props) => (
  <Icona tratto={2.6} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icona>
);

export const IconaLink = (p: Props) => (
  <Icona {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Icona>
);

export const IconaEsci = (p: Props) => (
  <Icona {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </Icona>
);

export const IconaPiu = (p: Props) => (
  <Icona tratto={2.4} {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icona>
);

export const IconaIndietro = (p: Props) => (
  <Icona tratto={2} {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icona>
);

export const IconaAvanti = (p: Props) => (
  <Icona tratto={2} {...p}>
    <path d="m9 18 6-6-6-6" />
  </Icona>
);

export const IconaCasa = (p: Props) => (
  <Icona {...p}>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Icona>
);

export const IconaOrologio = (p: Props) => (
  <Icona {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icona>
);
