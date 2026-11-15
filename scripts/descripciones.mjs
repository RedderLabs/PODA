// Traducciones de las descripciones de UAD-ng (specs/007 R-006).
//
//   node scripts/descripciones.mjs lotes [n]  → data/descripciones/lotes/NN.json con lo que falte por
//                                               traducir en algún idioma, en n lotes (16 por defecto).
//   node scripts/descripciones.mjs unir       → junta data/descripciones/partes/<idioma>-NN.json (ya
//                                               revisadas con comprobar-descripciones.mjs) en
//                                               data/descripciones/<idioma>.json.
//
// Clave de cada descripción: los 10 primeros caracteres del SHA-1 del texto en inglés (el mismo
// recorte que publica la web). Si UAD-ng cambia una descripción, cambia la clave y se ve en inglés
// hasta que se traduzca otra vez.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { nivelDe, resumenDescripcion } from "@poda/nucleo";

export const IDIOMAS_TRADUCIDOS = ["es", "pt", "fr", "ca"];
export const claveDescripcion = (texto) => createHash("sha1").update(texto).digest("hex").slice(0, 10);

const raiz = new URL("../data/descripciones/", import.meta.url);
const leer = (u, si = {}) => (existsSync(u) ? JSON.parse(readFileSync(u, "utf8")) : si);
const escribir = (u, datos) => writeFileSync(u, JSON.stringify(datos, null, 1) + "\n");
const ordenado = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

/** Las descripciones que publica la web (las de las apps que se pueden quitar), por clave. */
function descripcionesDeLaWeb() {
  const uad = JSON.parse(readFileSync(new URL("../data/uad_lists.json", import.meta.url), "utf8"));
  const out = {};
  for (const [p, e] of Object.entries(uad)) {
    if (nivelDe(e, p) === "bloqueado") continue;
    const d = resumenDescripcion(e.description, 160);
    if (d) out[claveDescripcion(d)] = d;
  }
  return out;
}

const orden = process.argv[2];
if (orden === "lotes") {
  const n = Number(process.argv[3] ?? 16);
  const hechas = IDIOMAS_TRADUCIDOS.map((i) => leer(new URL(`${i}.json`, raiz)));
  const faltan = Object.entries(descripcionesDeLaWeb())
    .filter(([k]) => hechas.some((h) => !h[k]))
    .sort(([a], [b]) => a.localeCompare(b));
  mkdirSync(new URL("lotes/", raiz), { recursive: true });
  mkdirSync(new URL("partes/", raiz), { recursive: true });
  const tam = Math.ceil(faltan.length / n) || 1;
  let i = 0;
  for (; i * tam < faltan.length; i++) {
    escribir(new URL(`lotes/${String(i + 1).padStart(2, "0")}.json`, raiz), Object.fromEntries(faltan.slice(i * tam, (i + 1) * tam)));
  }
  console.log(`${faltan.length} descripciones por traducir en ${i} lotes`);
} else if (orden === "unir") {
  const lotes = existsSync(new URL("lotes/", raiz)) ? readdirSync(new URL("lotes/", raiz)).map((f) => f.replace(".json", "")) : [];
  const vigentes = descripcionesDeLaWeb();
  for (const idioma of IDIOMAS_TRADUCIDOS) {
    const u = new URL(`${idioma}.json`, raiz);
    const todo = leer(u);
    let nuevas = 0;
    for (const lote of lotes) {
      const parte = leer(new URL(`partes/${idioma}-${lote}.json`, raiz), null);
      if (!parte) continue;
      for (const [k, v] of Object.entries(parte)) if (typeof v === "string" && v.trim()) (todo[k] = v), nuevas++;
    }
    // Fuera las que ya no publica la web (UAD-ng las cambió o quitó).
    for (const k of Object.keys(todo)) if (!vigentes[k]) delete todo[k];
    escribir(u, ordenado(todo));
    const total = Object.keys(vigentes).length;
    console.log(`${idioma}: ${Object.keys(todo).length} de ${total} (${nuevas} de los lotes)`);
  }
} else {
  console.log("Uso: node scripts/descripciones.mjs lotes [n] | unir");
  process.exit(1);
}
