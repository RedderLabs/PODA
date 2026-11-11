"use client";
// Mascota de Poda: robot con cabeza-pantalla, dibujado en SVG (propio, no es un recurso de terceros).
// Los ojos siguen al ratón y la cara cambia de expresión según lo que pasa en la web.
import { useEffect, useId, useRef, useState } from "react";

export type Expresion = "normal" | "agobio" | "feliz" | "pensando";

interface Props {
  expresion?: Expresion;
  /** Texto pequeño en la pantalla, bajo los ojos (p. ej. «27»). */
  pantalla?: string;
  pedestal?: boolean;
  seguirRaton?: boolean;
  className?: string;
  titulo?: string;
}

export function Robot({ expresion = "normal", pantalla, pedestal = true, seguirRaton = true, className, titulo = "Robot de Poda" }: Props) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [mirada, setMirada] = useState({ x: 0, y: 0 });
  const [parpadeo, setParpadeo] = useState(false);

  useEffect(() => {
    if (!seguirRaton) return;
    const mover = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const cx = r.left + r.width * 0.42;
      const cy = r.top + r.height * 0.2;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 400));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 400));
      setMirada({ x: dx * 9, y: dy * 7 });
    };
    window.addEventListener("pointermove", mover);
    return () => window.removeEventListener("pointermove", mover);
  }, [seguirRaton]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const ciclo = () => {
      t = setTimeout(() => {
        setParpadeo(true);
        setTimeout(() => setParpadeo(false), 140);
        ciclo();
      }, 2600 + Math.random() * 2400);
    };
    ciclo();
    return () => clearTimeout(t);
  }, []);

  const g = (n: string) => `${id}-${n}`;
  const ojoAlto = parpadeo ? 2 : expresion === "feliz" ? 0 : 15;
  const ojos = { x: 150 + mirada.x, y: 118 + mirada.y };

  return (
    <svg ref={ref} viewBox="0 0 400 600" className={className} role="img" aria-label={titulo}>
      <defs>
        <linearGradient id={g("marco")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFC56E" />
          <stop offset="0.55" stopColor="#FF8A5B" />
          <stop offset="1" stopColor="#FF6FA8" />
        </linearGradient>
        <linearGradient id={g("blanco")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E4E1DA" />
        </linearGradient>
        <linearGradient id={g("lado")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#EDEAE3" />
          <stop offset="1" stopColor="#CFCBC2" />
        </linearGradient>
        <linearGradient id={g("negro")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A3631" />
          <stop offset="1" stopColor="#1A1815" />
        </linearGradient>
        <radialGradient id={g("pantalla")} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#2B2723" />
          <stop offset="1" stopColor="#0E0C0A" />
        </radialGradient>
        <filter id={g("sombra")} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000" floodOpacity="0.18" />
        </filter>
      </defs>

      {pedestal && (
        <g aria-hidden="true">
          <polygon points="118,470 300,470 330,452 148,452" fill="#3A3631" />
          <rect x="118" y="470" width="182" height="140" fill={`url(#${g("negro")})`} />
          <polygon points="300,470 330,452 330,600 300,610" fill="#24211D" />
        </g>
      )}

      <g filter={`url(#${g("sombra")})`}>
        {/* piernas */}
        <rect x="160" y="400" width="34" height="56" rx="12" fill={`url(#${g("blanco")})`} />
        <rect x="214" y="400" width="34" height="56" rx="12" fill={`url(#${g("blanco")})`} />
        <rect x="150" y="444" width="52" height="22" rx="10" fill="#F7F5F0" />
        <rect x="206" y="444" width="52" height="22" rx="10" fill="#F7F5F0" />
        {/* cuerpo */}
        <rect x="128" y="262" width="152" height="152" rx="26" fill={`url(#${g("blanco")})`} />
        <rect x="262" y="270" width="26" height="136" rx="12" fill={`url(#${g("lado")})`} />
        <rect x="128" y="372" width="152" height="30" rx="8" fill="#1F1C19" />
        <circle cx="186" cy="290" r="5" fill="#FFC56E" />
        <circle cx="202" cy="290" r="5" fill="#FF8A5B" />
        <circle cx="218" cy="290" r="5" fill="#FF6FA8" />
        <rect x="160" y="312" width="24" height="44" rx="8" fill="#1F1C19" />
        <rect x="222" y="312" width="24" height="44" rx="8" fill="#1F1C19" />
        {/* brazo izquierdo */}
        <circle cx="122" cy="282" r="22" fill="#1F1C19" />
        <rect x="96" y="290" width="34" height="74" rx="14" fill={`url(#${g("blanco")})`} />
        <rect x="92" y="356" width="40" height="30" rx="12" fill="#F7F5F0" />
        {/* brazo derecho */}
        <circle cx="288" cy="282" r="22" fill="#1F1C19" />
        <rect x="282" y="290" width="34" height="74" rx="14" fill={`url(#${g("blanco")})`} />
        <rect x="278" y="356" width="40" height="30" rx="12" fill="#F7F5F0" />
        {/* cuello */}
        <rect x="178" y="226" width="54" height="40" rx="8" fill="#1F1C19" />
        <rect x="170" y="252" width="70" height="16" rx="6" fill="#F7F5F0" />

        {/* cabeza: caja blanca con lateral y oreja */}
        <rect x="120" y="22" width="220" height="208" rx="32" fill={`url(#${g("blanco")})`} />
        <rect x="314" y="34" width="34" height="184" rx="14" fill={`url(#${g("lado")})`} />
        <circle cx="300" cy="126" r="28" fill="#F7F5F0" stroke="#D8D2C5" strokeWidth="3" />
        <path d="M290 112 a16 16 0 1 0 6 30" fill="none" stroke="#1F1C19" strokeWidth="5" strokeLinecap="round" />
        {/* marco degradado + pantalla */}
        <rect x="58" y="28" width="196" height="196" rx="40" fill={`url(#${g("marco")})`} />
        <rect x="82" y="52" width="148" height="148" rx="26" fill="#F7F5F0" />
        <rect x="94" y="64" width="124" height="124" rx="20" fill={`url(#${g("pantalla")})`} />

        {/* cara */}
        <g aria-hidden="true">
          {expresion === "feliz" ? (
            <>
              <path d={`M${ojos.x - 26} ${ojos.y + 4} q12 -14 24 0`} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
              <path d={`M${ojos.x + 4} ${ojos.y + 4} q12 -14 24 0`} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx={ojos.x - 14} cy={ojos.y} rx="9" ry={ojoAlto} fill="#fff" />
              <ellipse cx={ojos.x + 16} cy={ojos.y} rx="9" ry={ojoAlto} fill="#fff" />
            </>
          )}
          {expresion === "agobio" && (
            <>
              <path d={`M${ojos.x - 28} ${ojos.y - 22} l18 6`} stroke="#fff" strokeWidth="4" strokeLinecap="round" />
              <path d={`M${ojos.x + 30} ${ojos.y - 22} l-18 6`} stroke="#fff" strokeWidth="4" strokeLinecap="round" />
              <path d={`M${ojos.x - 10} ${ojos.y + 32} q11 -8 22 0`} fill="none" stroke="#FF8A5B" strokeWidth="4" strokeLinecap="round" />
            </>
          )}
          {expresion === "pensando" && <circle cx={ojos.x + 40} cy={ojos.y - 30} r="4" fill="#FF8A5B" />}
          {pantalla && (
            <text x="156" y="176" textAnchor="middle" fill="#FF8A5B" fontFamily="JetBrains Mono, monospace" fontSize="15" letterSpacing="1">
              {pantalla}
            </text>
          )}
        </g>
      </g>
    </svg>
  );
}
