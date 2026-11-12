// Pruebas del núcleo: reconocimiento de móviles, validación de paquetes y recuento.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fichaDesdeProps, parsearGetprop, esPaqueteValido, paquetesDe, compactar, contar, paquetesDeFabricante, NIVELES_DE_PERFIL } from "../dist/index.js";

const gp = (o) => Object.entries(o).map(([k, v]) => `[${k}]: [${v}]`).join("\n");
const casos = [
  ["Redmi con MIUI 12.5", { "ro.product.manufacturer": "Xiaomi", "ro.product.brand": "Redmi", "ro.product.model": "M1906G7G", "ro.product.marketname": "Redmi Note 8 Pro", "ro.build.version.release": "11", "ro.build.version.sdk": "30", "ro.miui.ui.version.name": "V125", "ro.build.version.incremental": "V12.5.4.0.RGGEUXM" }, { nombre: "Redmi Note 8 Pro", capa: "MIUI 12.5.4", familia: "xiaomi", wifiPosible: true }],
  ["Redmi Android 9", { "ro.product.manufacturer": "Xiaomi", "ro.product.brand": "xiaomi", "ro.product.model": "Redmi Note 7", "ro.build.version.release": "9", "ro.build.version.sdk": "28", "ro.miui.ui.version.name": "V11", "ro.build.version.incremental": "9.9.3" }, { nombre: "Redmi Note 7", capa: "MIUI 11", wifiPosible: false }],
  ["POCO con HyperOS", { "ro.product.manufacturer": "Xiaomi", "ro.product.brand": "POCO", "ro.product.model": "23113RKC6G", "ro.product.marketname": "POCO F6", "ro.build.version.release": "14", "ro.build.version.sdk": "34", "ro.mi.os.version.name": "OS1.0", "ro.miui.ui.version.name": "V816" }, { nombre: "POCO F6", capa: "HyperOS 1.0" }],
  ["Samsung One UI 6.1", { "ro.product.manufacturer": "samsung", "ro.product.brand": "samsung", "ro.product.model": "SM-S918B", "ro.build.version.release": "14", "ro.build.version.sdk": "34", "ro.build.version.oneui": "60100" }, { nombre: "Samsung SM-S918B", capa: "One UI 6.1", familia: "samsung" }],
  ["Samsung One UI 6.1.1", { "ro.product.manufacturer": "samsung", "ro.product.brand": "samsung", "ro.product.model": "SM-A556B", "ro.build.version.sdk": "34", "ro.build.version.release": "14", "ro.build.version.oneui": "60101" }, { capa: "One UI 6.1.1" }],
  ["realme", { "ro.product.manufacturer": "realme", "ro.product.brand": "realme", "ro.product.model": "RMX3771", "ro.build.version.sdk": "34", "ro.build.version.release": "14", "ro.build.version.oplusrom": "V14.0.0" }, { capa: "realme UI (base 14.0.0)", familia: "oplus" }],
  ["Huawei EMUI", { "ro.product.manufacturer": "HUAWEI", "ro.product.brand": "HUAWEI", "ro.product.model": "ELS-NX9", "ro.config.marketing_name": "HUAWEI P40 Pro", "ro.build.version.sdk": "29", "ro.build.version.release": "10", "ro.build.version.emui": "EmotionUI_12.0.0" }, { nombre: "HUAWEI P40 Pro", capa: "EMUI 12.0.0", familia: "huawei" }],
  ["Pixel", { "ro.product.manufacturer": "Google", "ro.product.brand": "google", "ro.product.model": "Pixel 8", "ro.build.version.sdk": "35", "ro.build.version.release": "15" }, { nombre: "Pixel 8", capa: "Android de Google (Pixel)", avisos: [] }],
  ["LG Android 4.4", { "ro.product.manufacturer": "LGE", "ro.product.brand": "lge", "ro.product.model": "LG-D855", "ro.build.version.sdk": "19", "ro.build.version.release": "4.4.2" }, { quitarPosible: false, nombre: "LG LG-D855" }],
  ["Redmi Note 4 con LineageOS 18.1", { "ro.product.manufacturer": "Xiaomi", "ro.product.brand": "Xiaomi", "ro.product.model": "Redmi Note 4", "ro.product.device": "mido", "ro.build.version.release": "11", "ro.build.version.sdk": "30", "ro.lineage.build.version": "18.1", "ro.build.display.id": "lineage_mido-userdebug 11 RQ3A.211001.001 eng.zeelog.20211007.085418 release-keys" }, { nombre: "Redmi Note 4", capa: "LineageOS 18.1", romPersonalizada: "LineageOS 18.1" }],
  ["LineageOS sin la propiedad de versión", { "ro.product.manufacturer": "Xiaomi", "ro.product.brand": "Xiaomi", "ro.product.model": "Redmi Note 4", "ro.build.version.release": "11", "ro.build.version.sdk": "30", "ro.build.display.id": "lineage_mido-userdebug 11 RQ3A.211001.001 release-keys" }, { capa: "LineageOS", romPersonalizada: "LineageOS" }],
];
for (const [nombre, props, esperado] of casos) {
  test(`ficha: ${nombre}`, () => {
    const f = fichaDesdeProps(parsearGetprop(gp(props)));
    for (const [k, v] of Object.entries(esperado)) assert.deepEqual(f[k], v, k);
  });
}

