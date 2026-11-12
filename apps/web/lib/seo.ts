// Datos comunes de SEO: dirección del sitio, textos base y datos estructurados (JSON-LD).
export const URL_BASE = (process.env.NEXT_PUBLIC_URL_BASE ?? "https://podamovil.com").replace(/\/$/, "");
export const NOMBRE = "Poda";
export const REPO = "https://github.com/RedderLabs/PODA";
export const WEB_REDDER = "https://redderlabs.com";
export const X_REDDER = "https://x.com/redderlabs";
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
import { alternativas, ruta as rutaEn, textosDe, type Idioma } from "./i18n";

type Imagen = { url: string; width: number; height: number; alt: string };

/** Imagen para compartir de la portada en un idioma. */
export function imagenOg(idioma: Idioma): Imagen {
  return { url: rutaEn(idioma, "/og.png"), width: 1200, height: 630, alt: textosDe(idioma).seo.imagenAlt };
}

/** Metadatos comunes de un idioma (los pone el layout). */
export function metaRaiz(idioma: Idioma): Metadata {
  const t = textosDe(idioma);
  const imagen = imagenOg(idioma);
  return {
    metadataBase: new URL(URL_BASE),
    title: { default: t.seo.titulo, template: `%s | ${NOMBRE}` },
    description: t.seo.descripcion,
    applicationName: NOMBRE,
    keywords: t.seo.palabras,
    authors: [{ name: "Redder Labs", url: "https://redderlabs.com" }],
    creator: "Redder Labs",
    publisher: "Redder Labs",
    category: "technology",
    alternates: { canonical: rutaEn(idioma, "/"), languages: alternativas("/") },
    openGraph: { type: "website", locale: t.idioma.locale, siteName: NOMBRE, url: rutaEn(idioma, "/"), title: t.seo.titulo, description: t.seo.descripcion, images: [imagen] },
    twitter: { card: "summary_large_image", site: "@redderlabs", creator: "@redderlabs", title: t.seo.titulo, description: t.seo.descripcion, images: [imagen] },
    icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

/** Metadatos de una página: título, descripción, canónica, hreflang y tarjetas para redes. `r` es la ruta en español. */
export function metaPagina({
  idioma,
  titulo,
  descripcion,
  r,
  imagen,
}: {
  idioma: Idioma;
  titulo: string;
  descripcion: string;
  r: string;
  imagen?: Imagen;
}): Metadata {
  const t = textosDe(idioma);
  const url = rutaEn(idioma, r);
  const img = imagen ?? imagenOg(idioma);
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url, languages: alternativas(r) },
    openGraph: { type: "website", locale: t.idioma.locale, siteName: NOMBRE, url, title: `${titulo} | ${NOMBRE}`, description: descripcion, images: [img] },
    twitter: { card: "summary_large_image", site: "@redderlabs", title: `${titulo} | ${NOMBRE}`, description: descripcion, images: [img] },
  };
}
