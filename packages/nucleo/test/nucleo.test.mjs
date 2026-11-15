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

// Especificación 002: singular y plural.
import { formatear } from "../dist/index.js";

test("002 R-002 CA-1: {n|uno|varios} elige la forma por la cantidad", () => {
  assert.equal(formatear("{n} {n|app|apps}", { n: 1 }, "es"), "1 app");
  assert.equal(formatear("{n} {n|app|apps}", { n: 3 }, "es"), "3 apps");
});

test("002 R-002 CA-2: {clave} sin formas se sustituye como siempre", () => {
  assert.equal(formatear("{nombre}: {n}", { nombre: "Pixel 8", n: 2 }, "es"), "Pixel 8: 2");
});

test("002 R-002 CA-3: una clave que no viene en los datos queda tal cual", () => {
  assert.equal(formatear("{x} {x|uno|varios} {y}", { n: 1 }, "es"), "{x} {x|uno|varios} {y}");
});

test("002 R-001: cada idioma decide su singular (fr y pt-BR: el 0 también)", () => {
  const f = (idioma, n) => formatear("{n|uno|varios}", { n }, idioma);
  for (const idioma of ["es", "en", "ca"]) assert.deepEqual([f(idioma, 0), f(idioma, 1), f(idioma, 2)], ["varios", "uno", "varios"], idioma);
  for (const idioma of ["fr", "pt"]) assert.deepEqual([f(idioma, 0), f(idioma, 1), f(idioma, 2)], ["uno", "uno", "varios"], idioma);
});

test("002 R-002: las formas pueden llevar espacios, marcas y estar vacías", () => {
  assert.equal(formatear("{n|app ya quitada|apps ya quitadas}", { n: 1 }, "es"), "app ya quitada");
  assert.equal(formatear("*{n} app{n||s}*", { n: 2 }, "es"), "*2 apps*");
});

test("002 R-002: una forma puede llevar la cifra dentro", () => {
  assert.equal(formatear("quitar {n|esta app|estas {n} apps}.", { n: 1 }, "es"), "quitar esta app.");
  assert.equal(formatear("quitar {n|esta app|estas {n} apps}.", { n: 4 }, "es"), "quitar estas 4 apps.");
});

// Especificación 004: llamadas, mensajes, contactos y ubicación protegidos en cualquier móvil.
import { estaProtegido as protegido, AVISO_PODA as AVISOS, nivelDe as nivel } from "../dist/index.js";

const COMUNICACIONES = [
  "com.android.dialer", "com.google.android.dialer", "com.android.incallui", "com.samsung.android.dialer",
  "com.samsung.android.app.telephonyui", "com.samsung.android.incall.contentprovider", "com.oneplus.dialer",
  "com.asus.dialer", "com.tct.dialer", "com.qti.phone", "com.google.android.telephony",
  "com.android.mms", "com.android.messaging", "com.google.android.apps.messaging", "com.samsung.android.messaging",
  "com.oneplus.mms", "com.zui.mms", "com.sonyericsson.android.conversations", "com.transsion.smartmessage",
  "com.miui.smsextra", "com.mediatek.mms.appservice", "com.android.basicsmsreceiver", "com.android.smspush",
  "com.huawei.omacp", "com.hihonor.omacp", "com.vivo.omacp", "com.zte.zdm.omacp",
  "com.android.contacts", "com.google.android.contacts", "com.google.android.syncadapters.contacts",
  "com.samsung.android.app.contacts", "com.samsung.android.contacts", "com.samsung.android.providers.contacts",
  "com.huawei.contacts", "com.hihonor.contacts", "com.oneplus.contacts", "com.asus.contacts",
  "com.sonymobile.android.contacts", "com.zui.contacts", "cn.nubia.contacts",
  "com.android.stk", "com.android.stk2", "com.android.emergency",
];
const UBICACION = [
  "com.android.location.fused", "com.google.android.gms", "com.google.android.location", "com.qualcomm.location",
  "com.qualcomm.location.XT", "com.mediatek.location.lppe.main", "com.mediatek.location.mtknlp",
  "com.mediatek.nlpservice", "com.huawei.lbs", "com.samsung.android.location", "com.sec.location.nsflp2",
  "com.xiaomi.bsp.gps.nps", "com.vivo.multinlp",
];
const RELOJES = [
  "com.sec.android.app.clockpackage", "com.huawei.deskclock", "com.hihonor.deskclock", "com.coloros.alarmclock",
  "com.oneplus.deskclock", "com.android.BBKClock", "com.lge.clock", "com.asus.deskclock", "com.transsion.deskclock",
  "com.zui.deskclock", "cn.nubia.deskclock.preset", "zte.com.cn.alarmclock",
];
const uad004 = JSON.parse(readFileSync(new URL("../../../data/uad_lists.json", import.meta.url), "utf8"));
const listaCompacta004 = compactar(uad004);

