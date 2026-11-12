// Texto con marcas sencillas, para que los diccionarios no lleven JSX:
//   *cursiva*  **negrita**  `monoespaciada`  [enlace](/ruta/)  y saltos de línea.
// Los enlaces internos se adaptan al idioma. Sirve en componentes de servidor y de cliente.
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ruta, type Idioma } from "@/lib/rutas";

const MARCAS = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\n)/g;

export function rico(texto: string, idioma: Idioma, negrita: "strong" | "b" = "strong"): ReactNode {
  const partes = texto.split(MARCAS);
  return partes.map((p, i) => {
    if (!p) return null;
    if (p === "\n") return <br key={i} />;
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4) {
      const N = negrita;
      return <N key={i}>{p.slice(2, -2)}</N>;
    }
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2) return <span key={i} className="mono">{p.slice(1, -1)}</span>;
    const enlace = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (enlace) {
      const [, txt, href] = enlace;
      if (/^https?:/.test(href)) {
        return (
          <a key={i} href={href} rel="noopener">
            {txt}
          </a>
        );
      }
      // Archivos (/protegidas.json) no llevan prefijo de idioma ni pasan por el enrutador.
      if (/\.[a-z]+$/i.test(href)) {
        return (
          <a key={i} href={href} className="mono">
            {txt}
          </a>
        );
      }
      return (
        <Link key={i} href={ruta(idioma, href)}>
          {txt}
        </Link>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function Rico({ texto, idioma }: { texto: string; idioma: Idioma }) {
  return <>{rico(texto, idioma)}</>;
}
