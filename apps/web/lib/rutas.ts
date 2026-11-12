// Idiomas y direcciones. El español vive en la raíz (/conectar/) y los demás con prefijo (/en/conectar/).
// Sin textos: se puede usar en el navegador sin cargar ningún diccionario.
import { IDIOMA_BASE, IDIOMAS, esIdioma, type Idioma } from "@poda/nucleo";

export { IDIOMA_BASE, IDIOMAS, esIdioma, type Idioma };

/** Nombre de cada idioma en su propio idioma, para el selector. */
export const NOMBRE_IDIOMA: Record<Idioma, string> = { es: "Español", en: "English", pt: "Português", fr: "Français", ca: "Català" };

/** Idiomas con prefijo en la dirección (todos menos el español). */
export const IDIOMAS_CON_PREFIJO = IDIOMAS.filter((i) => i !== IDIOMA_BASE);

/** Dirección de una página en un idioma: ruta("en", "/conectar/") → "/en/conectar/". */
export function ruta(idioma: Idioma, r: string): string {
  if (idioma === IDIOMA_BASE || !r.startsWith("/") || r.startsWith("//")) return r;
  return r === "/" ? `/${idioma}/` : `/${idioma}${r}`;
}

/** Quita el prefijo de idioma: "/en/conectar/" → { idioma: "en", ruta: "/conectar/" }. */
export function sinIdioma(r: string): { idioma: Idioma; ruta: string } {
  const m = r.match(/^\/([a-z]{2})(\/.*)?$/);
  if (m && esIdioma(m[1]) && m[1] !== IDIOMA_BASE) return { idioma: m[1], ruta: m[2] || "/" };
  return { idioma: IDIOMA_BASE, ruta: r };
}

/** Sustituye {clave} por su valor. */
export function fmt(texto: string, datos: Record<string, string | number>): string {
  return texto.replace(/\{(\w+)\}/g, (todo, k: string) => (k in datos ? String(datos[k]) : todo));
}

/** hreflang de una página: la misma ruta en cada idioma, y x-default en español. */
export function alternativas(r: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of IDIOMAS) out[i] = ruta(i, r);
  out["x-default"] = r;
  return out;
}
