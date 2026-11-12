// Conexión con el móvil por WebUSB (Tango / ya-webadb) y un modo demo para probar la interfaz sin móvil.
import { Adb, AdbDaemonTransport } from "@yume-chan/adb";
import { AdbDaemonWebUsbDevice, AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

/** Lo mínimo que necesita la web del móvil. Así el modo demo puede imitarlo. */
export interface Movil {
  nombreUsb: string; // lo que anuncia el USB antes de autorizar
  serie: string; // número de serie USB: identifica las copias de seguridad de este móvil
  getprop(): Promise<string>;
  shell(args: string[]): Promise<string>;
  cerrar(): Promise<void>;
  /** Reinicia el móvil (como `adb reboot`). La conexión se corta y vuelve cuando el móvil arranca. */
  reiniciar(): Promise<void>;
  desconectado: Promise<void>;
}

/** Espera a que Android termine de arrancar (después de un reinicio, adb responde antes que el sistema). */
export async function esperarArranque(movil: Movil, maxMs = 240_000): Promise<boolean> {
  const fin = Date.now() + maxMs;
  while (Date.now() < fin) {
    try {
      if ((await movil.shell(["getprop", "sys.boot_completed"])).trim() === "1") return true;
    } catch {
      /* aún no responde */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

export const gestor = AdbDaemonWebUsbDeviceManager.BROWSER;

export function webUsbDisponible(): boolean {
  return !!gestor;
}

let credenciales: AdbWebCredentialStore | null = null; // se crea al conectar: en el servidor no hay IndexedDB

export class ErrorConexion extends Error {
  constructor(
    public tipo: "ocupado" | "cancelado" | "sin-adb" | "otro",
    mensaje: string,
  ) {
    super(mensaje);
  }
}

/** Pide al navegador que elija un móvil (necesita un clic del usuario). */
export async function elegirDispositivo(): Promise<AdbDaemonWebUsbDevice> {
  if (!gestor) throw new ErrorConexion("otro", "Este navegador no tiene WebUSB.");
  const d = await gestor.requestDevice();
  if (!d) throw new ErrorConexion("cancelado", "No se eligió ningún móvil.");
  return d;
}

/** Móviles a los que ya diste permiso antes: se conectan sin volver a preguntar. */
export async function dispositivosConPermiso(): Promise<AdbDaemonWebUsbDevice[]> {
  return gestor ? gestor.getDevices() : [];
}

/**
 * Abre la conexión y espera a que el usuario acepte el aviso «¿Permitir depuración USB?» en el móvil.
 * `alEsperarAutorizacion` se llama en cuanto la conexión USB está abierta y falta ese aviso.
 */
export async function conectar(dispositivo: AdbDaemonWebUsbDevice, alEsperarAutorizacion: () => void): Promise<Movil> {
  let conexion;
  try {
    conexion = await dispositivo.connect();
  } catch (e) {
    if (e instanceof AdbDaemonWebUsbDevice.DeviceBusyError) {
      throw new ErrorConexion(
        "ocupado",
        "Otro programa está usando el móvil (normalmente adb, Android Studio o una herramienta del fabricante). Ciérralo y vuelve a intentarlo. En Windows puedes ejecutar «adb kill-server».",
      );
    }
    throw new ErrorConexion("otro", e instanceof Error ? e.message : String(e));
  }
  alEsperarAutorizacion();
  const transporte = await AdbDaemonTransport.authenticate({
    serial: dispositivo.serial,
    connection: conexion,
    credentialStore: (credenciales ??= new AdbWebCredentialStore("Poda")),
  });
  const adb = new Adb(transporte);
  return {
    nombreUsb: dispositivo.name,
    serie: dispositivo.serial,
    getprop: () => adb.subprocess.noneProtocol.spawnWaitText(["getprop"]),
    shell: (args) => adb.subprocess.noneProtocol.spawnWaitText(args),
    cerrar: () => adb.close(),
    reiniciar: async () => {
      try {
        await adb.power.reboot();
      } catch {
        /* la conexión se corta al reiniciar: es lo esperado */
      }
    },
    desconectado: adb.disconnected,
  };
}

// ------------------------------------------------------------------ modo demo
const DEMO_PROPS = `[ro.product.manufacturer]: [Xiaomi]
[ro.product.brand]: [Redmi]
[ro.product.model]: [M1906G7G]
[ro.product.marketname]: [Redmi Note 8 Pro]
[ro.build.version.release]: [11]
[ro.build.version.sdk]: [30]
[ro.build.version.security_patch]: [2022-05-01]
[ro.build.version.incremental]: [V12.5.4.0.RGGEUXM]
[ro.miui.ui.version.name]: [V125]`;

const DEMO_PAQUETES = [
  "com.miui.msa.global", "com.miui.analytics", "com.miui.daemon", "com.miui.cleanmaster", "com.miui.videoplayer",
  "com.miui.player", "com.miui.weather2", "com.miui.yellowpage", "com.mi.globalbrowser", "com.xiaomi.mipicks",
  "com.xiaomi.glgm", "com.facebook.appmanager", "com.facebook.services", "com.facebook.system", "com.facebook.katana",
  "com.netflix.partner.activation", "com.google.android.apps.youtube.music", "com.google.android.videos",
  "com.miui.bugreport", "com.miui.hybrid", "com.miui.miservice", "com.xiaomi.joyose", "com.miui.notes",
  "com.android.chrome", "com.android.settings", "com.android.systemui", "com.miui.home", "com.android.phone",
];

/** Móvil de ejemplo: responde como uno de verdad y recuerda lo que se quita, se desactiva o se restaura. */
export function movilDemo(): Movil {
  const presentes = new Set(DEMO_PAQUETES);
  const desactivados = new Set<string>();
  const todos = new Set([...DEMO_PAQUETES, "com.miui.compass"]);
  const NO_SE_DEJA = "com.miui.daemon"; // como en algunos Xiaomi: no se deja quitar, pero sí desactivar
  const lista = (s: Set<string>) => [...s].map((p) => "package:" + p).join("\n");
  return {
    nombreUsb: "Redmi Note 8 Pro",
    serie: "demo",
    getprop: async () => DEMO_PROPS,
    shell: async (args) => {
      await new Promise((r) => setTimeout(r, 120 + Math.random() * 180));
      const p = args.at(-1) ?? "";
      const c = args.slice(0, -1).join(" ");
      if (args[0] === "getprop" && args[1] === "sys.boot_completed") return "1";
      if (args[2] === "query-activities") {
        const conIcono = ["com.android.chrome", "com.facebook.katana", "com.mi.globalbrowser", "com.miui.notes", "com.miui.player", "com.miui.videoplayer", "com.miui.weather2", "com.netflix.partner.activation", "com.google.android.apps.youtube.music", "com.android.settings"];
        return `${conIcono.length} activities found:\n` + conIcono.filter((p) => presentes.has(p)).map((p, i) => `  Activity #${i}:\n    ${p}/.Main`).join("\n");
      }
      if (args[0] === "cmd" && args[1] === "lock_settings" && args[2] === "verify") {
        return p === "'1234'" ? "Lock credential verified successfully" : `Old password ${p} didn't match`; // PIN del demo: 1234
      }
      if (args[0] === "pm" && args[1] === "list") {
        if (args.includes("-u")) return lista(todos);
        if (args.includes("-d")) return lista(desactivados);
        return lista(presentes);
      }
      if (c === "pm uninstall -k --user 0") {
        if (p === NO_SE_DEJA || !presentes.has(p)) return "Failure [DELETE_FAILED_INTERNAL_ERROR]";
        presentes.delete(p);
        desactivados.delete(p);
        return "Success";
      }
      if (c === "pm disable-user --user 0") {
        if (!presentes.has(p)) return "Error: Unknown package: " + p;
        desactivados.add(p);
        return `Package ${p} new state: disabled-user`;
      }
      if (c === "cmd package install-existing --user 0" || c === "pm install-existing --user 0") {
        if (!todos.has(p)) return "Error: Unknown package: " + p;
        presentes.add(p);
        return `Package ${p} installed for user: 0`;
      }
      if (c === "pm enable --user 0") {
        desactivados.delete(p);
        return `Package ${p} new state: enabled`;
      }
      return "";
    },
    cerrar: async () => {},
    reiniciar: async () => {},
    desconectado: new Promise(() => {}),
  };
}
