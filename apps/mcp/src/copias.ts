// Copias de seguridad del estado de los paquetes y registro de cambios.
// Se guardan en ~/.poda (o en PODA_DIR) como JSON legible, con el mismo formato que la web (núcleo).
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, appendFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename } from "node:path";
import { crearCopiaEstado, leerCopiaEstado, type CopiaEstado, type EstadoPaquete } from "@poda/nucleo";

const DIR = process.env.PODA_DIR || join(homedir(), ".poda");

export type Copia = CopiaEstado;

function carpeta(serie: string): string {
  const seguro = serie.replace(/[^A-Za-z0-9._-]/g, "_");
  const d = join(DIR, "copias", seguro);
  mkdirSync(d, { recursive: true });
  return d;
}

export function guardarCopia(serie: string, dispositivo: Record<string, string>, paquetes: Map<string, EstadoPaquete>): { ruta: string; copia: Copia } {
  const copia = crearCopiaEstado(serie, dispositivo, paquetes);
  const ruta = join(carpeta(serie), `${copia.creada.replace(/[:.]/g, "-")}.json`);
  writeFileSync(ruta, JSON.stringify(copia, null, 2));
  return { ruta, copia };
}

export function listarCopias(serie?: string): { serie: string; archivo: string; ruta: string; creada: string }[] {
  const base = join(DIR, "copias");
  if (!existsSync(base)) return [];
  const series = serie ? [serie.replace(/[^A-Za-z0-9._-]/g, "_")] : readdirSync(base);
  const out: { serie: string; archivo: string; ruta: string; creada: string }[] = [];
  for (const s of series) {
    const d = join(base, s);
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d).filter((x) => x.endsWith(".json"))) {
      const ruta = join(d, f);
      try {
        const c = leerCopiaEstado(readFileSync(ruta, "utf8"));
        if (typeof c.creada !== "string" || Number.isNaN(Date.parse(c.creada))) continue; // sin fecha no cuenta como copia
        out.push({ serie: c.serie, archivo: f, ruta, creada: c.creada });
      } catch {
        // No es una copia de Poda o está dañada: no se lista. restaurar sí explica el motivo si se pide.
      }
    }
  }
  return out.sort((a, b) => b.creada.localeCompare(a.creada));
}

export function leerCopia(serie: string, archivo: string): Copia {
  const nombre = basename(archivo); // evita rutas fuera de la carpeta
  const ruta = join(carpeta(serie), nombre);
  if (!existsSync(ruta)) throw new Error(`No existe la copia ${nombre} para ${serie}.`);
  return leerCopiaEstado(readFileSync(ruta, "utf8"));
}

/** ¿Hay una copia de este móvil hecha en las últimas `horas`? */
export function hayCopiaReciente(serie: string, horas = 24): boolean {
  const limite = Date.now() - horas * 3600_000;
  return listarCopias(serie).some((c) => Date.parse(c.creada) >= limite);
}

export function registrar(evento: Record<string, unknown>) {
  mkdirSync(DIR, { recursive: true });
  appendFileSync(join(DIR, "registro.jsonl"), JSON.stringify({ fecha: new Date().toISOString(), ...evento }) + "\n");
}
