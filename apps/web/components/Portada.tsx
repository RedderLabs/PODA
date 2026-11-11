"use client";
// Portada con escena fija: al hacer scroll, la cámara se acerca a la cara del robot y avanzan los pasos.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Robot, type Expresion } from "./Robot";
import { MenuPrincipal } from "./Navegacion";

const ORDENES = [
  "Quita la publicidad de mi Xiaomi.",
  "¿Qué es com.miui.msa.global?",
  "Deja mi Samsung como vino, pero sin Bixby.",
  "Desactiva las apps de mi operadora.",
];

const CAPACIDADES = ["Anuncios", "Telemetría", "Apps de operadora", "Y mucho más"];

const PASOS = [
  { n: "01", texto: "Reconoce tu móvil", cara: "agobio" as Expresion, pantalla: "27 APPS" },
  { n: "02", texto: "Explica cada app", cara: "pensando" as Expresion, pantalla: "LEYENDO" },
  { n: "03", texto: "Copia y vuelta atrás", cara: "feliz" as Expresion, pantalla: "23 FUERA" },
];

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
  const { texto, siguiente } = useEscribir(ORDENES);

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
        <Link href="/" className="ah-logo" aria-label="Poda, inicio">
          <span className="ah-logo-caja" aria-hidden="true">
            <i />
            <i />
          </span>
          PODA
        </Link>
        <MenuPrincipal />
        <Link href="/conectar/" className="ah-lanzar">
          <span aria-hidden="true">••</span> Conectar móvil
        </Link>
      </header>

      <section ref={escena} className="ah-escena" aria-label="Presentación de Poda">
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
            {CAPACIDADES.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <div className="ah-riel" aria-hidden="true">
            <span>{fase2 ? "PASOS" : "INTRO"}</span>
            <i />
            <span>MENÚ</span>
          </div>

          <div
            className="ah-robot"
            style={{ transform: `translate(${-50 + zoom * 21}%, ${zoom * 3}%) scale(${1 + zoom * 1.1})` }}
          >
            <Robot expresion={actual?.cara ?? "normal"} pantalla={actual?.pantalla} titulo="Robot de Poda" />
          </div>

          <div className={`ah-titular ${fase2 ? "fase2" : ""}`}>
            <p className="ah-sobre">{fase2 ? "· ·" : "Poda lo que no pediste"}</p>
            <h1>
              {fase2 ? (
                <>
                  <span className="ah-recuadro">Tu móvil,</span>
                  <br />
                  como debería venir.
                </>
              ) : (
                <>
                  <span className="ah-recuadro">Tu móvil,</span>
                  <br />
                  <span className="ah-recuadro">sin relleno.</span>
                </>
              )}
            </h1>
          </div>

          <div className={`ah-pie ${fase2 ? "oculto" : ""}`}>
            <p>Tu experto en quitar el bloatware de cualquier Android. Sin root y con vuelta atrás.</p>
            <a href="#como" className="ah-scroll" aria-label="Bajar a cómo funciona">
              <span>SCROLL</span>
              <span className="ah-flecha" aria-hidden="true">↓</span>
            </a>
          </div>
          {fase2 && (
            <Link href="/conectar/" className="ah-cta-fase2">
              Conectar mi móvil →
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
