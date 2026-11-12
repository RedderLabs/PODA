// <html> de cada idioma. Hay dos layouts raíz (español en "/" y los demás en "/xx/") para que cada
// página salga con su `lang` correcto en el HTML estático. Los dos usan este componente.
import type { Viewport } from "next";
import "@/app/globals.css";
import { textosDe, type Idioma } from "@/lib/i18n";
import { ProveedorTextos } from "./Textos";

export const VIEWPORT: Viewport = {
  themeColor: "#efede7",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function Raiz({ idioma, children }: { idioma: Idioma; children: React.ReactNode }) {
  return (
    <html lang={idioma}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <ProveedorTextos idioma={idioma} t={textosDe(idioma)}>
          {children}
        </ProveedorTextos>
      </body>
    </html>
  );
}
