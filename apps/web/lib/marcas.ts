// Fabricantes para las páginas /marcas/[marca]. Los prefijos vienen de data/fabricantes.json.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { paquetesDeFabricante, type ListaUad } from "@poda/nucleo";

const DATA = join(process.cwd(), "..", "..", "data");

export interface Marca {
  slug: string;
  nombre: string; // corto, para titulares
  clave: string; // clave en fabricantes.json
}

export const MARCAS: Marca[] = [
  { slug: "samsung", nombre: "Samsung", clave: "Samsung (One UI)" },
  { slug: "xiaomi", nombre: "Xiaomi, Redmi y POCO", clave: "Xiaomi, Redmi y POCO (HyperOS / MIUI)" },
  { slug: "oppo-realme-oneplus", nombre: "OPPO, realme y OnePlus", clave: "OPPO, realme y OnePlus (ColorOS / OxygenOS / realme UI)" },
  { slug: "huawei", nombre: "Huawei", clave: "Huawei (EMUI / HarmonyOS 4 o anterior)" },
  { slug: "honor", nombre: "Honor", clave: "Honor (MagicOS)" },
  { slug: "motorola", nombre: "Motorola", clave: "Motorola" },
  { slug: "google-pixel", nombre: "Google Pixel", clave: "Google Pixel" },
  { slug: "vivo", nombre: "vivo e iQOO", clave: "vivo e iQOO (Funtouch / OriginOS)" },
  { slug: "sony", nombre: "Sony Xperia", clave: "Sony Xperia" },
  { slug: "lg", nombre: "LG", clave: "LG" },
  { slug: "nokia", nombre: "Nokia y HMD", clave: "Nokia / HMD" },
  { slug: "tcl-alcatel", nombre: "TCL y Alcatel", clave: "TCL y Alcatel" },
  { slug: "zte-nubia", nombre: "ZTE y nubia", clave: "ZTE y nubia" },
  { slug: "tecno-infinix-itel", nombre: "Tecno, Infinix e itel", clave: "Tecno, Infinix e itel (Transsion)" },
  { slug: "asus", nombre: "ASUS", clave: "ASUS (ZenUI / ROG)" },
  { slug: "lenovo", nombre: "Lenovo", clave: "Lenovo (ZUI)" },
  { slug: "meizu", nombre: "Meizu", clave: "Meizu (Flyme)" },
  { slug: "nothing", nombre: "Nothing", clave: "Nothing (Nothing OS)" },
  { slug: "blackview", nombre: "Blackview", clave: "Blackview" },
];

const leer = <T,>(f: string): T => JSON.parse(readFileSync(join(DATA, f), "utf8")) as T;

let uadCache: ListaUad | null = null;
export const uad = () => (uadCache ??= leer<ListaUad>("uad_lists.json"));
export const prefijos = (m: Marca) => leer<Record<string, string[]>>("fabricantes.json")[m.clave] ?? [];

export interface ResumenMarca {
  total: number;
  seguro: number;
  avanzado: number;
  experto: number;
  bloqueado: number;
}
/** Recuento por nivel con las correcciones de Poda (no el de UAD-ng sin tocar). */
export function resumenDe(m: Marca): ResumenMarca {
  const r: ResumenMarca = { total: 0, seguro: 0, avanzado: 0, experto: 0, bloqueado: 0 };
  for (const x of paquetesDeFabricante(uad(), prefijos(m))) {
    r.total++;
    r[x.nivel]++;
  }
  return r;
}
export const marcaPorSlug = (slug: string) => MARCAS.find((m) => m.slug === slug);