test("LineageOS en un Xiaomi: sin avisos de MIUI", () => {
  const f = fichaDesdeProps(parsearGetprop(gp(casos.at(-1)[1])));
  assert.ok(!f.avisos.some((a) => a.includes("ajustes de seguridad")));
  assert.ok(f.avisos.some((a) => a.includes("sistema alternativo")));
});

test("getprop: CRLF, vacíos y corchetes", () => {
  assert.equal(parsearGetprop("[a]: [1]\r\n[b.c]: []\r\nbasura\n[d]: [x [y] z]")["d"], "x [y] z");
});

test("avisos de Xiaomi en un Android 9", () => {
  const f = fichaDesdeProps(parsearGetprop(gp(casos[1][1])));
  assert.ok(f.avisos.some((a) => a.includes("ajustes de seguridad")));
  assert.ok(f.avisos.some((a) => a.includes("cable")));
});

test("validación de paquetes frente a inyección", () => {
  assert.ok(esPaqueteValido("com.miui.msa.global"));
  for (const malo of ["com.x; reboot", "com.x && rm -rf /", "$(id)", "com", "com.x\nreboot", "a".repeat(300) + ".b"]) assert.equal(esPaqueteValido(malo), false, malo);
});

test("perfiles: bloqueado no entra nunca", () => {
  for (const niveles of Object.values(NIVELES_DE_PERFIL)) assert.ok(!niveles.includes("bloqueado"));
});

const uad = JSON.parse(readFileSync(new URL("../../../data/uad_lists.json", import.meta.url), "utf8"));
test("lista compacta y recuento", () => {
  const lista = compactar(uad);
  assert.equal(Object.keys(lista.p).length, Object.keys(uad).length);
  const todos = paquetesDe("package:com.miui.msa.global\npackage:com.miui.analytics\npackage:com.ejemplo.x\npackage:com.miui.cleanmaster\npackage:com.xiaomi.micloud.sdk");
  const presentes = paquetesDe("package:com.miui.msa.global\npackage:com.miui.analytics\npackage:com.ejemplo.x\npackage:com.xiaomi.micloud.sdk");
  const r = contar(todos, presentes, lista);
  assert.deepEqual([r.total, r.conocidos, r.yaQuitados, r.porNivel.bloqueado, r.porNivel.seguro], [4, 3, 1, 1, 2]);
});

test("paquetes por fabricante, ordenados por nivel", () => {
  const xiaomi = paquetesDeFabricante(uad, ["com.miui.", "com.xiaomi.", "com.mi."]);
  assert.ok(xiaomi.length > 200);
  assert.equal(xiaomi[0].nivel, "seguro");
  assert.equal(xiaomi.at(-1).nivel, "bloqueado");
});

// ------------------------------------------------------------- operaciones
import { estadosDe, planDePerfil, tamanoPerfiles, COMANDOS, RESPUESTA_OK, crearCopiaEstado, leerCopiaEstado, pasosParaRestaurar } from "../dist/index.js";

