// Pruebas de los textos de la web (especificación 002). Se ejecuta con --experimental-strip-types.
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatear } from "@poda/nucleo";
import { es } from "../textos/es.ts";
import { en } from "../textos/en.ts";
import { pt } from "../textos/pt.ts";
import { fr } from "../textos/fr.ts";
import { ca } from "../textos/ca.ts";

const OTROS = { en, pt, fr, ca };
const FORMAS = /\{(\w+)\|(?:[^|{}]|\{\w+\})*\|(?:[^{}]|\{\w+\})*\}/g;

/** Todas las cadenas de un diccionario, con su ruta de claves («conectar.quitables»). */
function cadenas(o, prefijo = "") {
  const out = new Map();
  for (const [k, v] of Object.entries(o)) {
    const ruta = prefijo ? `${prefijo}.${k}` : k;
    if (typeof v === "string") out.set(ruta, v);
    else if (v && typeof v === "object") for (const [r, s] of cadenas(v, ruta)) out.set(r, s);
  }
  return out;
}
const variablesConFormas = (s) => new Set([...s.matchAll(FORMAS)].map((m) => m[1]));

const base = cadenas(es);

test("002 R-003 CA-1: si el español marca singular y plural en un texto, los demás idiomas también", () => {
  const faltan = [];
  for (const [idioma, t] of Object.entries(OTROS)) {
    const suyas = cadenas(t);
    for (const [ruta, s] of base) {
      if (variablesConFormas(s).size && !variablesConFormas(suyas.get(ruta) ?? "").size) faltan.push(`${idioma}: ${ruta}`);
    }
  }
  assert.deepEqual(faltan, []);
});

// Una cifra pegada a un sustantivo contable, sin formas, saldría «1 apps» (o «1 intentos»).
const CONTABLES = /\{\w+\}\**\s+(?:[\wÀ-ÿ·']+\s+)?(apps|applis|intentos|intents|tentativas|tentatives|tries)\b/;

test("002 R-001: ningún idioma deja una cifra con «apps» (o «intentos») sin singular", () => {
  const sueltos = [];
  for (const [idioma, t] of Object.entries({ es, ...OTROS })) {
    for (const [ruta, s] of cadenas(t)) if (CONTABLES.test(s.replace(FORMAS, "·"))) sueltos.push(`${idioma}: ${ruta}`);
  }
  assert.deepEqual(sueltos, []);
});

test("002 R-001 CA-1: con 1 app, la web habla en singular", () => {
  assert.equal(formatear(es.conectar.quitables, { n: 1 }, "es"), "**1** app de serie que puedes quitar sin riesgo");
  assert.equal(formatear(es.podar.vasAQuitar, { n: 1, nombre: "Pixel 8" }, "es"), "Vas a quitar *1 app* de Pixel 8.");
});

test("002 R-001 CA-2: con 0 o 2, en plural", () => {
  assert.equal(formatear(es.conectar.quitables, { n: 2 }, "es"), "**2** apps de serie que puedes quitar sin riesgo");
  assert.equal(formatear(es.conectar.quitables, { n: 0 }, "es"), "**0** apps de serie que puedes quitar sin riesgo");
});

// Especificación 003: guía de HarmonyOS NEXT (fase A).
const TODOS = { es, ...OTROS };

test("003 R-001 CA-3: la guía de HarmonyOS NEXT existe en los cinco idiomas con la misma estructura", () => {
  for (const [idioma, t] of Object.entries(TODOS)) {
    assert.ok(t.harmonyNext, `${idioma}: falta la sección harmonyNext`);
    assert.equal(t.harmonyNext.pasos.length, es.harmonyNext.pasos.length, `${idioma}: pasos`);
    assert.equal(t.harmonyNext.noQuitar.length, es.harmonyNext.noQuitar.length, `${idioma}: noQuitar`);
  }
});

test("003 R-001 CA-2: la guía dice que Poda no se conecta a HarmonyOS NEXT y enlaza /conectar/ para Android", () => {
  for (const [idioma, t] of Object.entries(TODOS)) {
    assert.ok(t.harmonyNext.limitesTexto.length > 40, `${idioma}: limitesTexto`);
    assert.match(t.harmonyNext.nota, /\]\(\/conectar\/\)/, `${idioma}: nota sin enlace a /conectar/`);
  }
});

test("003 R-002 CA-1: /conectar enlaza la guía en todos los idiomas", () => {
  for (const [idioma, t] of Object.entries(TODOS)) assert.match(t.conectar.harmonyNext, /\]\(\/harmonyos-next\/\)/, idioma);
});

