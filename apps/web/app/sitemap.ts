import type { MetadataRoute } from "next";
import { MARCAS } from "@/lib/marcas";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_URL_BASE ?? "https://podamovil.com";
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/conectar/`, priority: 0.9 },
    { url: `${base}/sin-pc/`, priority: 0.7 },
    { url: `${base}/rescate/`, priority: 0.5 },
    { url: `${base}/marcas/`, priority: 0.8 },
    ...MARCAS.map((m) => ({ url: `${base}/marcas/${m.slug}/`, priority: 0.7 })),
  ];
}