function fueraDeTodosLosPerfiles(paquetes) {
  const estados = new Map(paquetes.map((p) => [p, "instalado"]));
  const enAlguno = [];
  for (const perfil of ["seguro", "recomendado", "experto"]) {
    for (const x of planDePerfil(estados, listaCompacta004, perfil)) enAlguno.push(`${perfil}: ${x.paquete}`);
  }
  return enAlguno;
}

test("004 R-001 CA-1: llamadas, SMS/MMS, contactos, SIM y emergencia: protegidos y fuera de todos los perfiles", () => {
  assert.deepEqual(COMUNICACIONES.filter((p) => !protegido(p)), []);
  assert.deepEqual(fueraDeTodosLosPerfiles(COMUNICACIONES), []);
});

test("004 R-002 CA-1: ubicación y GPS: protegidos y fuera de todos los perfiles", () => {
  assert.deepEqual(UBICACION.filter((p) => !protegido(p)), []);
  assert.deepEqual(fueraDeTodosLosPerfiles(UBICACION), []);
});

test("004 R-003 CA-1: relojes de fabricante solo en experto y con aviso", () => {
  for (const p of RELOJES) {
    assert.ok(uad004[p], `${p} no está en la lista de UAD-ng`);
    assert.equal(nivel(uad004[p], p), "experto", p);
    assert.ok(AVISOS[p], `${p} sin aviso`);
  }
});

test("004: lo protegido no queda también en AVISO_PODA (la web lo listaría dos veces)", () => {
  assert.deepEqual(Object.keys(AVISOS).filter((p) => protegido(p)), []);
});

// Especificación 005: qué parte de cada origen quita cada perfil.
import { nivelesPorOrigen, enPerfil } from "../dist/index.js";

test("005 R-001 CA-1 y CA-2: niveles por origen, sin las quitadas, con las protegidas en el total", () => {
  const lista = {
    origenes: ["fabricante", "operadora", "Android base"],
    p: {
      "com.fab.a": [0, 0], "com.fab.b": [1, 0], "com.fab.c": [2, 0], "com.fab.d": [3, 0], "com.fab.quitada": [0, 0],
      "com.ope.a": [0, 1], "com.ope.b": [0, 1],
      "com.aosp.a": [3, 2],
    },
  };
  const estados = new Map([
    ["com.fab.a", "instalado"], ["com.fab.b", "desactivado"], ["com.fab.c", "instalado"], ["com.fab.d", "instalado"],
    ["com.fab.quitada", "quitado"], ["com.ope.a", "instalado"], ["com.ope.b", "instalado"], ["com.aosp.a", "instalado"],
    ["com.desconocida", "instalado"],
  ]);
  const r = Object.fromEntries(nivelesPorOrigen(estados, lista).map((o) => [o.origen, o]));
  assert.deepEqual(r.fabricante, { origen: "fabricante", total: 4, porNivel: { seguro: 1, avanzado: 1, experto: 1, bloqueado: 1 } });
  assert.deepEqual([enPerfil(r.fabricante, "seguro"), enPerfil(r.fabricante, "recomendado"), enPerfil(r.fabricante, "experto")], [1, 2, 3]);
  assert.equal(enPerfil(r["Android base"], "experto"), 0);

  // CA-3: la suma por origen es lo que muestra la lista del perfil.
  for (const perfil of ["seguro", "recomendado", "experto"]) {
    const suma = nivelesPorOrigen(estados, lista).reduce((n, o) => n + enPerfil(o, perfil), 0);
    assert.equal(suma, planDePerfil(estados, lista, perfil).length, perfil);
  }
});

// Especificación 006: al elegir perfil, solo vienen marcadas las seguras.
import { marcadaPorDefecto } from "../dist/index.js";

