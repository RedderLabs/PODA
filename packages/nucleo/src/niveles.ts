// Niveles de riesgo, perfiles y orígenes. Una sola definición para la web, el MCP y la línea de comandos.

export const NIVELES = ["seguro", "avanzado", "experto", "bloqueado"] as const;
export type Nivel = (typeof NIVELES)[number];

export const PERFILES = ["seguro", "recomendado", "experto"] as const;
export type Perfil = (typeof PERFILES)[number];

/** Equivalencia con la lista de Universal Android Debloater Next Generation. */
export const NIVEL_DE_UAD: Record<string, Nivel> = {
  Recommended: "seguro",
  Advanced: "avanzado",
  Expert: "experto",
  Unsafe: "bloqueado",
};

/** Qué niveles entran en cada perfil. «bloqueado» no entra nunca. */
export const NIVELES_DE_PERFIL: Record<Perfil, readonly Nivel[]> = {
  seguro: ["seguro"],
  recomendado: ["seguro", "avanzado"],
  experto: ["seguro", "avanzado", "experto"],
};

export const DESCRIPCION_NIVEL: Record<Nivel, string> = {
  seguro: "Anuncios, telemetría, duplicados y apps de relleno. Quitarlo no rompe nada.",
  avanzado: "Servicios que funcionan pero que mucha gente no usa. Puedes echar algo en falta.",
  experto: "Puede afectar a funciones del sistema. Solo si sabes lo que quitas.",
  bloqueado: "Puede dejar el móvil sin arrancar. Poda no lo toca nunca.",
};

export const ORIGENES = ["fabricante", "operadora", "Google", "terceros", "Android base"] as const;
export type Origen = (typeof ORIGENES)[number];

export const ORIGEN_DE_UAD: Record<string, Origen> = {
  Oem: "fabricante",
  Carrier: "operadora",
  Google: "Google",
  Misc: "terceros",
  Aosp: "Android base",
};
