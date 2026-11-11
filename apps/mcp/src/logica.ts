// Lógica común del servidor MCP y de la línea de comandos.
import * as adb from "./adb.js";
import { fichaDesdeProps } from "@poda/nucleo";
import { lista, nivelDe, origenDe, NIVELES_DE_PERFIL, resumenDescripcion, type Nivel, type Perfil } from "./datos.js";
import { guardarCopia, leerCopia, hayCopiaReciente, registrar } from "./copias.js";

/** Avisos para la marca y la versión de Android: los mismos que enseña la web. */
export function avisosFabricante(p: Record<string, string>): string[] {
  return fichaDesdeProps(p).avisos;
}

export async function infoDispositivo(serie?: string) {
  const s = await adb.resolverSerie(serie);
  const p = await adb.propiedades(s);
  return { serie: s, propiedades: p, avisos: avisosFabricante(p) };
}

export async function analizar(opts: { serie?: string; perfil?: Perfil; max?: number }) {
  const perfil: Perfil = opts.perfil ?? "recomendado";
  const max = opts.max ?? 200;
  const s = await adb.resolverSerie(opts.serie);
  const estados = await adb.estadoPaquetes(s);
  const props = await adb.propiedades(s);
  const L = lista();
  const niveles = new Set<Nivel>(NIVELES_DE_PERFIL[perfil]);
  const porNivel: Record<Nivel, number> = { seguro: 0, avanzado: 0, experto: 0, bloqueado: 0 };
  let desconocidos = 0;
  let yaQuitados = 0;
  const propuesta: Record<string, unknown>[] = [];
  for (const [pkg, estado] of [...estados.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const e = L.get(pkg);
    if (estado === "quitado") {
      if (e) yaQuitados++;
      continue;
    }
    if (!e) {
      desconocidos++;
      continue;
    }
    const n = nivelDe(e, pkg);
    porNivel[n]++;
    if (!niveles.has(n)) continue;
    const item: Record<string, unknown> = {
      paquete: pkg,
      nivel: n,
      origen: origenDe(e),
      estado,
      descripcion_en: resumenDescripcion(e.description),
    };
    if (e.neededBy.length) item.aviso = `Lo necesitan: ${e.neededBy.join(", ")}`;
    if (e.dependencies.length) item.depende_de = e.dependencies;
    propuesta.push(item);
  }
  return {
    serie: s,
    modelo: `${props["ro.product.manufacturer"] ?? "?"} ${props["ro.product.model"] ?? ""}`.trim(),
    android: props["ro.build.version.release"],
    perfil,
    resumen: {
      paquetes_en_el_movil: [...estados.values()].filter((x) => x !== "quitado").length,
      conocidos_por_nivel: porNivel,
      fuera_de_la_lista: desconocidos,
      ya_quitados_antes: yaQuitados,
      en_la_propuesta: propuesta.length,
    },
    propuesta: propuesta.slice(0, max),
    truncada: propuesta.length > max,
    siguiente_paso:
      "Explica la propuesta al usuario en lenguaje normal, deja que quite o añada paquetes, crea una copia con crear_copia y solo entonces llama a aplicar con confirmar=true.",
    avisos: avisosFabricante(props),
  };
}

export function explicar(paquete: string) {
  const e = lista().get(paquete);
  if (!e) return null;
  return {
    paquete,
    nivel: nivelDe(e, paquete),
    origen: origenDe(e),
    descripcion_en: e.description.trim(),
    depende_de: e.dependencies,
    lo_necesitan: e.neededBy,
  };
}

export async function crearCopia(serie?: string) {
  const s = await adb.resolverSerie(serie);
  const estados = await adb.estadoPaquetes(s);
  const props = await adb.propiedades(s);
  const { ruta, copia } = guardarCopia(s, props, estados);
  registrar({ accion: "copia", serie: s, ruta });
  return { serie: s, ruta, creada: copia.creada, paquetes: estados.size };
}

export class ErrorPoda extends Error {}

export async function aplicar(opts: {
  serie?: string;
  paquetes: string[];
  modo?: "quitar" | "desactivar";
  confirmar?: boolean;
  incluir_fuera_de_lista?: boolean;
}) {
  const modo = opts.modo ?? "quitar";
  const s = await adb.resolverSerie(opts.serie);
  const estados = await adb.estadoPaquetes(s);
  const L = lista();
  const plan: { paquete: string; nivel: string }[] = [];
  const rechazados: { paquete: string; motivo: string }[] = [];
  for (const p of [...new Set(opts.paquetes)]) {
    if (!adb.esPaqueteValido(p)) {
      rechazados.push({ paquete: p, motivo: "nombre no válido" });
      continue;
    }
    const est = estados.get(p);
    if (!est) {
      rechazados.push({ paquete: p, motivo: "no está en este móvil" });
      continue;
    }
    if (est === "quitado" || (modo === "desactivar" && est === "desactivado")) {
      rechazados.push({ paquete: p, motivo: `ya está ${est}` });
      continue;
    }
    const e = L.get(p);
    if (!e && !opts.incluir_fuera_de_lista) {
      rechazados.push({ paquete: p, motivo: "no está en la lista de Poda (usa incluir_fuera_de_lista si el usuario lo pide)" });
      continue;
    }
    const n = e ? nivelDe(e, p) : "desconocido";
    if (n === "bloqueado") {
      rechazados.push({ paquete: p, motivo: "nivel bloqueado: quitarlo puede dejar el móvil sin arrancar" });
      continue;
    }
    plan.push({ paquete: p, nivel: n });
  }

  const comando = modo === "quitar" ? "pm uninstall -k --user 0" : "pm disable-user --user 0";
  if (!opts.confirmar) {
    return {
      modo: "simulacion",
      serie: s,
      se_aplicaria_a: plan,
      rechazados,
      comandos: plan.map((x) => `adb -s ${s} shell ${comando} ${x.paquete}`),
      copia_reciente: hayCopiaReciente(s),
      nota: "No se ha cambiado nada. Enseña este plan al usuario y pide su confirmación.",
    };
  }
  if (!hayCopiaReciente(s)) {
    throw new ErrorPoda("No hay copia de seguridad de este móvil en las últimas 24 h. Crea antes una copia (crear_copia).");
  }

  const ok = (out: string) => /Success|disabled-user|new state: disabled/i.test(out);
  const hechos: { paquete: string; resultado: string }[] = [];
  const fallidos: { paquete: string; error: string }[] = [];
  for (const { paquete } of plan) {
    let r = modo === "quitar" ? await adb.quitar(s, paquete) : await adb.desactivar(s, paquete);
    if (ok(r.salida)) {
      hechos.push({ paquete, resultado: modo === "quitar" ? "quitado" : "desactivado" });
      continue;
    }
    if (modo === "quitar") {
      // Algunos fabricantes no dejan quitar ciertos paquetes, pero sí desactivarlos.
      const r2 = await adb.desactivar(s, paquete);
      if (ok(r2.salida)) {
        hechos.push({ paquete, resultado: "desactivado (no se pudo quitar)" });
        continue;
      }
      r = r2;
    }
    fallidos.push({ paquete, error: (r.salida + r.error).trim() || "sin respuesta" });
  }
  registrar({ accion: "aplicar", serie: s, modo, hechos, fallidos, rechazados });
  return {
    serie: s,
    hechos,
    fallidos,
    rechazados,
    nota: "Si algo no va bien, usa restaurar con estos paquetes o con la última copia. Reinicia el móvil para notar el cambio.",
  };
}

export async function restaurar(opts: { serie?: string; paquetes?: string[]; copia?: string }) {
  if (!opts.paquetes?.length && !opts.copia) throw new ErrorPoda("Indica paquetes o una copia.");
  const s = await adb.resolverSerie(opts.serie);
  const ahora = await adb.estadoPaquetes(s);
  const objetivo = new Set<string>();
  if (opts.copia) {
    const c = leerCopia(s, opts.copia);
    for (const [p, est] of Object.entries(c.paquetes)) if (est === "instalado") objetivo.add(p);
  }
  for (const p of opts.paquetes ?? []) objetivo.add(p);

  const hechos: { paquete: string; accion: string }[] = [];
  const fallidos: { paquete: string; error: string }[] = [];
  for (const p of objetivo) {
    if (!adb.esPaqueteValido(p)) {
      fallidos.push({ paquete: p, error: "nombre no válido" });
      continue;
    }
    const est = ahora.get(p);
    if (est === "instalado") continue;
    if (!est) {
      fallidos.push({ paquete: p, error: "el sistema no lo conoce (no se puede reinstalar desde el móvil)" });
      continue;
    }
    if (est === "quitado") {
      const r = await adb.reinstalar(s, p);
      if (!/Success|installed for user/i.test(r.salida)) {
        fallidos.push({ paquete: p, error: (r.salida + r.error).trim() });
        continue;
      }
      await adb.activar(s, p); // por si además estaba desactivado
      hechos.push({ paquete: p, accion: "reinstalado" });
      continue;
    }
    const r2 = await adb.activar(s, p);
    if (/enabled/i.test(r2.salida)) hechos.push({ paquete: p, accion: "reactivado" });
    else fallidos.push({ paquete: p, error: (r2.salida + r2.error).trim() });
  }
  registrar({ accion: "restaurar", serie: s, copia: opts.copia, hechos, fallidos });
  return { serie: s, hechos, fallidos, sin_cambios: objetivo.size - hechos.length - fallidos.length };
}
