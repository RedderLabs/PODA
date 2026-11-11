#!/usr/bin/env node
// Línea de comandos de Poda. Hace lo mismo que el servidor MCP, para usarlo a mano
// o desde un asistente que todavía no tiene el MCP cargado.
import * as adb from "./adb.js";
import * as logica from "./logica.js";
import { listarCopias } from "./copias.js";
import type { Perfil } from "./datos.js";

const AYUDA = `poda — quita el bloatware de un móvil Android con adb

  poda dispositivos
  poda emparejar <ip:puerto> <código>      (Android 11+, depuración inalámbrica)
  poda conectar <ip:puerto>
  poda info [--serie S]
  poda analizar [--perfil seguro|recomendado|experto] [--max N] [--serie S]
  poda explicar <paquete>
  poda copia [--serie S]
  poda copias [--serie S]
  poda aplicar <paquete>... [--desactivar] [--confirmar] [--fuera-de-lista] [--serie S]
  poda restaurar <paquete>... [--serie S]
  poda restaurar --copia <archivo> [--serie S]

Sin --confirmar, «aplicar» solo enseña el plan. Con --confirmar exige una copia de las
últimas 24 h y nunca toca paquetes de nivel bloqueado. Salida en JSON.`;

function parsear(argv: string[]) {
  const pos: string[] = [];
  const op: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const v = argv[i + 1];
      if (["serie", "perfil", "max", "copia"].includes(k) && v !== undefined) {
        op[k] = v;
        i++;
      } else op[k] = true;
    } else pos.push(a);
  }
  return { pos, op };
}

const imprimir = (o: unknown) => console.log(typeof o === "string" ? o : JSON.stringify(o, null, 2));

async function main() {
  const [cmd, ...resto] = process.argv.slice(2);
  const { pos, op } = parsear(resto);
  const serie = typeof op.serie === "string" ? op.serie : undefined;
  switch (cmd) {
    case "dispositivos":
      return imprimir(await adb.dispositivos());
    case "emparejar": {
      const r = await adb.emparejar(pos[0] ?? "", pos[1] ?? "");
      return imprimir((r.salida + r.error).trim());
    }
    case "conectar": {
      const r = await adb.conectar(pos[0] ?? "");
      return imprimir((r.salida + r.error).trim());
    }
    case "info":
      return imprimir(await logica.infoDispositivo(serie));
    case "analizar": {
      const perfil = (op.perfil as Perfil) ?? "recomendado";
      if (!["seguro", "recomendado", "experto"].includes(perfil)) throw new Error("Perfil: seguro, recomendado o experto.");
      return imprimir(await logica.analizar({ serie, perfil, max: op.max ? Number(op.max) : 1000 }));
    }
    case "explicar": {
      const r = logica.explicar(pos[0] ?? "");
      return imprimir(r ?? `${pos[0]} no está en la lista de Poda.`);
    }
    case "copia":
      return imprimir(await logica.crearCopia(serie));
    case "copias":
      return imprimir(listarCopias(serie));
    case "aplicar":
      if (!pos.length) throw new Error("Indica al menos un paquete.");
      return imprimir(
        await logica.aplicar({
          serie,
          paquetes: pos,
          modo: op.desactivar ? "desactivar" : "quitar",
          confirmar: !!op.confirmar,
          incluir_fuera_de_lista: !!op["fuera-de-lista"],
        }),
      );
    case "restaurar":
      return imprimir(await logica.restaurar({ serie, paquetes: pos, copia: typeof op.copia === "string" ? op.copia : undefined }));
    default:
      imprimir(AYUDA);
      if (cmd && cmd !== "ayuda" && cmd !== "--help" && cmd !== "-h") process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
