// Pruebas de la traducción de descripciones (especificación 007). Traductor de mentira: no hace falta Chrome.
import { test } from "node:test";
import assert from "node:assert/strict";
import { disponibilidad, crearTraductor, traducirPendientes } from "../lib/traducir.ts";

const falso = (d, { falla = false } = {}) => {
  const llamadas = [];
  return {
    llamadas,
    availability: async (o) => (llamadas.push(["availability", o]), d),
    create: async (o) => {
      llamadas.push(["create", o]);
      if (falla) throw new Error("NotAllowedError");
      return { translate: async (t) => (llamadas.push(["translate", t]), `ES:${t}`) };
    },
  };
};

test("007 R-001 CA-1 y CA-2: idioma descargado → lista; por descargar → descargable", async () => {
  assert.equal(await disponibilidad("es", falso("available")), "lista");
  assert.equal(await disponibilidad("es", falso("downloadable")), "descargable");
  assert.equal(await disponibilidad("es", falso("downloading")), "descargable");
  const api = falso("available");
  await disponibilidad("fr", api);
  assert.deepEqual(api.llamadas[0], ["availability", { sourceLanguage: "en", targetLanguage: "fr" }]);
});

test("007 R-002: sin traductor, idioma no disponible o error → sin-traductor", async () => {
  assert.equal(await disponibilidad("es", null), "sin-traductor");
  assert.equal(await disponibilidad("ca", falso("unavailable")), "sin-traductor");
  assert.equal(await crearTraductor("es", falso("downloadable", { falla: true })), null);
});

test("007 R-003: con la web en inglés no se llama al traductor", async () => {
  const api = falso("available");
  assert.equal(await disponibilidad("en", api), "no-hace-falta");
  assert.equal(await crearTraductor("en", api), null);
  assert.deepEqual(api.llamadas, []);
});

test("007 R-001 CA-3: traduce solo lo que falta, sin repetir, y para si se le pide", async () => {
  const api = falso("available");
  const t = await crearTraductor("es", api);
  const hechas = {};
  await traducirPendientes(t, ["a", "b", "a", "", "c"], { c: "ya" }, (o, r) => (hechas[o] = r));
  assert.deepEqual(hechas, { a: "ES:a", b: "ES:b" });
  assert.deepEqual(api.llamadas.filter((x) => x[0] === "translate").map((x) => x[1]), ["a", "b"]);

  let n = 0;
  await traducirPendientes(t, ["x", "y", "z"], {}, () => n++, () => n < 1);
  assert.equal(n, 1);
});
