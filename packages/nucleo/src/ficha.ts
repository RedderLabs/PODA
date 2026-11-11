// Convierte la salida de `getprop` en una ficha legible del móvil.
// Sin dependencias del navegador: se prueba con Node.

export interface Ficha {
  nombre: string; // "Redmi Note 8 Pro" o, si no hay nombre comercial, el modelo
  fabricante: string;
  marca: string;
  modelo: string; // código de modelo, p. ej. M1906G7G
  android: string; // "11"
  sdk: number; // 30
  capa: string | null; // "MIUI 12.5.4", "HyperOS 1.0", "One UI 6.1"...
  parche: string | null; // parche de seguridad, AAAA-MM-DD
  familia: Familia;
  /** Sistema alternativo (LineageOS, crDroid…): casi sin bloatware de fábrica y sin los ajustes del fabricante. */
  romPersonalizada: string | null;
  wifiPosible: boolean; // depuración inalámbrica con código (Android 11+)
  quitarPosible: boolean; // pm uninstall --user 0 (Android 5+)
  avisos: string[];
}

export type Familia =
  | "xiaomi"
  | "samsung"
  | "oplus"
  | "vivo"
  | "huawei"
  | "honor"
  | "motorola"
  | "google"
  | "otra";

export function parsearGetprop(texto: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const linea of texto.split(/\r?\n/)) {
    const m = linea.match(/^\[([^\]]+)\]: \[(.*)\]$/);
    if (m) props[m[1]] = m[2];
  }
  return props;
}

const primera = (p: Record<string, string>, claves: string[]) => {
  for (const c of claves) {
    const v = p[c]?.trim();
    if (v) return v;
  }
  return "";
};

function familiaDe(fabricante: string, marca: string): Familia {
  const t = `${fabricante} ${marca}`.toLowerCase();
  if (/xiaomi|redmi|poco/.test(t)) return "xiaomi";
  if (/samsung/.test(t)) return "samsung";
  if (/oppo|realme|oneplus/.test(t)) return "oplus";
  if (/vivo|iqoo/.test(t)) return "vivo";
  if (/honor/.test(t)) return "honor";
  if (/huawei/.test(t)) return "huawei";
  if (/motorola|lenovo/.test(t)) return "motorola";
  if (/google/.test(t)) return "google";
  return "otra";
}

/** Detecta un sistema alternativo y devuelve «Nombre versión», o null si es el sistema de fábrica. */
export function romPersonalizadaDe(p: Record<string, string>): string | null {
  const conocidas: [string, string[]][] = [
    ["LineageOS", ["ro.lineage.build.version", "ro.cm.build.version"]],
    ["crDroid", ["ro.crdroid.build.version", "ro.crdroid.version"]],
    ["Pixel Experience", ["org.pixelexperience.version"]],
    ["Evolution X", ["org.evolution.build_version", "org.evolution.version"]],
    ["/e/OS", ["ro.e.version"]],
  ];
  for (const [nombre, claves] of conocidas) {
    const v = primera(p, claves);
    if (v) return `${nombre} ${v.split(/[-_]/)[0]}`.trim();
  }
  const id = `${p["ro.build.display.id"] ?? ""} ${p["ro.build.flavor"] ?? ""}`.toLowerCase();
  const porNombre: [RegExp, string][] = [
    [/lineage/, "LineageOS"],
    [/crdroid/, "crDroid"],
    [/pixelexperience|pixel_experience/, "Pixel Experience"],
    [/evolution/, "Evolution X"],
    [/grapheneos/, "GrapheneOS"],
    [/calyx/, "CalyxOS"],
    [/(^|\b)e_|eos/, "/e/OS"],
  ];
  for (const [re, nombre] of porNombre) if (re.test(id)) return nombre;
  return null;
}

/** "V125" → "12.5", "V14" → "14", "V130" → "13" */
function versionMiui(nombre: string): string {
  const n = nombre.replace(/^V/i, "");
  if (/^\d{3}$/.test(n)) {
    const mayor = n.slice(0, 2);
    const menor = n.slice(2);
    return menor === "0" ? mayor : `${mayor}.${menor}`;
  }
  return n;
}

function capaDe(p: Record<string, string>, familia: Familia): string | null {
  // Xiaomi: HyperOS desde 2023, MIUI antes.
  const hyper = p["ro.mi.os.version.name"];
  if (hyper) return `HyperOS ${hyper.replace(/^OS/i, "")}`;
  const miui = p["ro.miui.ui.version.name"];
  if (miui) {
    const inc = p["ro.build.version.incremental"] ?? "";
    const exacta = inc.match(/^V(\d+(?:\.\d+){1,3})/);
    return `MIUI ${exacta ? exacta[1].split(".").slice(0, 3).join(".") : versionMiui(miui)}`;
  }
  // Samsung: 60100 → One UI 6.1, 60101 → 6.1.1
  const oneui = p["ro.build.version.oneui"];
  if (oneui && /^\d{5}$/.test(oneui)) {
    const n = Number(oneui);
    const mayor = Math.floor(n / 10000);
    const menor = Math.floor((n % 10000) / 100);
    const parche = n % 100;
    return `One UI ${mayor}.${menor}${parche ? "." + parche : ""}`;
  }
  // OPPO, realme y OnePlus comparten base.
  const oplus = primera(p, ["ro.build.version.oplusrom", "ro.build.version.opporom"]);
  if (oplus) {
    const nombre = familia === "oplus" && /realme/i.test(p["ro.product.brand"] ?? "") ? "realme UI" : /oneplus/i.test(p["ro.product.brand"] ?? "") ? "OxygenOS" : "ColorOS";
    return `${nombre} (base ${oplus.replace(/^V/i, "")})`;
  }
  const vivo = p["ro.vivo.os.version"];
  if (vivo) return `${p["ro.vivo.os.name"] || "Funtouch OS"} ${vivo}`;
  // Huawei con HarmonyOS basado en Android, o EMUI.
  const harmony = p["hw_sc.build.platform.version"];
  if (harmony && familia === "huawei") return `HarmonyOS ${harmony}`;
  const emui = p["ro.build.version.emui"];
  if (emui) return emui.replace(/^EmotionUI_?/i, "EMUI ").replace(/^MagicUI_?/i, "MagicOS ");
  const magic = p["ro.build.version.magic"];
  if (magic) return `MagicOS ${magic.replace(/^MagicUI_?|^MagicOS_?/i, "")}`;
  if (familia === "google") return "Android de Google (Pixel)";
  return null;
}

