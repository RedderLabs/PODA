// Lista de paquetes. Viene de Universal Android Debloater Next Generation (GPL-3.0):
// https://github.com/Universal-Debloater-Alliance/universal-android-debloater-next-generation
import { NIVELES, NIVEL_DE_UAD, ORIGENES, ORIGEN_DE_UAD, type Nivel, type Origen } from "./niveles.js";
import { ajustarNivel } from "./protecciones.js";

export interface EntradaUad {
  list: string;
  description: string;
  dependencies: string[];
  neededBy: string[];
  labels: string[];
  removal: string;
}
export type ListaUad = Record<string, EntradaUad>;

/** Nivel de un paquete: el de UAD-ng con las correcciones de Poda (protecciones.ts). */
export const nivelDe = (e: EntradaUad, paquete: string): Nivel => ajustarNivel(paquete, NIVEL_DE_UAD[e.removal] ?? "bloqueado");
export const origenDe = (e: EntradaUad): Origen => ORIGEN_DE_UAD[e.list] ?? "terceros";

/** Versión ligera para la web: solo nivel y origen (sin descripciones). */
export interface ListaCompacta {
  v: 1;
  niveles: readonly string[];
  origenes: readonly string[];
  p: Record<string, [number, number]>;
}

export function compactar(uad: ListaUad): ListaCompacta {
  const p: Record<string, [number, number]> = {};
  for (const [pkg, e] of Object.entries(uad)) p[pkg] = [NIVELES.indexOf(nivelDe(e, pkg)), ORIGENES.indexOf(origenDe(e))];
  return { v: 1, niveles: NIVELES, origenes: ORIGENES, p };
}

export function resumenDescripcion(d: string, max = 220): string {
  const limpio = d
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s\((?![^()]*\))\s*/g, " — ") // paréntesis que se quedó abierto al quitar un enlace
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*[—:-]+$/, ""); // guion o dos puntos colgando al final
  return limpio.length > max ? limpio.slice(0, max - 1) + "…" : limpio;
}

/** Paquetes propios de un fabricante, por los prefijos de data/fabricantes.json. */
export function paquetesDeFabricante(uad: ListaUad, prefijos: string[]) {
  return Object.entries(uad)
    .filter(([pkg, e]) => e.list === "Oem" && prefijos.some((pr) => pkg.startsWith(pr)))
    .map(([paquete, e]) => ({ paquete, nivel: nivelDe(e, paquete), descripcion: resumenDescripcion(e.description, 160) }))
    .sort((a, b) => NIVELES.indexOf(a.nivel) - NIVELES.indexOf(b.nivel) || a.paquete.localeCompare(b.paquete));
}
