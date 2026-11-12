import type { MetadataRoute } from "next";
import { MARCAS } from "@/lib/marcas";
import { alternativas, IDIOMAS, ruta } from "@/lib/i18n";
import { URL_BASE } from "@/lib/seo";

export const dynamic = "force-static";

/** Cada página en cada idioma, con sus alternativas (hreflang) para los buscadores. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paginas: { r: string; priority: number }[] = [
    { r: "/", priority: 1 },
    { r: "/conectar/", priority: 0.9 },
    { r: "/sin-pc/", priority: 0.7 },
    { r: "/rescate/", priority: 0.5 },
    { r: "/marcas/", priority: 0.8 },
    ...MARCAS.map((m) => ({ r: `/marcas/${m.slug}/`, priority: 0.7 })),
  ];
  const absoluta = (x: string) => `${URL_BASE}${x}`;
  return paginas.flatMap(({ r, priority }) => {
    const languages = Object.fromEntries(Object.entries(alternativas(r)).map(([i, x]) => [i, absoluta(x)]));
    return IDIOMAS.map((i) => ({ url: absoluta(ruta(i, r)), priority, alternates: { languages } }));
  });
}
