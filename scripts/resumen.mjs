// Genera data/resumen.json: cuántos paquetes hay por fabricante, lista y nivel,
// con las correcciones de Poda (packages/nucleo/src/protecciones.ts).
// Uso: pnpm resumen   (necesita el núcleo compilado: pnpm build)
import { readFileSync, writeFileSync } from "node:fs";
import { NIVELES, nivelDe, paquetesDeFabricante } from "@poda/nucleo";

const raiz = new URL("../", import.meta.url);
const uad = JSON.parse(readFileSync(new URL("data/uad_lists.json", raiz), "utf8"));
const fab = Object.fromEntries(Object.entries(JSON.parse(readFileSync(new URL("data/fabricantes.json", raiz), "utf8"))).filter(([k]) => !k.startsWith("_")));

const cuenta = () => Object.fromEntries(NIVELES.map((n) => [n, 0]));
const por_fabricante = {};
for (const [nombre, prefijos] of Object.entries(fab)) {
  const c = cuenta();
  for (const x of paquetesDeFabricante(uad, prefijos)) c[x.nivel]++;
  por_fabricante[nombre] = { total: Object.values(c).reduce((a, b) => a + b, 0), ...c };
}
const por_lista = {};
const por_nivel = cuenta();
for (const [p, e] of Object.entries(uad)) {
  por_lista[e.list] = (por_lista[e.list] ?? 0) + 1;
  por_nivel[nivelDe(e, p)]++;
}
const out = { total_paquetes: Object.keys(uad).length, por_lista, por_nivel, por_fabricante };
writeFileSync(new URL("data/resumen.json", raiz), JSON.stringify(out, null, 2) + "\n");
console.log(JSON.stringify(out, null, 2));