// Error: el francés tenía \x01 en lugar de «:», «?», «!» o «;» (desde 37ab748).
test("ningún texto tiene caracteres de control", () => {
  const malos = [];
  for (const [idioma, t] of Object.entries(TODOS)) {
    for (const [ruta, s] of cadenas(t)) if (/[\x00-\x09\x0b-\x1f\x7f]/.test(s)) malos.push(`${idioma}: ${ruta}`);
  }
  assert.deepEqual(malos, []);
});

test("004 R-005: /conectar explica en cada idioma lo que no se quita nunca, ni en experto, y que se puede restaurar", async () => {
  const { readFileSync } = await import("node:fs");
  const pagina = readFileSync(new URL("../paginas/PaginaConectar.tsx", import.meta.url), "utf8");
  assert.match(pagina, /<GruposProtegidos idioma=\{idioma\} \/>/, "PaginaConectar no muestra los grupos protegidos");
  const experto = { es: /experto/, en: /expert/, pt: /experto/, fr: /expert/, ca: /expert/ };
  const restaurar = { es: /restaurar/, en: /restore/, pt: /restaur/, fr: /restaurer/, ca: /restaurar/ };
  for (const [idioma, t] of Object.entries(TODOS)) {
    assert.ok(t.conectar.protegidasTitulo?.trim(), `${idioma}: protegidasTitulo`);
    assert.match(t.conectar.protegidasTexto, experto[idioma], `${idioma}: no dice que tampoco en experto`);
    assert.match(t.conectar.protegidasTexto, restaurar[idioma], `${idioma}: no dice que se puede restaurar`);
  }
});

test("005 R-002: textos de lo que quita cada perfil por origen, en los cinco idiomas y con sus variables", () => {
  for (const [idioma, t] of Object.entries(TODOS)) {
    const p = t.podar;
    assert.match(p.origenTitulo, /\{perfil\}/, `${idioma}: origenTitulo sin {perfil}`);
    assert.match(p.origenFila, /\{n\}/, `${idioma}: origenFila sin {n}`);
    assert.match(p.origenFila, /\{total\}/, `${idioma}: origenFila sin {total}`);
    assert.ok(p.origenNota?.trim(), `${idioma}: origenNota`);
  }
});

test("006 R-002: los textos ya no dicen que vienen marcadas todas y avisan de las de experto", () => {
  const viejo = /marcadas todas|all its apps come ticked|All the apps in the profile come ticked|todos os apps dele vêm marcados|Todos os apps do perfil vêm marcados|toutes ses applis sont cochées|Toutes les applis du profil sont cochées|totes les seves apps vénen marcades|Totes les apps del perfil vénen marcades/;
  for (const [idioma, t] of Object.entries(TODOS)) {
    assert.ok(t.podar.sinMarcar?.trim(), `${idioma}: podar.sinMarcar`);
    assert.ok(t.podar.sinMarcarAvanzadas?.trim(), `${idioma}: podar.sinMarcarAvanzadas`);
    for (const [ruta, s] of cadenas(t)) assert.doesNotMatch(s, viejo, `${idioma}: ${ruta}`);
  }
});

test("007 R-005: textos de la traducción en los cinco idiomas; la nota ya no dice que siempre van en inglés", () => {
  for (const [idioma, t] of Object.entries(TODOS)) {
    for (const k of ["traducirBoton", "traduciendo", "traducirNota", "traducidas", "sinTraductor"]) assert.ok(t.podar[k]?.trim(), `${idioma}: podar.${k}`);
  }
  for (const [idioma, re] of Object.entries({ es: /descripciones en inglés de la lista/, pt: /descrições em inglês, da lista/, fr: /descriptions en anglais issues/, ca: /descripcions en anglès de la llista/ })) {
    assert.doesNotMatch(TODOS[idioma].podar.listaNota, re, idioma);
  }
});

