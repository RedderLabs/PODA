// Envoltorio mínimo sobre el binario `adb`. Todo pasa por aquí para poder validar
// argumentos: `adb shell` concatena los argumentos en una sola línea que ejecuta
// el móvil, así que un nombre de paquete sin validar sería una inyección de comandos.
import { execFile } from "node:child_process";

const ADB = process.env.PODA_ADB || "adb";

const RE_SERIE = /^[A-Za-z0-9._:\-\[\]]+$/;
const RE_DIRECCION = /^[A-Za-z0-9.\-\[\]:]+:\d{1,5}$/;

import { esPaqueteValido, parsearGetprop } from "@poda/nucleo";
export { esPaqueteValido };

function ejecutar(args: string[], timeoutMs = 60_000): Promise<{ salida: string; error: string; codigo: number }> {
  return new Promise((resolve) => {
    execFile(ADB, args, { timeout: timeoutMs, maxBuffer: 32 * 1024 * 1024 }, (err, stdout, stderr) => {
      const codigo = err ? (typeof (err as NodeJS.ErrnoException).code === "number" ? Number((err as NodeJS.ErrnoException).code) : 1) : 0;
      if (err && (err as NodeJS.ErrnoException).code === "ENOENT") {
        resolve({ salida: "", error: `No encuentro adb ("${ADB}"). Instala Android Platform Tools o indica la ruta en PODA_ADB.`, codigo: 127 });
        return;
      }
      resolve({ salida: String(stdout), error: String(stderr) || (err ? err.message : ""), codigo });
    });
  });
}

export interface Dispositivo {
  serie: string;
  estado: string; // device | unauthorized | offline | ...
  modelo?: string;
  conexion: "usb" | "wifi";
}

export async function dispositivos(): Promise<Dispositivo[]> {
  const r = await ejecutar(["devices", "-l"]);
  if (r.codigo === 127) throw new Error(r.error);
  return r.salida
    .split("\n")
    .slice(1)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [serie, estado, ...resto] = l.split(/\s+/);
      const modelo = resto.find((x) => x.startsWith("model:"))?.slice(6);
      const conexion: "usb" | "wifi" = /:\d+$/.test(serie) || serie.includes("._adb-tls-connect") ? "wifi" : "usb";
      return { serie, estado, modelo, conexion };
    });
}

/** Devuelve la serie indicada o, si no se indica, la del único móvil conectado. */
export async function resolverSerie(serie?: string): Promise<string> {
  if (serie) {
    if (!RE_SERIE.test(serie)) throw new Error(`Serie no válida: ${serie}`);
    return serie;
  }
  const listos = (await dispositivos()).filter((d) => d.estado === "device");
  if (listos.length === 0) {
    throw new Error("No hay ningún móvil listo. Conéctalo y acepta el aviso de depuración en la pantalla del móvil, o usa emparejar_wifi.");
  }
  if (listos.length > 1) {
    throw new Error(`Hay ${listos.length} móviles conectados (${listos.map((d) => d.serie).join(", ")}). Indica cuál con "serie".`);
  }
  return listos[0].serie;
}

async function shell(serie: string, args: string[]): Promise<{ salida: string; error: string; codigo: number }> {
  return ejecutar(["-s", serie, "shell", ...args]);
}

export async function emparejar(direccion: string, codigo: string) {
  if (!RE_DIRECCION.test(direccion)) throw new Error("La dirección debe ser IP:puerto, la que aparece al pulsar «Vincular dispositivo con código».");
  if (!/^\d{6}$/.test(codigo)) throw new Error("El código de emparejamiento son 6 cifras.");
  return ejecutar(["pair", direccion, codigo]);
}

export async function conectar(direccion: string) {
  if (!RE_DIRECCION.test(direccion)) throw new Error("La dirección debe ser IP:puerto, la que aparece arriba en «Depuración inalámbrica».");
  return ejecutar(["connect", direccion]);
}

export async function propiedades(serie: string): Promise<Record<string, string>> {
  const claves = [
    "ro.product.manufacturer",
    "ro.product.brand",
    "ro.product.model",
    "ro.product.device",
    "ro.build.version.release",
    "ro.build.version.sdk",
    "ro.build.display.id",
    "ro.miui.ui.version.name",
    "ro.mi.os.version.name",
    "ro.build.version.oneui",
    "ro.build.version.opporom",
    "ro.lineage.build.version",
    "ro.lineage.version",
    "ro.crdroid.build.version",
    "org.pixelexperience.version",
    "ro.e.version",
  ];
  const r = await shell(serie, ["getprop"]);
  // parsearGetprop tolera los \r\n que devuelve adb en Windows.
  const todas = parsearGetprop(r.salida);
  const out: Record<string, string> = {};
  for (const c of claves) if (todas[c]) out[c] = todas[c];
  return out;
}

export type EstadoPaquete = "instalado" | "desactivado" | "quitado";

/** Estado de cada paquete para el usuario 0: instalado, desactivado o quitado (sigue en sistema). */
export async function estadoPaquetes(serie: string): Promise<Map<string, EstadoPaquete>> {
  const leer = async (extra: string[]) => {
    const r = await shell(serie, ["pm", "list", "packages", ...extra, "--user", "0"]);
    if (r.codigo !== 0 && !r.salida) throw new Error(`No pude listar paquetes: ${r.error.trim()}`);
    return new Set(
      r.salida
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("package:"))
        .map((l) => l.slice(8)),
    );
  };
  const [todos, instalados, desactivados] = [await leer(["-u"]), await leer([]), await leer(["-d"])];
  const mapa = new Map<string, EstadoPaquete>();
  for (const p of todos) {
    mapa.set(p, desactivados.has(p) ? "desactivado" : instalados.has(p) ? "instalado" : "quitado");
  }
  return mapa;
}

function comprobarPaquete(p: string) {
  if (!esPaqueteValido(p)) throw new Error(`Nombre de paquete no válido: ${p}`);
}

export async function quitar(serie: string, p: string) {
  comprobarPaquete(p);
  return shell(serie, ["pm", "uninstall", "-k", "--user", "0", p]);
}

export async function desactivar(serie: string, p: string) {
  comprobarPaquete(p);
  return shell(serie, ["pm", "disable-user", "--user", "0", p]);
}

export async function reinstalar(serie: string, p: string) {
  comprobarPaquete(p);
  const r = await shell(serie, ["cmd", "package", "install-existing", "--user", "0", p]);
  if (/Success|installed for user/i.test(r.salida)) return r;
  // Android antiguo: sin `cmd package`.
  return shell(serie, ["pm", "install-existing", "--user", "0", p]);
}

export async function activar(serie: string, p: string) {
  comprobarPaquete(p);
  return shell(serie, ["pm", "enable", "--user", "0", p]);
}
