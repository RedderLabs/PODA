"use client";
// Mascota de Poda: robot con cabeza-pantalla, dibujado en SVG (propio, no es un recurso de terceros).
// Los ojos siguen al ratón y la cara cambia de expresión según lo que pasa en la web.
import { useEffect, useId, useRef, useState } from "react";
import { DibujoRobot, type Expresion } from "./DibujoRobot";

export type { Expresion };

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

  return (
    <svg ref={ref} viewBox="0 0 400 600" className={className} role="img" aria-label={titulo}>
      <DibujoRobot id={id} expresion={expresion} pantalla={pantalla} pedestal={pedestal} mirada={mirada} parpadeo={parpadeo} />
    </svg>
  );
}
