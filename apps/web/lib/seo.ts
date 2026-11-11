// Datos comunes de SEO: dirección del sitio, textos base y datos estructurados (JSON-LD).
export const URL_BASE = (process.env.NEXT_PUBLIC_URL_BASE ?? "https://podamovil.com").replace(/\/$/, "");
export const NOMBRE = "Poda";
/** Qué significa PODA. «Ocultar y desactivar»: Poda no borra nada del sistema. */
export const REPO = "https://github.com/RedderLabs/PODA";
export const WEB_REDDER = "https://redderlabs.com";
export const X_REDDER = "https://x.com/redderlabs";
export const ACRONIMO = "Programa para Ocultar y Desactivar Apps";
export const TITULO = "Poda — quita el bloatware de tu móvil Android";
export const DESCRIPCION =
  "Poda detecta las apps que el fabricante y la operadora metieron de serie en tu Android y las quita por ti. Desde el navegador, sin instalar nada, sin root y con vuelta atrás.";
export const PALABRAS = [
  "bloatware",
  "quitar bloatware Android",
  "desinstalar apps preinstaladas",
  "apps de fábrica",
  "debloat",
  "sin root",
  "ADB",
  "WebUSB",
  "Xiaomi",
  "Samsung",
  "MIUI",
  "HyperOS",
  "One UI",
  "limpiar móvil Android",
];

export const ORGANIZACION = {
  "@type": "Organization",
  name: "Redder Labs",
  url: "https://redderlabs.com",
  sameAs: ["https://x.com/redderlabs", "https://github.com/RedderLabs"],
};

/** Ruta absoluta a partir de una relativa ("/marcas/" → "https://…/marcas/"). */
export const absoluta = (ruta: string) => `${URL_BASE}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;

/** Migas de pan para buscadores. */
export function migas(items: { nombre: string; ruta: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.nombre, item: absoluta(x.ruta) })),
  };
}

import type { Metadata } from "next";

export const IMAGEN_OG = { url: "/og.png", width: 1200, height: 630, alt: "Poda: tu móvil, sin relleno. Quita las apps de serie de tu Android desde el navegador." };

/** Metadatos de una página: título, descripción, dirección canónica y tarjetas para redes. */
export function metaPagina({
  titulo,
  descripcion,
  ruta,
  imagen = IMAGEN_OG,
}: {
  titulo: string;
  descripcion: string;
  ruta: string;
  imagen?: { url: string; width: number; height: number; alt: string };
}): Metadata {
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph: { type: "website", locale: "es_ES", siteName: NOMBRE, url: ruta, title: `${titulo} | ${NOMBRE}`, description: descripcion, images: [imagen] },
    twitter: { card: "summary_large_image", site: "@redderlabs", title: `${titulo} | ${NOMBRE}`, description: descripcion, images: [imagen] },
  };
}
