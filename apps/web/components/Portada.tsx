"use client";
// Portada con escena fija: al hacer scroll, la cámara se acerca a la cara del robot y avanzan los pasos.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Robot, type Expresion } from "./Robot";
import { MenuPrincipal } from "./Navegacion";
import { ruta } from "@/lib/rutas";
import { useTextos } from "./Textos";

/** Cara del robot en cada paso de la portada (los textos están en el diccionario). */
const CARAS: Expresion[] = ["agobio", "pensando", "feliz"];

function useEscribir(frases: string[]) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  useEffect(() => {
    const frase = frases[i];
    const t = setTimeout(
      () => {
        if (n < frase.length) setN(n + 1);
        else {
          setN(0);
          setI((i + 1) % frases.length);
        }
      },
      n < frase.length ? 45 : 1800,
    );
    return () => clearTimeout(t);
  }, [i, n, frases]);
  return { texto: frases[i].slice(0, n), siguiente: frases[(i + 1) % frases.length] };
}

export function Portada() {
  const escena = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const { idioma, t: textos } = useTextos();
  const t = textos.portada;
  const { texto, siguiente } = useEscribir(t.ordenes);
  const PASOS = t.pasos.map((x, i) => ({ n: String(i + 1).padStart(2, "0"), texto: x.texto, pantalla: x.pantalla, cara: CARAS[i] ?? "normal" }));

  useEffect(() => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const calcular = () => {
      const el = escena.current;
      if (!el || reducir) return;
      const r = el.getBoundingClientRect();
      const recorrido = r.height - window.innerHeight;
      setP(Math.max(0, Math.min(1, -r.top / Math.max(1, recorrido))));
    };
    calcular();
    window.addEventListener("scroll", calcular, { passive: true });
    window.addEventListener("resize", calcular);
    return () => {
      window.removeEventListener("scroll", calcular);
      window.removeEventListener("resize", calcular);
    };
  }, []);

  // 0 → 0.35: plano general. 0.35 → 1: acercamiento a la cara y pasos.
  const zoom = Math.max(0, Math.min(1, (p - 0.3) / 0.35));
  const fase2 = p > 0.42;
  const paso = Math.min(PASOS.length - 1, Math.max(0, Math.floor(((p - 0.42) / 0.58) * PASOS.length)));
  const actual = fase2 ? PASOS[paso] : null;

  return (
    <>
      <header className="ah-nav">
        <Link href={ruta(idioma, "/")} className="ah-logo" aria-label={textos.nav.inicio}>
          <span className="ah-logo-caja" aria-hidden="true">
            <i />
            <i />
          </span>
          PODA
        </Link>
        <MenuPrincipal idioma={idioma} t={textos.nav} />
        <Link href={ruta(idioma, "/conectar/")} className="ah-lanzar">
          <span aria-hidden="true">••</span> {textos.nav.conectar}
        </Link>
      </header>

      <section ref={escena} className="ah-escena" aria-label={t.aria}>
        <div className="ah-fijo">
          <div className="ah-rejilla" aria-hidden="true">
            <span style={{ left: "17%" }} />
            <span style={{ left: "50%" }} />
            <span style={{ left: "83%" }} />
            <span className="h" style={{ top: "62%" }} />
          </div>

          {/* Caja de orden (fase 1) / pestañas numeradas (fase 2) */}
          <div className={`ah-orden ${fase2 ? "oculto" : ""}`} aria-hidden={fase2}>
            <span className="ah-comillas">“</span>
            <div className="ah-caja-orden">
              <span>{texto}</span>
              <span className="ah-cursor" aria-hidden="true" />
            </div>
            <p className="ah-sugerencia">{siguiente}</p>
          </div>
          <ol className={`ah-pestanas ${fase2 ? "" : "oculto"}`} aria-hidden={!fase2}>
            {PASOS.map((s, i) => (
              <li key={s.n} className={i === paso ? "activa" : ""}>
                <span>{s.n}</span>
                <span>{s.texto}</span>
              </li>
            ))}
          </ol>

          <ul className={`ah-capacidades ${fase2 ? "oculto" : ""}`}>
            {t.capacidades.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <div className="ah-riel" aria-hidden="true">
            <span>{fase2 ? t.rielPasos : t.rielIntro}</span>
            <i />
            <span>{t.rielMenu}</span>
          </div>

          <div
            className="ah-robot"
            style={{ transform: `translate(${-50 + zoom * 21}%, ${zoom * 3}%) scale(${1 + zoom * 1.1})` }}
          >
            <Robot expresion={actual?.cara ?? "normal"} pantalla={actual?.pantalla} titulo={t.robot} />
          </div>

          <div className={`ah-titular ${fase2 ? "fase2" : ""}`}>
            <p className="ah-sobre">{fase2 ? "· ·" : t.sobre}</p>
            <h1>
              {fase2 ? (
                <>
                  <span className="ah-recuadro">{t.titular1}</span>
                  <br />
                  {t.titularFase2}
                </>
              ) : (
                <>
                  <span className="ah-recuadro">{t.titular1}</span>
                  <br />
                  <span className="ah-recuadro">{t.titular2}</span>
                </>
              )}
            </h1>
          </div>

          <div className={`ah-pie ${fase2 ? "oculto" : ""}`}>
            <p>{t.pie}</p>
            <a href="#como" className="ah-scroll" aria-label={t.bajar}>
              <span>{t.scroll}</span>
              <span className="ah-flecha" aria-hidden="true">↓</span>
            </a>
          </div>
          {fase2 && (
            <Link href={ruta(idioma, "/conectar/")} className="ah-cta-fase2">
              {t.cta}
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
