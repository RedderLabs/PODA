// Correcciones propias de Poda sobre la lista de UAD-ng.
//
// UAD-ng está pensada para gente que sabe lo que quita. Poda la usa gente que no, así que aquí se
// endurece: lo que interviene en el arranque, la configuración del sistema, la red móvil o la puesta
// en marcha del móvil no se toca nunca, y lo que el usuario usa a diario (teclado, llamadas, SMS,
// alarmas…) pasa a «experto» con un aviso en español.
//
// Origen: un Redmi Note 4 con LineageOS 18.1 dejó de arrancar tras aplicar el perfil «recomendado»
// de la primera versión (noviembre de 2026). Ante la duda, un paquete va aquí.
import type { Nivel } from "./niveles.js";

export interface GrupoProtegido {
  titulo: string;
  motivo: string;
  paquetes: readonly string[];
  /** Familias de paquetes (variantes por dispositivo o por operadora), en lenguaje normal. */
  familias?: readonly { patron: RegExp; texto: string }[];
}

/** Nunca se tocan, diga lo que diga UAD-ng. Agrupados para poder explicarlo en la web. */
export const PROTEGIDOS: readonly GrupoProtegido[] = [
  {
    titulo: "Arranque y ajustes del sistema",
    motivo: "Sin ellos el móvil puede quedarse en el logo o sin poder abrir los ajustes.",
    paquetes: [
      "com.android.providers.settings",
      "com.android.settings",
      "com.android.systemui",
      "com.android.permissioncontroller",
      "com.google.android.permissioncontroller",
      "com.android.packageinstaller",
      "com.google.android.packageinstaller",
      "com.android.webview",
      "com.google.android.webview",
      "com.android.companiondevicemanager",
      "com.android.bookmarkprovider",
      "com.android.bluetooth",
      "com.android.location.fused",
      "com.android.inputdevices",
      "com.android.ons",
      "com.android.proxyhandler",
      "com.android.pacprocessor",
      "com.android.vpndialogs",
      "com.android.backupconfirm",
      "com.android.simappdialog",
      "com.android.settings.intelligence",
      "com.android.statementservice",
      "com.qualcomm.timeservice",
      "com.qti.dpmserviceapp",
      "com.google.android.configupdater",
      "com.android.externalstorage",
      "com.android.documentsui",
      "com.google.android.documentsui",
      "com.android.shell",
      "com.android.keychain",
      "com.android.se",
      "lineageos.platform",
      "org.lineageos.lineagesettings",
      "org.lineageos.settings",
    ],
    familias: [
      { patron: /auto_generated_rro/, texto: "Capas de configuración del fabricante (…auto_generated_rro…)" },
      { patron: /^com\.android\.theme\./, texto: "Temas, iconos y colores del sistema (com.android.theme.*)" },
      { patron: /^org\.lineageos\.overlay\./, texto: "Temas de LineageOS (org.lineageos.overlay.*)" },
      { patron: /^com\.android\.internal\./, texto: "Ajustes internos de pantalla y navegación (com.android.internal.*)" },
      { patron: /^com\.android\.providers\.(?!downloads\.ui$)/, texto: "Proveedores de datos: contactos, fotos, calendario, ajustes… (com.android.providers.*)" },
    ],
  },
  {
    titulo: "Pantalla de inicio",
    motivo: "Sin ella el móvil arranca a una pantalla vacía.",
    paquetes: [
      "com.android.launcher3",
      "com.android.launcher",
      "com.miui.home",
      "com.mi.android.globallauncher",
      "com.sec.android.app.launcher",
      "com.huawei.android.launcher",
      "com.hihonor.android.launcher",
      "com.oppo.launcher",
      "net.oneplus.launcher",
      "com.google.android.apps.nexuslauncher",
      "com.motorola.launcher3",
      "com.bbk.launcher2",
      "com.transsion.hilauncher",
      "com.asus.launcher",
      "com.sonymobile.home",
      "com.lge.launcher3",
      "com.nothing.launcher",
    ],
  },
  {
    titulo: "Puesta en marcha",
    motivo: "Algunos sistemas no terminan de arrancar si falta el asistente de configuración.",
    paquetes: [
      "com.google.android.setupwizard",
      "org.lineageos.setupwizard",
      "com.android.provision",
      "com.android.managedprovisioning",
      "com.google.android.partnersetup",
      "com.android.onetimeinitializer",
      "com.google.android.onetimeinitializer",
    ],
  },
  {
    titulo: "Llamadas, datos y operadora",
    motivo: "Sin ellos puedes quedarte sin llamadas por 4G, sin datos o sin alertas de emergencia.",
    paquetes: [
      "com.android.phone",
      "com.android.server.telecom",
      "com.android.carrierconfig",
      "com.android.carrierdefaultapp",
      "com.google.android.carriersetup",
      "com.android.ims",
      "com.android.ims.rcsservice",
      "org.codeaurora.ims",
      "com.qualcomm.qti.ims",
      "com.android.mms.service",
      "com.android.providers.telephony",
      "com.android.networkstack",
      "com.android.networkstack.tethering",
      "com.android.wifi.resources",
      "com.android.cellbroadcastreceiver",
      "com.android.cellbroadcastreceiver.module",
      "com.android.cellbroadcastservice",
      "com.google.android.cellbroadcastreceiver",
      "com.google.android.cellbroadcastservice",
      "com.qualcomm.qcrilmsgtunnel",
    ],
    familias: [
      { patron: /^com\.android\.carrierconfig\./, texto: "Configuración de operadora de cada modelo (com.android.carrierconfig.*)" },
      { patron: /^com\.android\.wifi\.resources\./, texto: "Ajustes de Wi‑Fi de cada modelo (com.android.wifi.resources.*)" },
      { patron: /^com\.android\.networkstack\./, texto: "Pila de red (com.android.networkstack.*)" },
      { patron: /^com\.qualcomm\.qti\.(telephonyservice|cne|qcrilmsgtunnel)/, texto: "Servicios de telefonía de Qualcomm" },
    ],
  },
  {
    titulo: "Servicios de Google",
    motivo: "Muchas apps (bancos, mensajería, notificaciones) dejan de funcionar sin ellos.",
    paquetes: [
      "com.google.android.gms",
      "com.google.android.gsf",
      "com.android.vending",
      "com.google.android.ext.services",
      "com.google.android.ext.shared",
      "android.ext.services",
    ],
  },
];

