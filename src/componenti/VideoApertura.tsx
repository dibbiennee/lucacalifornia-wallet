import { HERO_VIDEO } from "@/contenuti/hero-video";

/**
 * Il video dell'apertura.
 *
 * UN SOLO VIDEO, VERTICALE, per telefono e computer. Sul telefono riempie lo
 * schermo, sul computer sta nel riquadro 9:16 accanto al testo (vedi
 * Apertura.module.css): è lo stesso filmato, quindi non c'è nessun taglio da
 * scegliere e nessun JavaScript che debba decidere quale scaricare.
 *
 * PARTE SUBITO, senza codice. Il tag e le sorgenti stanno nell'HTML, con
 * autoplay, muto, in loop: il browser comincia a scaricare appena legge la
 * pagina, e il video parte appena ha abbastanza dati, senza aspettare che la
 * pagina abbia finito di caricare. Prima c'era preload="none" e un avvio
 * all'evento load, che su una rete lenta faceva partire il video dopo 12
 * secondi. Il webm è il primo perché pesa meno; l'mp4 è per chi non lo legge.
 *
 * IL POSTER è il primo fotogramma esatto del video, già compresso: la foto che
 * si vede prima è quella da cui parte il filmato, senza stacco. È la stessa
 * immagine che Apertura.tsx mette sotto il video (e che si vede da sola a chi
 * ha chiesto meno movimento).
 *
 * SENZA AUDIO DENTRO: il video è muto. La musica è un file a parte (hero-*.m4a),
 * che parte dal tasto di TastoAudio (accanto a questo video in Apertura.tsx):
 * il loop finisce appena prima del drop, e col suono dentro si sarebbe tagliato lì.
 *
 * Chi ha chiesto meno movimento, o ha il risparmio dati acceso, non scarica il
 * video: il CSS lo nasconde (vedi Apertura.module.css) e questo piccolo script,
 * che gira subito dopo il tag, ne toglie le sorgenti prima che il browser ne
 * scarichi una parte. Se lo script non gira, il video resta nascosto dal CSS
 * (reduced motion) o parte come sempre (risparmio dati): nessuno dei due casi
 * rompe la pagina.
 */
const RISPARMIA = `(function(){var v=document.currentScript.previousElementSibling;if(!v||v.tagName!=="VIDEO")return;var c=navigator.connection;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||(c&&c.saveData)){v.pause();v.style.display="none";while(v.firstChild)v.removeChild(v.firstChild);v.load();}})();`;

export function VideoApertura() {
  return (
    <>
      <video
        className="apertura-media apertura-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={HERO_VIDEO.poster}
        width={HERO_VIDEO.larghezza}
        height={HERO_VIDEO.altezza}
        aria-hidden
        tabIndex={-1}
      >
        <source src={HERO_VIDEO.webm} type="video/webm" />
        <source src={HERO_VIDEO.mp4} type="video/mp4" />
      </video>
      <script dangerouslySetInnerHTML={{ __html: RISPARMIA }} />
    </>
  );
}