const listaMini = {
  v: 1,
  niveles: ["seguro", "avanzado", "experto", "bloqueado"],
  origenes: ["fabricante", "operadora", "Google", "terceros", "Android base"],
  p: { "com.a.anuncios": [0, 0], "com.b.tienda": [1, 0], "com.c.sistema": [2, 4], "com.d.vital": [3, 4], "com.e.quitada": [0, 3] },
};
const est = estadosDe(
  new Set(["com.a.anuncios", "com.b.tienda", "com.c.sistema", "com.d.vital", "com.e.quitada", "com.x.mia"]),
  new Set(["com.a.anuncios", "com.b.tienda", "com.c.sistema", "com.d.vital", "com.x.mia"]),
  new Set(["com.b.tienda"]),
);

test("estados de los paquetes", () => {
  assert.equal(est.get("com.e.quitada"), "quitado");
  assert.equal(est.get("com.b.tienda"), "desactivado");
  assert.equal(est.get("com.a.anuncios"), "instalado");
});

test("plan de perfil: nunca bloqueados, quitados ni desconocidos", () => {
  const plan = planDePerfil(est, listaMini, "experto").map((x) => x.paquete);
  assert.deepEqual(plan, ["com.a.anuncios", "com.b.tienda", "com.c.sistema"]);
  assert.deepEqual(tamanoPerfiles(est, listaMini), { seguro: 1, recomendado: 2, experto: 3 });
});

test("comandos: rechazan nombres peligrosos", () => {
  assert.deepEqual(COMANDOS.quitar("com.a.anuncios"), ["pm", "uninstall", "-k", "--user", "0", "com.a.anuncios"]);
  assert.throws(() => COMANDOS.quitar("com.a; reboot"));
  assert.ok(RESPUESTA_OK.desactivar("Package com.x new state: disabled-user"));
  assert.ok(!RESPUESTA_OK.activar("Package com.x new state: disabled-user"));
  assert.ok(RESPUESTA_OK.activar("Package com.x new state: enabled"));
});

test("copia y restauración: solo deshace", () => {
  const copia = leerCopiaEstado(JSON.stringify(crearCopiaEstado("s1", {}, est)));
  const despues = new Map(est);
  despues.set("com.a.anuncios", "quitado");
  despues.set("com.c.sistema", "desactivado");
  despues.set("com.b.tienda", "instalado"); // estaba desactivado: no se vuelve a desactivar
  assert.deepEqual(pasosParaRestaurar(copia, despues), [
    { paquete: "com.a.anuncios", accion: "reinstalar" },
    { paquete: "com.c.sistema", accion: "activar" },
  ]);
  // «android» (el sistema) no tiene punto: se ignora sin dar la copia por dañada.
  const conSistema = leerCopiaEstado('{"version":1,"paquetes":{"android":"instalado","x; rm":"instalado","com.a.b":"quitado"}}');
  assert.deepEqual(Object.keys(conSistema.paquetes), ["com.a.b"]);
  assert.throws(() => leerCopiaEstado('{"version":1,"paquetes":{"com.a.b":"borrado"}}'));
});

import { paquetesConIcono, ajustarNivel, AVISO_PODA } from "../dist/index.js";

test("apps con icono: formato breve y largo", () => {
  const breve = "3 activities found:\r\n  Activity #0:\r\n    com.android.chrome/com.google.android.apps.chrome.Main\r\n  Activity #1:\r\n    org.lineageos.jelly/.MainActivity\r\n";
  assert.deepEqual([...paquetesConIcono(breve)], ["com.android.chrome", "org.lineageos.jelly"]);
  assert.ok(paquetesConIcono("    ActivityInfo:\n      packageName=com.miui.notes").has("com.miui.notes"));
  assert.equal(paquetesConIcono("Error: unknown command").size, 0);
});