const NUNCA = new Set(PROTEGIDOS.flatMap((g) => g.paquetes));
const NUNCA_PATRONES = PROTEGIDOS.flatMap((g) => (g.familias ?? []).map((f) => f.patron));

/** ¿Poda protege este paquete (no se toca nunca)? */
export const estaProtegido = (paquete: string) => NUNCA.has(paquete) || NUNCA_PATRONES.some((r) => r.test(paquete));

/** Cosas que se usan a diario: solo en «experto» y con aviso. */
export const AVISO_PODA: Readonly<Record<string, string>> = {
  "com.android.inputmethod.latin": "Es el teclado. Si no tienes otro instalado, te quedas sin poder escribir.",
  "com.google.android.inputmethod.latin": "Es el teclado (Gboard). Si no tienes otro instalado, te quedas sin poder escribir.",
  "com.android.dialer": "Es la app de llamadas.",
  "com.google.android.dialer": "Es la app de llamadas.",
  "com.android.messaging": "Es la app de SMS.",
  "com.google.android.apps.messaging": "Es la app de SMS.",
  "com.android.contacts": "Es la app de contactos.",
  "com.google.android.contacts": "Es la app de contactos.",
  "com.android.deskclock": "Es el reloj: sin ella no suenan las alarmas.",
  "com.google.android.deskclock": "Es el reloj: sin ella no suenan las alarmas.",
  "com.android.captiveportallogin": "Sin ella no puedes entrar en los Wi‑Fi con página de acceso (hoteles, aeropuertos, trenes).",
  "com.android.hotspot2.osulogin": "Necesaria para algunos Wi‑Fi públicos.",
  "com.google.android.tts": "Es la voz del móvil: el navegador GPS y la accesibilidad la usan.",
  "com.google.android.syncadapters.contacts": "Sincroniza tus contactos con tu cuenta de Google.",
  "com.google.android.syncadapters.calendar": "Sincroniza tu calendario con tu cuenta de Google.",
  "com.google.android.backuptransport": "Hace las copias de seguridad en tu cuenta de Google.",
  "com.android.calendar": "Es la app de calendario.",
  "org.lineageos.etar": "Es la app de calendario.",
  "com.android.stk": "Menú de la SIM: algunas operadoras lo usan para servicios y para activar la línea.",
  "com.android.smspush": "Recibe mensajes de configuración de la operadora.",
  "com.android.emergency": "Muestra tu información de emergencia en la pantalla de bloqueo.",
  "com.android.storagemanager": "Es el apartado de almacenamiento de los ajustes.",
  "com.android.providers.downloads.ui": "Es la lista de descargas.",
  "com.android.chrome": "Si es tu único navegador, te quedas sin navegador.",
  "org.lineageos.jelly": "Si es tu único navegador, te quedas sin navegador.",
  "com.android.gallery3d": "Puede ser tu única galería de fotos.",
  "org.lineageos.snap": "Es la cámara.",
  "com.android.camera2": "Es la cámara.",
  "com.google.android.apps.photos": "Es Google Fotos: comprueba que tus fotos están en la nube o en otra app.",
};

/** Nivel final de un paquete: el de UAD-ng con las correcciones de Poda. */
export function ajustarNivel(paquete: string, nivelUad: Nivel): Nivel {
  if (estaProtegido(paquete)) return "bloqueado";
  if (paquete in AVISO_PODA && nivelUad !== "bloqueado") return "experto";
  return nivelUad;
}