test("006 R-001: vienen marcadas las seguras y las avanzadas de fabricante, operadora y terceros", () => {
  const estados = new Map(Object.keys(uad004).map((p) => [p, "instalado"]));
  const rec = planDePerfil(estados, listaCompacta004, "recomendado");
  const esperada = (x) => x.nivel === "seguro" || (x.nivel === "avanzado" && ["fabricante", "operadora", "terceros"].includes(x.origen));
  for (const origen of ["fabricante", "Android base", "Google"]) assert.ok(rec.some((x) => x.nivel === "avanzado" && x.origen === origen), origen);
  assert.deepEqual(rec.filter((x) => marcadaPorDefecto(x) !== esperada(x)).map((x) => x.paquete), []);
  assert.equal(marcadaPorDefecto({ nivel: "avanzado", origen: "Android base" }), false);
  assert.equal(marcadaPorDefecto({ nivel: "avanzado", origen: "Google" }), false);
  assert.equal(marcadaPorDefecto({ nivel: "seguro", origen: "Google" }), true);
  // CA-2: experto marca lo mismo que recomendado
  const exp = planDePerfil(estados, listaCompacta004, "experto");
  assert.deepEqual(exp.filter(marcadaPorDefecto).map((x) => x.paquete), rec.filter(marcadaPorDefecto).map((x) => x.paquete));
});

// ------------------------------------------------------------------ 008: comprobar tras reiniciar
import { comprobarTrasReinicio, todoEnOrden, paqueteDeSalida, COMANDOS_COMPROBAR } from "../dist/index.js";

const m008 = (o) => new Map(Object.entries(o));
const base008 = {
  arranco: true,
  inicio: "priority=0 preferredOrder=0 match=0x108000 specificIndex=-1 isDefault=true\ncom.miui.home/.launcher.Launcher",
  teclado: "com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME",
};
const ahora008 = { "com.miui.home": "instalado", "com.google.android.inputmethod.latin": "instalado", "com.android.phone": "instalado", "com.miui.weather2": "quitado", "com.miui.player": "desactivado" };

test("008 R-002: pantalla de inicio, teclado y protegidas", () => {
  const c = comprobarTrasReinicio({ ...base008, esperado: {}, antes: m008(ahora008), ahora: m008(ahora008) });
  assert.equal(c.inicio, true);
  assert.equal(c.teclado, true);
  assert.deepEqual(c.protegidasAfectadas, []);
  assert.equal(todoEnOrden(c), true);
  // CA-3: una protegida instalada antes que ya no lo está
  const c2 = comprobarTrasReinicio({ ...base008, esperado: {}, antes: m008(ahora008), ahora: m008({ ...ahora008, "com.android.phone": "desactivado" }) });
  assert.deepEqual(c2.protegidasAfectadas, ["com.android.phone"]);
  assert.equal(todoEnOrden(c2), false);
  // Sin teclado o sin pantalla de inicio
  const c3 = comprobarTrasReinicio({ ...base008, teclado: "null", inicio: "No activity found", esperado: {}, antes: m008(ahora008), ahora: m008(ahora008) });
  assert.equal(c3.teclado, false);
  assert.equal(c3.inicio, false);
  // CA-4: si el móvil no lo admite, no se sabe: null, nunca true
  const c4 = comprobarTrasReinicio({ ...base008, teclado: "", inicio: "Unknown command: resolve-activity", esperado: {}, antes: m008(ahora008), ahora: m008(ahora008) });
  assert.equal(c4.teclado, null);
  assert.equal(c4.inicio, null);
  assert.equal(todoEnOrden(c4), true);
  // R-001: si no arrancó, no está en orden
  assert.equal(todoEnOrden(comprobarTrasReinicio({ ...base008, arranco: false, esperado: {}, antes: m008(ahora008), ahora: m008(ahora008) })), false);
  assert.equal(paqueteDeSalida("android/com.android.internal.app.ResolverActivity"), "android");
});

test("008 R-003: las apps siguen como se dejaron", () => {
  const esperado = { "com.miui.weather2": "quitado", "com.miui.player": "desactivado", "com.facebook.appmanager": "quitado", "com.miui.notes": "quitado" };
  const ahora = m008({ ...ahora008, "com.facebook.appmanager": "instalado" }); // notes: ni aparece (también quitada)
  const c = comprobarTrasReinicio({ ...base008, esperado, antes: m008(ahora008), ahora });
  assert.deepEqual(c.siguen.sort(), ["com.miui.notes", "com.miui.player", "com.miui.weather2"]);
  assert.deepEqual(c.cambiaron, [{ paquete: "com.facebook.appmanager", esperado: "quitado", ahora: "instalado" }]);
  assert.equal(todoEnOrden(c), false);
  // CA-1: desactivada que aparece quitada también vale
  assert.deepEqual(comprobarTrasReinicio({ ...base008, esperado: { "com.miui.weather2": "desactivado" }, antes: m008(ahora008), ahora: m008(ahora008) }).cambiaron, []);
  // CA-2: tras restaurar, las reinstaladas siguen en el móvil (desactivadas si así estaban en la copia)
  const r = comprobarTrasReinicio({ ...base008, esperado: { "com.miui.home": "instalado", "com.miui.player": "instalado", "com.miui.weather2": "instalado" }, antes: m008(ahora008), ahora: m008(ahora008) });
  assert.deepEqual(r.siguen, ["com.miui.home", "com.miui.player"]);
  assert.deepEqual(r.cambiaron, [{ paquete: "com.miui.weather2", esperado: "instalado", ahora: "quitado" }]);
});

