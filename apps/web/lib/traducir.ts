// Traducción de las descripciones de UAD-ng (en inglés) con el traductor integrado del navegador
// (Translator API, Chrome 138+). Traduce en el propio ordenador: no sale nada de él (specs/007).
import type { Idioma } from "@poda/nucleo";

type Disponibilidad = "unavailable" | "downloadable" | "downloading" | "available";
export interface Traductor {
  translate(texto: string): Promise<string>;
}
export interface ApiTraductor {
  availability(o: { sourceLanguage: string; targetLanguage: string }): Promise<Disponibilidad>;
  create(o: { sourceLanguage: string; targetLanguage: string }): Promise<Traductor>;
}

/** `lista`: se traduce sin pedir nada. `descargable`: hace falta un clic para descargar el idioma. */
export type EstadoTraduccion = "no-hace-falta" | "sin-traductor" | "descargable" | "lista";

export function apiDelNavegador(): ApiTraductor | null {
  const g = globalThis as { Translator?: ApiTraductor };
  return typeof g.Translator?.availability === "function" ? g.Translator : null;
}

export async function disponibilidad(idioma: Idioma, api: ApiTraductor | null = apiDelNavegador()): Promise<EstadoTraduccion> {
  if (idioma === "en") return "no-hace-falta";
  if (!api) return "sin-traductor";
  try {
    const d = await api.availability({ sourceLanguage: "en", targetLanguage: idioma });
    if (d === "available") return "lista";
    return d === "unavailable" ? "sin-traductor" : "descargable";
  } catch {
    return "sin-traductor";
  }
}

/** Si el idioma no está descargado, hay que llamarla desde un clic: Chrome lo exige para descargar. */
export async function crearTraductor(idioma: Idioma, api: ApiTraductor | null = apiDelNavegador()): Promise<Traductor | null> {
  if (!api || idioma === "en") return null;
  try {
    return await api.create({ sourceLanguage: "en", targetLanguage: idioma });
  } catch {
    return null;
  }
}

// ------------------------------------------------------------- caché en el navegador
// Clave: el texto original, así una descripción que cambie en la lista se vuelve a traducir.
const MAX_GUARDADAS = 3000;
const claveCache = (idioma: Idioma) => `poda:traducciones:${idioma}`;

export function leerTraducciones(idioma: Idioma): Record<string, string> {
  try {
    const crudo = localStorage.getItem(claveCache(idioma));
    const datos: unknown = crudo ? JSON.parse(crudo) : {};
    return datos && typeof datos === "object" ? (datos as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function guardarTraducciones(idioma: Idioma, t: Record<string, string>): void {
  try {
    const entradas = Object.entries(t);
    const recortadas = entradas.length > MAX_GUARDADAS ? Object.fromEntries(entradas.slice(-MAX_GUARDADAS)) : t;
    localStorage.setItem(claveCache(idioma), JSON.stringify(recortadas));
  } catch {
    // Navegación privada o almacenamiento lleno: se traduce igual, solo que no se recuerda.
  }
}

/** Traduce en orden los textos que falten y avisa de cada uno. Para si `seguir()` deja de ser cierto. */
export async function traducirPendientes(
  traductor: Traductor,
  textos: readonly string[],
  hechas: Readonly<Record<string, string>>,
  alTraducir: (original: string, traducido: string) => void,
  seguir: () => boolean = () => true,
): Promise<void> {
  const vistos = new Set<string>();
  for (const texto of textos) {
    if (!seguir()) return;
    if (!texto || hechas[texto] || vistos.has(texto)) continue;
    vistos.add(texto);
    try {
      const r = await traductor.translate(texto);
      if (seguir() && r.trim()) alTraducir(texto, r);
    } catch {
      // Si una falla, se queda en inglés y se sigue con las demás.
    }
  }
}
