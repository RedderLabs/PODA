// Genera para la herramienta /conectar:
//  - public/lista.json: versión ligera de data/uad_lists.json (nivel y origen de cada paquete).
//  - public/detalles.json: descripción corta y quién lo necesita, solo de los paquetes que se pueden quitar.
//  - public/descripciones-<idioma>.json: las descripciones traducidas (data/descripciones, specs/007).
//  - public/protegidas.json: la lista abierta de Poda de lo que no se debe quitar (para cualquier otra herramienta).
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { AVISO_PODA, PROTEGIDOS, compactar, nivelDe, resumenDescripcion } from "@poda/nucleo";
const uad = JSON.parse(readFileSync(new URL("../../../data/uad_lists.json", import.meta.url), "utf8"));
mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
const salida = JSON.stringify(compactar(uad));
writeFileSync(new URL("../public/lista.json", import.meta.url), salida);

const detalles = {};
for (const [p, e] of Object.entries(uad)) {
  if (nivelDe(e, p) === "bloqueado") continue;
  const d = resumenDescripcion(e.description, 160);
  detalles[p] = e.neededBy.length ? [d, e.neededBy] : [d];
}
const salida2 = JSON.stringify(detalles);
writeFileSync(new URL("../public/detalles.json", import.meta.url), salida2);
console.log(`public/lista.json: ${Object.keys(uad).length} paquetes, ${(salida.length / 1024).toFixed(0)} KB · detalles.json: ${(salida2.length / 1024).toFixed(0)} KB`);

// Descripciones traducidas: paquete → texto, solo si la traducción es de la descripción actual
// (la clave es el SHA-1 del texto en inglés; ver scripts/descripciones.mjs).
const claveDescripcion = (t) => createHash("sha1").update(t).digest("hex").slice(0, 10);
for (const idioma of ["es", "pt", "fr", "ca"]) {
  const origen = new URL(`../../../data/descripciones/${idioma}.json`, import.meta.url);
  const traducidas = existsSync(origen) ? JSON.parse(readFileSync(origen, "utf8")) : {};
  const out = {};
  for (const [p, [d]] of Object.entries(detalles)) {
    const t = d && traducidas[claveDescripcion(d)];
    if (t) out[p] = t;
  }
  writeFileSync(new URL(`../public/descripciones-${idioma}.json`, import.meta.url), JSON.stringify(out));
  console.log(`descripciones-${idioma}.json: ${Object.keys(out).length} de ${Object.keys(detalles).length}`);
}

const protegidas = {
  nombre: "Lista de Poda: apps de Android que no conviene quitar",
  licencia: "GPL-3.0-or-later",
  web: "https://podamovil.com/sin-pc/",
  nunca: PROTEGIDOS.map((g) => ({
    grupo: g.titulo,
    motivo: g.motivo,
    paquetes: g.paquetes,
    familias: (g.familias ?? []).map((f) => ({ patron: f.patron.source, descripcion: f.texto })),
  })),
  con_cuidado: Object.entries(AVISO_PODA).map(([paquete, aviso]) => ({ paquete, aviso })),
};
writeFileSync(new URL("../public/protegidas.json", import.meta.url), JSON.stringify(protegidas, null, 2));
