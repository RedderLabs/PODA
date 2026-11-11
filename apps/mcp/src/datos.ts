// Carga la lista de paquetes completa (con descripciones). Las reglas viven en @poda/nucleo.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { EntradaUad } from "@poda/nucleo";

export { nivelDe, origenDe, resumenDescripcion, NIVELES_DE_PERFIL, type Nivel, type Perfil, type EntradaUad } from "@poda/nucleo";

function rutaLista(): string {
  if (process.env.PODA_LISTA) return process.env.PODA_LISTA;
  const aqui = dirname(fileURLToPath(import.meta.url));
  const candidatas = [join(aqui, "..", "data", "uad_lists.json"), join(aqui, "..", "..", "..", "data", "uad_lists.json")];
  const r = candidatas.find((c) => existsSync(c));
  if (!r) throw new Error("No encuentro data/uad_lists.json. Ejecuta `pnpm build` o indica la ruta en PODA_LISTA.");
  return r;
}

let cache: Map<string, EntradaUad> | null = null;

export function lista(): Map<string, EntradaUad> {
  if (!cache) cache = new Map(Object.entries(JSON.parse(readFileSync(rutaLista(), "utf8")) as Record<string, EntradaUad>));
  return cache;
}
