// Textos del núcleo que ve el usuario, en cada idioma de la web. El español sale de las mismas
// constantes que usan las reglas (una sola fuente de verdad). Las traducciones viven en ./traducciones/.
// Si cambias un texto en español, cambia también su traducción: las pruebas comprueban que no falte ninguna.
import { DESCRIPCION_NIVEL, ORIGENES, type Nivel, type Origen } from "./niveles.js";
import { AVISO_PODA, PROTEGIDOS } from "./protecciones.js";
import { CAPA_PIXEL, clavesAviso, TEXTO_AVISO, type ClaveAviso, type Ficha } from "./ficha.js";
import { en } from "./traducciones/en.js";
import { pt } from "./traducciones/pt.js";
import { fr } from "./traducciones/fr.js";
import { ca } from "./traducciones/ca.js";

export const IDIOMAS = ["es", "en", "pt", "fr", "ca"] as const;
export type Idioma = (typeof IDIOMAS)[number];
export const IDIOMA_BASE: Idioma = "es";
export const esIdioma = (x: string): x is Idioma => (IDIOMAS as readonly string[]).includes(x);

export interface TextosNucleo {
  /** Qué significa cada nivel de riesgo. */
  nivel: Record<Nivel, string>;
  /** Nombre de cada origen de las apps (fabricante, operadora…). */
  origen: Record<Origen, string>;
  /** Aviso de Poda para las apps de uso diario. Mismas claves que AVISO_PODA. */
  avisoPoda: Record<string, string>;
  /** Grupos protegidos, en el mismo orden que PROTEGIDOS. `familias` en el mismo orden que las del grupo. */
  protegidos: { titulo: string; motivo: string; familias?: string[] }[];
  /** Avisos de la ficha del móvil. `{rom}` = nombre del sistema alternativo. */
  aviso: Record<ClaveAviso, string>;
  /** Capa que se muestra en los Pixel. */
  capaPixel: string;
}

const ORIGEN_ES = Object.fromEntries(ORIGENES.map((o) => [o, o])) as Record<Origen, string>;

export const es: TextosNucleo = {
  nivel: { ...DESCRIPCION_NIVEL },
  origen: ORIGEN_ES,
  avisoPoda: { ...AVISO_PODA },
  protegidos: PROTEGIDOS.map((g) => ({ titulo: g.titulo, motivo: g.motivo, familias: g.familias?.map((f) => f.texto) })),
  aviso: { ...TEXTO_AVISO },
  capaPixel: CAPA_PIXEL,
};

export const TEXTOS_NUCLEO: Readonly<Record<Idioma, TextosNucleo>> = { es, en, pt, fr, ca };

/** Avisos de la ficha en un idioma. */
export function avisosFicha(f: Omit<Ficha, "avisos">, idioma: Idioma): string[] {
  const t = TEXTOS_NUCLEO[idioma].aviso;
  return clavesAviso(f).map((c) => t[c].replace("{rom}", f.romPersonalizada ?? ""));
}

/** Capa del móvil para mostrar: solo cambia el texto genérico de los Pixel. */
export const capaEn = (capa: string | null, idioma: Idioma) => (capa === CAPA_PIXEL ? TEXTOS_NUCLEO[idioma].capaPixel : capa);

/** Nombre de un origen en un idioma. Si no se conoce, se devuelve tal cual. */
export const origenEn = (origen: string, idioma: Idioma) => TEXTOS_NUCLEO[idioma].origen[origen as Origen] ?? origen;