test("008 R-005: las comprobaciones solo leen", () => {
  for (const c of Object.values(COMANDOS_COMPROBAR)) {
    assert.ok(["cmd", "settings"].includes(c[0]));
    assert.ok(c.includes("resolve-activity") || c.includes("get"), c.join(" "));
  }
});

// ------------------------------------------------------------------ 009: comparar con la copia
import { compararConCopia } from "../dist/index.js";

test("009 R-001: antes y después frente a la copia, leído del móvil", () => {
  const copia = { version: 1, creada: "2026-11-15T10:00:00.000Z", serie: "x", dispositivo: {}, paquetes: { "a.b.uno": "instalado", "a.b.dos": "instalado", "a.b.tres": "desactivado", "a.b.cuatro": "quitado", "a.b.cinco": "instalado" } };
  const ahora = new Map([["a.b.uno", "quitado"], ["a.b.dos", "desactivado"], ["a.b.tres", "desactivado"], ["a.b.cinco", "instalado"], ["a.b.nueva", "instalado"]]); // cuatro ni aparece
  const c = compararConCopia(copia, ahora);
  assert.equal(c.creada, copia.creada);
  assert.deepEqual(c.antes, { instalado: 3, desactivado: 1, quitado: 1 });
  assert.deepEqual(c.ahora, { instalado: 1, desactivado: 2, quitado: 2 }); // solo las de la copia
  assert.deepEqual(c.cambios, [
    { paquete: "a.b.dos", antes: "instalado", ahora: "desactivado" },
    { paquete: "a.b.uno", antes: "instalado", ahora: "quitado" },
  ]);
  // R-003: tras restaurar, sin diferencias
  assert.deepEqual(compararConCopia(copia, new Map(Object.entries(copia.paquetes))).cambios, []);
});

// Especificación 010: fondo de recuerdo.
import { FONDO, COMANDO_CARPETA_FONDO, COMANDO_AVISAR_GALERIA, MARCAS_FONDO, marcaFondo } from "../dist/index.js";

test("010 R-002: la ruta del fondo es fija, dentro de Pictures/Poda, y los comandos no llevan nada variable", () => {
  assert.equal(FONDO.ruta, "/sdcard/Pictures/Poda/poda-fondo.png");
  assert.equal(FONDO.ruta, `${FONDO.carpeta}/${FONDO.archivo}`);
  assert.deepEqual([FONDO.ancho, FONDO.alto], [1440, 3200]);
  for (const arg of [...COMANDO_CARPETA_FONDO, ...COMANDO_AVISAR_GALERIA]) assert.match(arg, /^[A-Za-z0-9_./:-]+$/, arg);
});

test("010 R-003: pasos propios para Xiaomi, Samsung y OPPO, y generales para el resto", () => {
  assert.equal(marcaFondo("xiaomi"), "xiaomi");
  assert.equal(marcaFondo("samsung"), "samsung");
  assert.equal(marcaFondo("oplus"), "oppo");
  assert.equal(marcaFondo("motorola"), "general");
  assert.equal(marcaFondo("otra"), "general");
});

test("010 R-007: los textos del fondo están en todos los idiomas", () => {
  for (const idioma of IDIOMAS) {
    const f = TEXTOS_NUCLEO[idioma].fondo;
    for (const m of MARCAS_FONDO) {
      assert.equal(f?.pasos?.[m]?.length, TEXTOS_NUCLEO.es.fondo.pasos[m].length, `${idioma}: fondo.pasos.${m}`);
      assert.ok(f.pasos[m].every((x) => x.trim()), `${idioma}: fondo.pasos.${m} vacío`);
    }
    assert.ok(f.noAparece?.trim() && f.borrar?.trim(), `${idioma}: fondo.noAparece / fondo.borrar`);
  }
});
