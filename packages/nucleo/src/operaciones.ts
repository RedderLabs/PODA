// Operaciones sobre el móvil que comparten la web y el MCP: estado de los paquetes, plan de un perfil,
// comandos (siempre con el nombre validado), lectura de respuestas y copias de seguridad.
import { NIVELES, NIVELES_DE_PERFIL, type Nivel, type Perfil } from "./niveles.js";
import { esPaqueteValido } from "./paquetes.js";
import type { ListaCompacta } from "./lista.js";

export type EstadoPaquete = "instalado" | "desactivado" | "quitado";

/** `todos` = pm list packages -u; `presentes` = pm list packages; `desactivados` = pm list packages -d. */
export function estadosDe(todos: Set<string>, presentes: Set<string>, desactivados: Set<string>): Map<string, EstadoPaquete> {
  const m = new Map<string, EstadoPaquete>();
  for (const p of new Set([...todos, ...presentes])) {
    m.set(p, !presentes.has(p) ? "quitado" : desactivados.has(p) ? "desactivado" : "instalado");
  }
  return m;
}

export interface ItemPlan {
  paquete: string;
  nivel: Exclude<Nivel, "bloqueado">;
  origen: string;
  estado: Exclude<EstadoPaquete, "quitado">;
}

/**
 * Paquetes del móvil que entran en un perfil. Solo los que están en la lista, nunca los «bloqueado»
 * y nunca los ya quitados. Ordenados de menos a más riesgo.
 */
export function planDePerfil(estados: Map<string, EstadoPaquete>, lista: ListaCompacta, perfil: Perfil): ItemPlan[] {
  const niveles = new Set<Nivel>(NIVELES_DE_PERFIL[perfil]);
  const out: ItemPlan[] = [];
  for (const [paquete, estado] of estados) {
    if (estado === "quitado" || !esPaqueteValido(paquete)) continue;
    const e = lista.p[paquete];
    if (!e) continue;
    const nivel = NIVELES[e[0]] ?? "bloqueado";
    if (nivel === "bloqueado" || !niveles.has(nivel)) continue;
    out.push({ paquete, nivel, origen: lista.origenes[e[1]] ?? "otro", estado });
  }
  return out.sort((a, b) => NIVELES.indexOf(a.nivel) - NIVELES.indexOf(b.nivel) || a.paquete.localeCompare(b.paquete));
}

/** Cuántos paquetes de este móvil entran en cada perfil. */
export function tamanoPerfiles(estados: Map<string, EstadoPaquete>, lista: ListaCompacta): Record<Perfil, number> {
  return {
    seguro: planDePerfil(estados, lista, "seguro").length,
    recomendado: planDePerfil(estados, lista, "recomendado").length,
    experto: planDePerfil(estados, lista, "experto").length,
  };
}

function comprobar(p: string): string {
  if (!esPaqueteValido(p)) throw new Error(`Nombre de paquete no válido: ${p}`);
  return p;
}

/** Comandos de `adb shell`, como lista de argumentos. */
export const COMANDOS = {
  quitar: (p: string) => ["pm", "uninstall", "-k", "--user", "0", comprobar(p)],
  desactivar: (p: string) => ["pm", "disable-user", "--user", "0", comprobar(p)],
  reinstalar: (p: string) => ["cmd", "package", "install-existing", "--user", "0", comprobar(p)],
  reinstalarAntiguo: (p: string) => ["pm", "install-existing", "--user", "0", comprobar(p)],
  activar: (p: string) => ["pm", "enable", "--user", "0", comprobar(p)],
};

/** Apps con icono en el cajón de apps: las que el usuario ve y puede estar usando. */
export const COMANDO_CON_ICONO = [
  "cmd", "package", "query-activities", "--brief", "--user", "0",
  "-a", "android.intent.action.MAIN", "-c", "android.intent.category.LAUNCHER",
];

/** Lee la salida de query-activities (con o sin --brief). Si el móvil no lo admite, devuelve un conjunto vacío. */
export function paquetesConIcono(salida: string): Set<string> {
  const out = new Set<string>();
  for (const l of salida.split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Za-z][\w]*(?:\.[\w]+)+)\/[\w.$]+\s*$/) ?? l.match(/packageName=([A-Za-z][\w]*(?:\.[\w]+)+)/);
    if (m) out.add(m[1]);
  }
  return out;
}

export const RESPUESTA_OK = {
  quitar: (s: string) => /Success/i.test(s),
  desactivar: (s: string) => /disabled-user|new state: disabled/i.test(s),
  reinstalar: (s: string) => /Success|installed for user/i.test(s),
  activar: (s: string) => /new state: enabled/i.test(s),
};

export interface CopiaEstado {
  version: 1;
  creada: string;
  serie: string;
  dispositivo: Record<string, string>;
  paquetes: Record<string, EstadoPaquete>;
}

export function crearCopiaEstado(serie: string, dispositivo: Record<string, string>, estados: Map<string, EstadoPaquete>, ahora = new Date()): CopiaEstado {
  return {
    version: 1,
    creada: ahora.toISOString(),
    serie,
    dispositivo,
    paquetes: Object.fromEntries([...estados.entries()].sort(([a], [b]) => a.localeCompare(b))),
  };
}

/** Comprueba un archivo de copia (de la web o del MCP) antes de usarlo. */
export function leerCopiaEstado(texto: string): CopiaEstado {
  const c = JSON.parse(texto) as Partial<CopiaEstado>;
  if (c?.version !== 1 || typeof c.paquetes !== "object" || !c.paquetes) throw new Error("No es una copia de Poda.");
  // Nombres que no pasan la validación (como «android», el propio sistema) se guardan en la copia
  // pero no se usan: Poda nunca los toca, así que tampoco hay nada que restaurar en ellos.
  const paquetes: Record<string, EstadoPaquete> = {};
  for (const [p, e] of Object.entries(c.paquetes)) {
    if (!["instalado", "desactivado", "quitado"].includes(e as string)) throw new Error(`Copia dañada en «${p}».`);
    if (esPaqueteValido(p)) paquetes[p] = e as EstadoPaquete;
  }
  return { ...(c as CopiaEstado), paquetes };
}

export interface PasoRestaurar {
  paquete: string;
  accion: "reinstalar" | "activar";
}

/** Qué hay que hacer para volver al estado de la copia: solo se deshace, nunca se quita nada. */
export function pasosParaRestaurar(copia: CopiaEstado, ahora: Map<string, EstadoPaquete>): PasoRestaurar[] {
  const pasos: PasoRestaurar[] = [];
  for (const [p, antes] of Object.entries(copia.paquetes)) {
    const hoy = ahora.get(p);
    if (!hoy || antes === "quitado" || hoy === antes) continue;
    if (hoy === "quitado") pasos.push({ paquete: p, accion: "reinstalar" });
    else if (hoy === "desactivado" && antes === "instalado") pasos.push({ paquete: p, accion: "activar" });
  }
  return pasos.sort((a, b) => a.paquete.localeCompare(b.paquete));
}
