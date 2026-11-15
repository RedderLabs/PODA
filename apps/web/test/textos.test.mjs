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