test("007 R-006: hay traducción de casi todas las descripciones y conservan paquetes, enlaces y código", async () => {
  const { readFileSync, existsSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const clave = (t) => createHash("sha1").update(t).digest("hex").slice(0, 10);
  const detalles = new URL("../public/detalles.json", import.meta.url);
  if (!existsSync(detalles)) return; // sin compilar todavía (pnpm lista)
  const originales = new Map(Object.values(JSON.parse(readFileSync(detalles, "utf8"))).filter((v) => v[0]).map((v) => [clave(v[0]), v[0]]));
  const intocables = (s) => [...(s.match(/https?:\/\/[^\s)\]]+/g) ?? []), ...(s.match(/`[^`]+`/g) ?? []), ...(s.match(/\b[a-zA-Z][\w-]*(?:\.[a-zA-Z_][\w-]*){2,}\b/g) ?? [])];
  for (const idioma of ["es", "pt", "fr", "ca"]) {
    const t = JSON.parse(readFileSync(new URL(`../../../data/descripciones/${idioma}.json`, import.meta.url), "utf8"));
    const hechas = [...originales.keys()].filter((k) => t[k]).length;
    assert.ok(hechas / originales.size >= 0.99, `${idioma}: solo ${hechas} de ${originales.size}`);
    const rotas = [];
    for (const [k, en] of originales) if (t[k]) for (const x of intocables(en)) if (!t[k].includes(x)) rotas.push(`${k}: ${x}`);
    assert.deepEqual(rotas, [], idioma);
  }
});

test("008 R-006: textos de la comprobación tras reiniciar en los cinco idiomas", () => {
  const claves = ["comprobando", "trasTitulo", "todoBien", "todoBienSinApps", "arrancoBien", "noArranco", "inicioBien", "inicioMal", "tecladoBien", "tecladoMal", "sinComprobar", "queInicio", "queTeclado", "protegidasBien", "protegidasMal", "appsBien", "appsMal", "appCambio", "volvieron", "volverAElegir", "restaurarCopia", "llamada"];
  for (const [idioma, t] of Object.entries(TODOS)) {
    for (const k of claves) assert.ok(t.conectar[k]?.trim(), `${idioma}: conectar.${k}`);
    for (const e of ["instalado", "desactivado", "quitado"]) assert.ok(t.conectar.estadoApp?.[e]?.trim(), `${idioma}: estadoApp.${e}`);
    assert.match(t.conectar.noArranco, /\(\/rescate\/\)/, `${idioma}: enlace a rescate`);
    // Poda no comprueba las llamadas: no se puede prometer (AGENTS.md, honestidad en los textos)
    assert.equal(t.conectar.arranco, undefined, `${idioma}: el antiguo «arrancó bien» ya no existe`);
  }
});

test("009 R-005: textos de «Antes y después» en los cinco idiomas", () => {
  for (const [idioma, t] of Object.entries(TODOS)) {
    for (const k of ["compTitulo", "compTexto", "compApps", "compCopia", "compAhora", "compVer", "compSinCambios", "compMovil"]) assert.ok(t.podar[k]?.trim(), `${idioma}: podar.${k}`);
    for (const e of ["instalado", "desactivado", "quitado"]) assert.ok(t.podar.compFilas?.[e]?.trim(), `${idioma}: compFilas.${e}`);
    assert.match(t.podar.compTexto, /\{fecha\}/, `${idioma}: la fecha de la copia`);
  }
});

test("010 R-007: el bloque del fondo de recuerdo está en los cinco idiomas y dice que el fondo actual no cambia", () => {
  const claves = Object.keys(es.fondo);
  for (const [idioma, d] of Object.entries({ es, ...OTROS })) {
    assert.deepEqual(Object.keys(d.fondo ?? {}), claves, `${idioma}: claves de fondo`);
    for (const k of claves) assert.ok(d.fondo[k].trim(), `${idioma}: fondo.${k} vacío`);
  }
  // R-001 CA-3: en español, el texto dice que el fondo actual no cambia
  assert.match(es.fondo.texto, /no cambia/);
});