test("protecciones de Poda sobre UAD-ng", () => {
  // Lo que se quitó en el Redmi Note 4 que dejó de arrancar
  for (const p of ["org.codeaurora.ims", "com.android.carrierconfig", "com.google.android.setupwizard", "com.android.providers.settings.auto_generated_rro_vendor__", "com.android.companiondevicemanager", "com.google.android.partnersetup", "com.android.onetimeinitializer"]) {
    assert.equal(ajustarNivel(p, "seguro"), "bloqueado", p);
  }
  assert.equal(ajustarNivel("com.miui.home", "experto"), "bloqueado");
  assert.equal(ajustarNivel("com.android.theme.color.ocean", "seguro"), "bloqueado");
  assert.equal(ajustarNivel("com.android.providers.media.module", "experto"), "bloqueado");
  assert.equal(ajustarNivel("com.android.providers.downloads.ui", "avanzado"), "experto"); // con aviso, pero no bloqueado
  assert.equal(ajustarNivel("com.android.inputmethod.latin", "avanzado"), "experto");
  assert.equal(ajustarNivel("com.android.deskclock", "seguro"), "experto");
  assert.equal(ajustarNivel("com.miui.msa.global", "seguro"), "seguro");
  assert.ok(Object.values(AVISO_PODA).every((t) => t.length > 10));
});

test("lista compacta aplica las protecciones", () => {
  const uad = { "org.codeaurora.ims": { list: "Misc", description: "", dependencies: [], neededBy: [], labels: [], removal: "Advanced" } };
  assert.equal(compactar(uad).p["org.codeaurora.ims"][0], 3);
});

import { comandoVerificarBloqueo, entreComillas, esCredencialValida, leerRespuestaBloqueo } from "../dist/index.js";

test("PIN: va entre comillas y no se puede inyectar", () => {
  assert.deepEqual(comandoVerificarBloqueo("1234"), ["cmd", "lock_settings", "verify", "--old", "'1234'"]);
  assert.equal(entreComillas("a'; reboot; '"), `'a'\\''; reboot; '\\'''`);
  assert.throws(() => comandoVerificarBloqueo(""));
  assert.throws(() => comandoVerificarBloqueo("12\n34"));
  assert.ok(!esCredencialValida("x".repeat(65)));
  assert.equal(leerRespuestaBloqueo("Lock credential verified successfully"), "correcto");
  assert.equal(leerRespuestaBloqueo("Old password '1111' didn't match"), "incorrecto");
  assert.equal(leerRespuestaBloqueo("Old password provided but user has no password"), "sin-bloqueo");
  assert.equal(leerRespuestaBloqueo("Request throttled"), "esperar");
  assert.equal(leerRespuestaBloqueo("Can't find service: lock_settings"), "no-disponible");
});
import { IDIOMAS, TEXTOS_NUCLEO, PROTEGIDOS as GRUPOS } from "../dist/index.js";

test("idiomas: cada traducción del núcleo tiene todos los textos", () => {
  const base = TEXTOS_NUCLEO.es;
  for (const idioma of IDIOMAS) {
    const t = TEXTOS_NUCLEO[idioma];
    const donde = (x) => `${idioma}: ${x}`;
    for (const k of Object.keys(base.nivel)) assert.ok(t.nivel?.[k]?.trim(), donde(`nivel.${k}`));
    for (const k of Object.keys(base.origen)) assert.ok(t.origen?.[k]?.trim(), donde(`origen.${k}`));
    for (const k of Object.keys(base.avisoPoda)) assert.ok(t.avisoPoda?.[k]?.trim(), donde(`avisoPoda.${k}`));
    assert.deepEqual(Object.keys(t.avisoPoda).sort(), Object.keys(base.avisoPoda).sort(), donde("avisoPoda sobra o falta"));
    for (const k of Object.keys(base.aviso)) assert.ok(t.aviso?.[k]?.trim(), donde(`aviso.${k}`));
    assert.ok(t.aviso.rom.includes("{rom}"), donde("aviso.rom sin {rom}"));
    assert.ok(t.capaPixel?.trim(), donde("capaPixel"));
    assert.equal(t.protegidos?.length, GRUPOS.length, donde("protegidos"));
    GRUPOS.forEach((g, i) => {
      assert.ok(t.protegidos[i].titulo?.trim() && t.protegidos[i].motivo?.trim(), donde(`protegidos[${i}]`));
      assert.equal(t.protegidos[i].familias?.length ?? 0, g.familias?.length ?? 0, donde(`protegidos[${i}].familias`));
    });
  }
});
