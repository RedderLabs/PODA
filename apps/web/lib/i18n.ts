// Diccionarios de la web. Solo para el servidor (páginas y layouts): importa todos los idiomas.
// Los componentes de cliente reciben el suyo con useTextos(), y las rutas están en ./rutas.
import type { Idioma } from "@poda/nucleo";
import { es, type Textos } from "@/textos/es";
import { en } from "@/textos/en";
import { pt } from "@/textos/pt";
import { fr } from "@/textos/fr";
import { ca } from "@/textos/ca";

export * from "./rutas";
export type { Textos };

const TEXTOS: Record<Idioma, Textos> = { es, en, pt, fr, ca };
export const textosDe = (idioma: Idioma): Textos => TEXTOS[idioma];
