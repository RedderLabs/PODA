import type { MetadataRoute } from "next";
import { DESCRIPCION, NOMBRE } from "@/lib/seo";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${NOMBRE} — quita el bloatware de tu Android`,
    short_name: NOMBRE,
    description: DESCRIPCION,
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: "#efede7",
    theme_color: "#efede7",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
