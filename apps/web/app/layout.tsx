import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DESCRIPCION, IMAGEN_OG, NOMBRE, PALABRAS, TITULO, URL_BASE } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(URL_BASE),
  title: { default: TITULO, template: `%s | ${NOMBRE}` },
  description: DESCRIPCION,
  applicationName: NOMBRE,
  keywords: PALABRAS,
  authors: [{ name: "Redder Labs", url: "https://redderlabs.com" }],
  creator: "Redder Labs",
  publisher: "Redder Labs",
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: NOMBRE,
    url: "/",
    title: TITULO,
    description: DESCRIPCION,
    images: [IMAGEN_OG],
  },
  twitter: {
    card: "summary_large_image",
    site: "@redderlabs",
    creator: "@redderlabs",
    title: TITULO,
    description: DESCRIPCION,
    images: [IMAGEN_OG],
  },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }] },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#efede7",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
