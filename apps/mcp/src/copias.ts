// Copias de seguridad del estado de los paquetes y registro de cambios.
// Se guardan en ~/.poda (o en PODA_DIR) como JSON legible.
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, appendFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename } from "node:path";
import type { EstadoPaquete } from "./adb.js";

const DIR = process.env.PODA_DIR || join(homedir(), ".poda");

export interface Copia {
  version: 1;
  creada: string;
  serie: string;
  dispositivo: Record<string, string>;
  paquetes: Record<string, EstadoPaquete>;
}

function carpeta(serie: string): string {
  const seguro = serie.replace(/[^A-Za-z0-9._-]/g, "_");
  const d = join(DIR, "copias", seguro);
  mkdirSync(d, { recursive: true });
  return d;
}

export function guardarCopia(serie: string, dispositivo: Record<string, string>, paquetes: Map<string, EstadoPaquete>): { ruta: string; copia: Copia } {
  const copia: Copia = {
    version: 1,
    creada: new Date().toISOString(),
    serie,
    dispositivo,
    paquetes: Object.fromEntries([...paquetes.entries()].sort(([a], [b]) => a.localeCompare(b))),
  };
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
        const c = JSON.parse(readFileSync(ruta, "utf8")) as Copia;
        out.push({ serie: c.serie, archivo: f, ruta, creada: c.creada });
      } catch {
        /* archivo dañado: se ignora */
      }
    }
  }
  return out.sort((a, b) => b.creada.localeCompare(a.creada));
}

export function leerCopia(serie: string, archivo: string): Copia {
  const nombre = basename(archivo); // evita rutas fuera de la carpeta
  const ruta = join(carpeta(serie), nombre);
  if (!existsSync(ruta)) throw new Error(`No existe la copia ${nombre} para ${serie}.`);
  return JSON.parse(readFileSync(ruta, "utf8")) as Copia;
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
