// Cruza lo que hay en el móvil con la lista compacta.
import { NIVELES, type Nivel } from "./niveles.js";
import type { ListaCompacta } from "./lista.js";

export interface Recuento {
  total: number; // instalados o desactivados para el usuario
  conocidos: number;
  porNivel: Record<Nivel, number>;
  porOrigen: Record<string, number>; // sin contar los bloqueados
  yaQuitados: number;
  ejemplos: string[];
}

/** `todos` = pm list packages -u; `presentes` = pm list packages (instalados, incluidos los desactivados). */
export function contar(todos: Set<string>, presentes: Set<string>, lista: ListaCompacta): Recuento {
  const porNivel: Record<Nivel, number> = { seguro: 0, avanzado: 0, experto: 0, bloqueado: 0 };
  const porOrigen: Record<string, number> = {};
  const ejemplos: string[] = [];
  let conocidos = 0;
  let yaQuitados = 0;
  for (const pkg of todos) {
    const e = lista.p[pkg];
    if (!presentes.has(pkg)) {
      if (e) yaQuitados++;
      continue;
    }
    if (!e) continue;
    conocidos++;
    const nivel = NIVELES[e[0]] ?? "bloqueado";
    porNivel[nivel]++;
    if (nivel !== "bloqueado") {
      const origen = lista.origenes[e[1]] ?? "otro";
      porOrigen[origen] = (porOrigen[origen] ?? 0) + 1;
    }
    if (nivel === "seguro" && ejemplos.length < 6) ejemplos.push(pkg);
  }
  return { total: presentes.size, conocidos, porNivel, porOrigen, yaQuitados, ejemplos };
}
