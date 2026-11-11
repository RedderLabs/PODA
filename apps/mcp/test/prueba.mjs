// Prueba de extremo a extremo: arranca el servidor MCP con un adb simulado y recorre el flujo completo.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const aqui = dirname(fileURLToPath(import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), "poda-"));
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [join(aqui, "..", "dist", "index.js")],
  env: { ...process.env, PODA_ADB: join(aqui, "adb-falso.mjs"), PODA_DIR: join(tmp, "poda"), ADB_FALSO_ESTADO: join(tmp, "estado.json") },
});
const c = new Client({ name: "prueba", version: "0" });
await c.connect(transport);
const llamar = async (name, args = {}) => {
  const r = await c.callTool({ name, arguments: args });
  const t = r.content[0].text;
  return { error: !!r.isError, t, j: t.startsWith("{") || t.startsWith("[") ? JSON.parse(t) : null };
};
let ok = 0;
const paso = (n) => { ok++; console.log("✓", n); };

const herramientas = (await c.listTools()).tools.map((t) => t.name).sort();
assert.deepEqual(herramientas, ["analizar", "aplicar", "conectar_wifi", "crear_copia", "dispositivos", "emparejar_wifi", "explicar_paquete", "info_dispositivo", "listar_copias", "restaurar"]);
paso("10 herramientas registradas");
assert.equal((await c.listPrompts()).prompts[0].name, "limpiar_movil"); paso("prompt limpiar_movil");

let r = await llamar("dispositivos"); assert.equal(r.j[0].serie, "ABC123"); paso("dispositivos");
r = await llamar("info_dispositivo"); assert.match(r.j.avisos.join(" "), /Xiaomi/); paso("info_dispositivo con aviso Xiaomi");
r = await llamar("emparejar_wifi", { direccion: "192.168.1.40:37099", codigo: "123456" }); assert.match(r.t, /paired/); paso("emparejar_wifi");
r = await llamar("emparejar_wifi", { direccion: "192.168.1.40:37099; rm -rf /", codigo: "123456" }); assert.ok(r.error); paso("emparejar_wifi rechaza dirección rara");

r = await llamar("analizar", { perfil: "seguro" });
const segs = r.j.propuesta.map((x) => x.paquete);
assert.ok(segs.includes("com.miui.msa.global") && !segs.includes("com.xiaomi.aiservice") && !segs.includes("com.xiaomi.micloud.sdk"));
assert.equal(r.j.resumen.fuera_de_la_lista, 1); assert.equal(r.j.resumen.ya_quitados_antes, 1);
paso(`analizar perfil seguro (${segs.length} propuestos)`);
r = await llamar("analizar", { perfil: "recomendado" });
const recs = r.j.propuesta.map((x) => x.paquete);
assert.ok(recs.includes("com.xiaomi.aiservice") && !recs.includes("com.xiaomi.micloud.sdk"));
assert.ok(r.j.propuesta.find((x) => x.paquete === "com.xiaomi.cameramind").aviso);
paso(`analizar perfil recomendado (${recs.length} propuestos, con avisos de dependencias)`);

r = await llamar("explicar_paquete", { paquete: "com.miui.msa.global" }); assert.equal(r.j.nivel, "seguro"); paso("explicar_paquete");

const lote = ["com.miui.msa.global", "com.miui.analytics", "com.xiaomi.phone", "com.xiaomi.micloud.sdk", "com.ejemplo.desconocido", "com.miui.cleanmaster", "com.x; reboot"];
r = await llamar("aplicar", { paquetes: lote });
assert.equal(r.j.modo, "simulacion");
assert.deepEqual(r.j.se_aplicaria_a.map((x) => x.paquete).sort(), ["com.miui.analytics", "com.miui.msa.global", "com.xiaomi.phone"]);
assert.equal(r.j.rechazados.length, 4);
paso("aplicar en simulación: rechaza bloqueado, desconocido, ya quitado e inyección");

r = await llamar("aplicar", { paquetes: lote, confirmar: true }); assert.ok(r.error && /copia/.test(r.t)); paso("aplicar sin copia se niega");
r = await llamar("crear_copia"); assert.ok(r.j.ruta); const archivo = r.j.ruta.split("/").pop(); paso("crear_copia");
r = await llamar("aplicar", { paquetes: lote, confirmar: true });
assert.equal(r.j.hechos.length, 3);
assert.match(r.j.hechos.find((x) => x.paquete === "com.xiaomi.phone").resultado, /desactivado/);
paso("aplicar confirmado (y desactiva si no se puede quitar)");

r = await llamar("analizar", { perfil: "seguro" }); assert.ok(!r.j.propuesta.some((x) => x.paquete === "com.miui.msa.global")); paso("el análisis refleja los cambios");

r = await llamar("restaurar", { paquetes: ["com.miui.msa.global"] }); assert.equal(r.j.hechos[0].accion, "reinstalado"); paso("restaurar un paquete");
r = await llamar("restaurar", { copia: archivo });
assert.deepEqual(r.j.hechos.map((x) => x.paquete).sort(), ["com.miui.analytics", "com.xiaomi.phone"]);
paso("restaurar desde la copia deja el móvil como estaba");
r = await llamar("listar_copias"); assert.equal(r.j.length, 1); paso("listar_copias");

await c.close();
rmSync(tmp, { recursive: true, force: true });
console.log(`\n${ok} comprobaciones superadas`);

// --- CLI: mismo flujo, a mano
import { execFileSync } from "node:child_process";
const tmp2 = mkdtempSync(join(tmpdir(), "poda-cli-"));
const env = { ...process.env, PODA_ADB: join(aqui, "adb-falso.mjs"), PODA_DIR: join(tmp2, "poda"), ADB_FALSO_ESTADO: join(tmp2, "estado.json") };
const cli = (...a) => execFileSync(process.execPath, [join(aqui, "..", "dist", "cli.js"), ...a], { env, encoding: "utf8" });
assert.match(cli("ayuda"), /poda analizar/);
assert.equal(JSON.parse(cli("analizar", "--perfil", "seguro")).perfil, "seguro");
assert.equal(JSON.parse(cli("aplicar", "com.miui.msa.global")).modo, "simulacion");
assert.throws(() => cli("aplicar", "com.miui.msa.global", "--confirmar"));
cli("copia");
assert.equal(JSON.parse(cli("aplicar", "com.miui.msa.global", "--confirmar")).hechos[0].resultado, "quitado");
assert.equal(JSON.parse(cli("restaurar", "com.miui.msa.global")).hechos[0].accion, "reinstalado");
rmSync(tmp2, { recursive: true, force: true });
console.log("✓ CLI: ayuda, analizar, simulación, exige copia, aplicar y restaurar");
