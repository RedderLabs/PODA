#!/usr/bin/env node
// adb simulado para las pruebas: un Xiaomi ficticio con estado en un JSON.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const F = process.env.ADB_FALSO_ESTADO;
const inicial = {
  "com.miui.msa.global": "instalado",
  "com.miui.analytics": "instalado",
  "com.miui.misightservice": "instalado",
  "com.xiaomi.aiservice": "instalado",
  "com.xiaomi.cameramind": "instalado",
  "com.xiaomi.phone": "instalado",
  "com.xiaomi.micloud.sdk": "instalado",
  "com.facebook.appmanager": "instalado",
  "com.ejemplo.desconocido": "instalado",
  "com.miui.cleanmaster": "quitado",
  "com.miui.videoplayer": "desactivado"
};
const est = existsSync(F) ? JSON.parse(readFileSync(F, "utf8")) : inicial;
const guardar = () => writeFileSync(F, JSON.stringify(est));
const a = process.argv.slice(2);
const out = (s) => { process.stdout.write(s.replace(/\n/g, "\r\n") + "\r\n"); guardar(); process.exit(0); };
if (a[0] === "devices") out("List of devices attached\nABC123 device usb:1-1 product:garnet model:Redmi_Note_13_Pro_5G device:garnet transport_id:1");
if (a[0] === "pair") out(`Successfully paired to ${a[1]} [guid=adb-ABC123]`);
if (a[0] === "connect") out(`connected to ${a[1]}`);
if (a[0] !== "-s" || a[2] !== "shell") { process.stderr.write("uso no soportado\n"); process.exit(1); }
const c = a.slice(3).join(" ");
if (c === "getprop") out("[ro.product.manufacturer]: [Xiaomi]\n[ro.product.brand]: [Redmi]\n[ro.product.model]: [23117RA68G]\n[ro.build.version.release]: [14]\n[ro.build.version.sdk]: [34]\n[ro.mi.os.version.name]: [OS1.0]");
let m;
if ((m = c.match(/^pm list packages( -u| -d)? --user 0$/))) {
  const f = m[1]?.trim();
  out(Object.entries(est).filter(([, e]) => f === "-u" ? true : f === "-d" ? e === "desactivado" : e !== "quitado").map(([p]) => "package:" + p).join("\n"));
}
if ((m = c.match(/^pm uninstall -k --user 0 (\S+)$/))) {
  if (m[1] === "com.xiaomi.phone") out("Failure [DELETE_FAILED_INTERNAL_ERROR]");
  if (!est[m[1]] || est[m[1]] === "quitado") out("Failure [not installed for 0]");
  est[m[1]] = "quitado"; out("Success");
}
if ((m = c.match(/^pm disable-user --user 0 (\S+)$/))) { est[m[1]] = "desactivado"; out(`Package ${m[1]} new state: disabled-user`); }
if ((m = c.match(/^cmd package install-existing --user 0 (\S+)$/))) { est[m[1]] = "instalado"; out(`Package ${m[1]} installed for user: 0`); }
if ((m = c.match(/^pm enable --user 0 (\S+)$/))) { if (est[m[1]] === "desactivado") est[m[1]] = "instalado"; out(`Package ${m[1]} new state: enabled`); }
process.stderr.write("comando no simulado: " + c + "\n"); process.exit(1);
