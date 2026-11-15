// Comprueba las traducciones de las descripciones de UAD-ng (specs/007 R-006).
// Uso: node scripts/comprobar-descripciones.mjs [lote]   (sin lote: todos los que tengan partes)
// Para cada idioma: mismas claves que el lote, ningún texto vacío ni igual al inglés si es largo,
// y los nombres de paquete, enlaces y `código` intactos.
import { existsSync, readdirSync, readFileSync } from "node:fs";

const IDIOMAS = ["es", "pt", "fr", "ca"];
const raiz = new URL("../data/descripciones/", import.meta.url);
const lotes = process.argv[2]
  ? [process.argv[2].padStart(2, "0")]
  : readdirSync(new URL("lotes/", raiz)).map((f) => f.replace(".json", "")).sort();

// Lo que no se traduce: paquetes (a.b.c), enlaces y lo que va entre comillas invertidas.
const intocables = (s) => [
  ...(s.match(/https?:\/\/[^\s)\]]+/g) ?? []),
  ...(s.match(/`[^`]+`/g) ?? []),
  ...(s.match(/\b[a-zA-Z][\w-]*(?:\.[a-zA-Z_][\w-]*){2,}\b/g) ?? []),
];

let errores = 0;
const mal = (m) => {
  errores++;
  console.log("✖ " + m);
};

for (const lote of lotes) {
  const origen = JSON.parse(readFileSync(new URL(`lotes/${lote}.json`, raiz), "utf8"));
  for (const idioma of IDIOMAS) {
    const ruta = new URL(`partes/${idioma}-${lote}.json`, raiz);
    if (!existsSync(ruta)) {
      if (process.argv[2]) mal(`${idioma}-${lote}: no existe`);
      continue;
    }
    let t;
    try {
      t = JSON.parse(readFileSync(ruta, "utf8"));
    } catch (e) {
      mal(`${idioma}-${lote}: JSON no válido (${e.message})`);
      continue;
    }
    for (const [k, en] of Object.entries(origen)) {
      const tr = t[k];
      if (typeof tr !== "string" || !tr.trim()) {
        mal(`${idioma}-${lote} ${k}: falta`);
        continue;
      }
      if (en.length > 40 && tr.trim() === en.trim()) mal(`${idioma}-${lote} ${k}: sin traducir`);
      for (const x of intocables(en)) if (!tr.includes(x)) mal(`${idioma}-${lote} ${k}: falta «${x}»`);
      if (/[\x00-\x09\x0b-\x1f]/.test(tr)) mal(`${idioma}-${lote} ${k}: carácter de control`);
    }
    for (const k of Object.keys(t)) if (!(k in origen)) mal(`${idioma}-${lote} ${k}: clave que no está en el lote`);
  }
}
console.log(errores ? `${errores} errores` : `Lotes ${lotes.join(", ")}: bien`);
process.exit(errores ? 1 : 0);
