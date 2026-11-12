// Layout raíz del español (sin prefijo en la dirección).
import { Raiz, VIEWPORT } from "@/components/Raiz";
import { metaRaiz } from "@/lib/seo";

export const metadata = metaRaiz("es");
export const viewport = VIEWPORT;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Raiz idioma="es">{children}</Raiz>;
}
