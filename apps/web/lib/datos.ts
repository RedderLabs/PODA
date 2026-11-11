// Datos que la web descarga una sola vez y copias de seguridad guardadas en el navegador.
import { leerCopiaEstado, type CopiaEstado, type ListaCompacta } from "@poda/nucleo";

let listaPromesa: Promise<ListaCompacta> | null = null;
export const cargarLista = () => (listaPromesa ??= fetch("/lista.json").then((r) => r.json() as Promise<ListaCompacta>));

/** paquete → [descripción corta en inglés, quién lo necesita]. Solo se pide al elegir perfil. */
export type Detalles = Record<string, [string, string[]?]>;
let detallesPromesa: Promise<Detalles> | null = null;
export const cargarDetalles = () =>
  (detallesPromesa ??= fetch("/detalles.json")
    .then((r) => r.json() as Promise<Detalles>)
    .catch(() => ({}) as Detalles));

// ------------------------------------------------------------- copias en el navegador
const clave = (serie: string) => `poda:copias:${serie}`;
const MAX_COPIAS = 5;

export function copiasGuardadas(serie: string): CopiaEstado[] {
  try {
    const crudo = localStorage.getItem(clave(serie));
    if (!crudo) return [];
    return (JSON.parse(crudo) as unknown[]).flatMap((c) => {
      try {
        return [leerCopiaEstado(JSON.stringify(c))];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

/** Guarda la copia en este navegador. Devuelve false si no se pudo (modo privado, sin espacio…). */
export function guardarCopiaLocal(c: CopiaEstado): boolean {
  try {
    const todas = [c, ...copiasGuardadas(c.serie)].slice(0, MAX_COPIAS);
    localStorage.setItem(clave(c.serie), JSON.stringify(todas));
    return true;
  } catch {
    return false;
  }
}

export function nombreArchivoCopia(c: CopiaEstado, modelo: string): string {
  const limpio = modelo.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "movil";
  return `poda-copia-${limpio}-${c.creada.slice(0, 16).replace(/[:T]/g, "-")}.json`;
}

/** Descarga la copia como archivo, para tenerla aunque se borre el navegador. */
export function descargarCopia(c: CopiaEstado, modelo: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(c, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivoCopia(c, modelo);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
