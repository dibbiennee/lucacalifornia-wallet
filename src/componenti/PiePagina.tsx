import Link from "next/link";

import { INSTAGRAM, INSTAGRAM_URL, MARCHIO } from "@/contenuti/sito";

export function PiePagina() {
  return (
    <footer style={{ background: "var(--blu-piede)", padding: "3rem var(--margine) 6rem" }}>
      <div className="dentro">
        <p
          style={{
            fontFamily: "var(--carattere-titoli), Impact, sans-serif",
            fontSize: "clamp(2.4rem, 14vw, 4rem)",
            lineHeight: 0.92,
            margin: "0 0 1.5rem",
            textTransform: "uppercase",
          }}
        >
          {MARCHIO.riga1}
          <br />
          {MARCHIO.riga2}
        </p>

        <p style={{ margin: "0 0 1.5rem" }}>
          <a href={INSTAGRAM_URL} style={{ fontWeight: 600 }}>
            Instagram @{INSTAGRAM}
          </a>
        </p>

        <p className="debole" style={{ margin: 0, fontSize: "0.9375rem" }}>
          <Link href="/privacy">Privacy</Link>
          {"  ·  "}
          <Link href="/cookie">Cookie</Link>
        </p>

        <p className="debole" style={{ margin: "0.4rem 0 0", fontSize: "0.9375rem", opacity: 0.7 }}>
          Sito di satoshiweb.it
        </p>
      </div>
    </footer>
  );
}
