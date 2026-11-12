"use client";
// Selector de idioma del pie: lleva a la misma página en otro idioma.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { IDIOMAS, NOMBRE_IDIOMA, ruta, sinIdioma } from "@/lib/rutas";
import { useTextos } from "./Textos";

export function SelectorIdioma() {
  const { idioma, t } = useTextos();
  const actual = sinIdioma(usePathname() || "/").ruta;
  const caja = useRef<HTMLDetailsElement>(null);
  return (
    <details className="idiomas" ref={caja}>
      <summary className="pie-red" aria-label={`${t.idioma.elegir}: ${NOMBRE_IDIOMA[idioma]}`}>
        {idioma.toUpperCase()}
      </summary>
      <ul>
        {IDIOMAS.map((i) => (
          <li key={i}>
            <Link
              href={ruta(i, actual)}
              hrefLang={i}
              lang={i}
              aria-current={i === idioma ? "true" : undefined}
              onClick={() => caja.current?.removeAttribute("open")}
            >
              {NOMBRE_IDIOMA[i]}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