function avisosDe(f: Omit<Ficha, "avisos">): string[] {
  const a: string[] = [];
  if (f.romPersonalizada) {
    a.push(`Llevas ${f.romPersonalizada}, un sistema alternativo: casi no trae apps de fábrica, así que Poda encontrará poco que quitar.`);
  }
  const deFabrica = !f.romPersonalizada;
  if (deFabrica && f.familia === "xiaomi") {
    a.push(
      "Activa también «Depuración USB (ajustes de seguridad)» en Opciones de desarrollador. Pide iniciar sesión con tu cuenta Xiaomi y, en algunas versiones, tener una SIM puesta. Sin ella, algunos paquetes no se dejarán tocar.",
    );
  }
  if (deFabrica && f.familia === "samsung") {
    a.push("Si tienes activado el «Bloqueador automático» (Ajustes → Seguridad y privacidad), apágalo mientras usas Poda: bloquea los comandos por USB. Vuelve a encenderlo al terminar.");
  }
  if (deFabrica && (f.familia === "huawei" || f.familia === "honor")) {
    a.push("Funciona con EMUI, MagicOS y HarmonyOS 4 o anterior. HarmonyOS NEXT (5 o superior) ya no es Android.");
  }
  if (f.sdk === 0) a.push("No se pudo leer la versión de Android: comprueba que el móvil sigue conectado y autorizado.");
  if (!f.quitarPosible) a.push("Tu versión de Android es anterior a la 5.0: solo se pueden desactivar apps, no quitarlas.");
  if (f.sdk > 0 && !f.wifiPosible) a.push("Con esta versión de Android la conexión tiene que ser por cable (la depuración inalámbrica llega en Android 11).");
  return a;
}

export function fichaDesdeProps(p: Record<string, string>): Ficha {
  const fabricante = primera(p, ["ro.product.manufacturer", "ro.product.vendor.manufacturer"]) || "Desconocido";
  const marca = primera(p, ["ro.product.brand", "ro.product.vendor.brand"]) || fabricante;
  const modelo = primera(p, ["ro.product.model", "ro.product.vendor.model"]) || "modelo desconocido";
  const comercial = primera(p, ["ro.product.marketname", "ro.product.vendor.marketname", "ro.config.marketing_name", "ro.product.odm.marketname"]);
  const sdk = Number(p["ro.build.version.sdk"] || 0);
  const familia = familiaDe(fabricante, marca);
  const romPersonalizada = romPersonalizadaDe(p);
  const NOMBRES: Record<string, string> = { lge: "LG", lg: "LG", hmd: "HMD", tcl: "TCL", zte: "ZTE", asus: "ASUS", hmd_global: "HMD" };
  const capitalizar = (s: string) => NOMBRES[s.toLowerCase()] ?? (s ? s[0].toUpperCase() + s.slice(1) : s);
  let nombre = comercial || modelo;
  // Añade la marca delante si el nombre no la lleva ya ("SM-S918B" → "Samsung SM-S918B").
  const conMarca = /^(redmi|poco|mi |xiaomi|galaxy|pixel|oneplus|realme|oppo|vivo|iqoo|honor|huawei|moto|motorola|nokia|xperia|nothing|zenfone|rog)/i;
  const n = nombre.toLowerCase();
  if (!conMarca.test(nombre) && !n.includes(marca.toLowerCase()) && !n.includes(fabricante.toLowerCase())) {
    nombre = `${capitalizar(marca)} ${nombre}`;
  }
  const base = {
    nombre,
    fabricante: capitalizar(fabricante),
    marca: capitalizar(marca),
    modelo,
    android: p["ro.build.version.release"] || "?",
    sdk,
    capa: romPersonalizada ?? capaDe(p, familia),
    parche: p["ro.build.version.security_patch"] || null,
    familia,
    romPersonalizada,
    wifiPosible: sdk >= 30,
    quitarPosible: sdk === 0 || sdk >= 21,
  };
  return { ...base, avisos: avisosDe(base) };
}

/** Claves que se enseñan en «Detalles técnicos» para depurar. */
export const CLAVES_TECNICAS = [
  "ro.product.manufacturer",
  "ro.product.brand",
  "ro.product.model",
  "ro.product.marketname",
  "ro.product.device",
  "ro.build.version.release",
  "ro.build.version.sdk",
  "ro.build.version.security_patch",
  "ro.build.version.incremental",
  "ro.build.display.id",
  "ro.mi.os.version.name",
  "ro.miui.ui.version.name",
  "ro.build.version.oneui",
  "ro.build.version.oplusrom",
  "ro.build.version.opporom",
  "ro.vivo.os.version",
  "ro.build.version.emui",
  "hw_sc.build.platform.version",
  "ro.build.version.magic",
  "ro.lineage.build.version",
  "ro.lineage.version",
  "ro.crdroid.build.version",
  "org.pixelexperience.version",
];
