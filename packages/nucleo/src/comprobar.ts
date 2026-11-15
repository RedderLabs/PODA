// Comprobar el móvil después de reiniciarlo (specs/008). Solo lee: ningún comando cambia nada.
import type { CopiaEstado, EstadoPaquete } from "./operaciones.js";
import { estaProtegido } from "./protecciones.js";

/** Comandos de solo lectura para comprobar que el móvil tiene lo imprescindible. */
export const COMANDOS_COMPROBAR = {
  /** La app de pantalla de inicio (la que abre el botón de inicio). Android 7 o posterior. */
  inicio: ["cmd", "package", "resolve-activity", "--brief", "--user", "0", "-a", "android.intent.action.MAIN", "-c", "android.intent.category.HOME"],
  /** El teclado que usa el móvil. */
  teclado: ["settings", "get", "secure", "default_input_method"],
} as const;

/** El paquete de una salida tipo `paquete/Actividad` (última línea que lo tenga), o null. */
export function paqueteDeSalida(salida: string): string | null {
  let p: string | null = null;
  for (const l of salida.split(/\r?\n/)) {
    const m = l.trim().match(/^([A-Za-z][\w]*(?:\.[\w]+)*)\/[\w.$]+$/);
    if (m) p = m[1];
  }
  return p;
}

export interface CambioTrasReinicio {
  paquete: string;
  esperado: EstadoPaquete;
  ahora: EstadoPaquete;
}

export interface ComprobacionReinicio {
  /** Android dijo que terminó de arrancar (`sys.boot_completed`). */
  arranco: boolean;
  /** Hay pantalla de inicio / teclado. `null`: el móvil no deja comprobarlo. */
  inicio: boolean | null;
  teclado: boolean | null;
  /** Apps protegidas que estaban instaladas antes de reiniciar y ahora no. */
  protegidasAfectadas: string[];
  /** Apps que Poda cambió y siguen como se dejaron. */
  siguen: string[];
  /** Apps que Poda cambió y ya no están como se dejaron (por ejemplo, el fabricante las reinstaló). */
  cambiaron: CambioTrasReinicio[];
  /** La copia de antes de tocar nada frente al móvil ya reiniciado (specs/009), si hay copia. */
  comparativa: Comparativa | null;
}

// «instalado» (tras restaurar): basta con que siga en el móvil; si la copia la tenía desactivada, vuelve desactivada.
const cumple = (esperado: EstadoPaquete, ahora: EstadoPaquete) =>
  esperado === "instalado" ? ahora !== "quitado" : esperado === "desactivado" ? ahora !== "instalado" : ahora === "quitado";

/** ¿La app de la salida existe y está instalada? `null` si la salida no dice nada claro. */
function hayApp(salida: string | null, ahora: Map<string, EstadoPaquete>, noHay: RegExp): boolean | null {
  if (salida === null) return null;
  const s = salida.trim();
  if (noHay.test(s)) return false;
  const p = paqueteDeSalida(s);
  if (!p) return null;
  return p === "android" || ahora.get(p) === "instalado"; // «android»: el selector de pantallas de inicio
}

export function comprobarTrasReinicio(e: {
  arranco: boolean;
  /** Salidas de COMANDOS_COMPROBAR (null si fallaron). */
  inicio: string | null;
  teclado: string | null;
  /** Cómo dejó Poda cada app que cambió antes de reiniciar. */
  esperado: Record<string, EstadoPaquete>;
  /** Estado de todas las apps justo antes de reiniciar y después. */
  antes: Map<string, EstadoPaquete>;
  ahora: Map<string, EstadoPaquete>;
  copia?: CopiaEstado | null;
}): ComprobacionReinicio {
  const siguen: string[] = [];
  const cambiaron: CambioTrasReinicio[] = [];
  for (const [paquete, esperado] of Object.entries(e.esperado)) {
    const ahora = e.ahora.get(paquete) ?? "quitado"; // si ni aparece, no está instalada
    if (cumple(esperado, ahora)) siguen.push(paquete);
    else cambiaron.push({ paquete, esperado, ahora });
  }
  const protegidasAfectadas = [...e.antes]
    .filter(([p, antes]) => antes === "instalado" && estaProtegido(p) && e.ahora.get(p) !== "instalado")
    .map(([p]) => p)
    .sort();
  return {
    arranco: e.arranco,
    inicio: hayApp(e.inicio, e.ahora, /no activity found/i),
    teclado: hayApp(e.teclado, e.ahora, /^null$/),
    protegidasAfectadas,
    siguen: siguen.sort(),
    cambiaron: cambiaron.sort((a, b) => a.paquete.localeCompare(b.paquete)),
    comparativa: e.copia ? compararConCopia(e.copia, e.ahora) : null,
  };
}

/** Todo bien: arrancó, nada imprescindible falta y todas las apps siguen como se dejaron. */
export function todoEnOrden(c: ComprobacionReinicio): boolean {
  return c.arranco && c.inicio !== false && c.teclado !== false && c.protegidasAfectadas.length === 0 && c.cambiaron.length === 0;
}

// ------------------------------------------------------------------ antes y después (specs/009)
export interface CambioCopia {
  paquete: string;
  antes: EstadoPaquete;
  ahora: EstadoPaquete;
}

export interface Comparativa {
  /** Cuándo se hizo la copia. */
  creada: string;
  /** Cuántas apps de la copia había en cada estado, y cuántas de esas mismas hay ahora. */
  antes: Record<EstadoPaquete, number>;
  ahora: Record<EstadoPaquete, number>;
  /** Las que han cambiado, por nombre. */
  cambios: CambioCopia[];
}

/** La copia (antes de tocar nada) frente al estado que se acaba de leer del móvil. Solo lee. */
export function compararConCopia(copia: CopiaEstado, ahora: Map<string, EstadoPaquete>): Comparativa {
  const cero = (): Record<EstadoPaquete, number> => ({ instalado: 0, desactivado: 0, quitado: 0 });
  const r: Comparativa = { creada: copia.creada, antes: cero(), ahora: cero(), cambios: [] };
  for (const [paquete, antes] of Object.entries(copia.paquetes)) {
    const hoy = ahora.get(paquete) ?? "quitado"; // si ni aparece, no está instalada
    r.antes[antes]++;
    r.ahora[hoy]++;
    if (hoy !== antes) r.cambios.push({ paquete, antes, ahora: hoy });
  }
  r.cambios.sort((a, b) => a.paquete.localeCompare(b.paquete));
  return r;
}
