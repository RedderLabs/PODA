// Layout raíz de los demás idiomas: /en/, /pt/, /fr/, /ca/.
import { Raiz, VIEWPORT } from "@/components/Raiz";
import { IDIOMAS_CON_PREFIJO } from "@/lib/i18n";
import { metaRaiz } from "@/lib/seo";
import { idiomaDe, type ParamsIdioma } from "@/paginas/params";

export const dynamicParams = false;
export const viewport = VIEWPORT;

export function generateStaticParams() {
  return IDIOMAS_CON_PREFIJO.map((idioma) => ({ idioma }));
}

export async function generateMetadata({ params }: { params: Promise<ParamsIdioma> }) {
  return metaRaiz(await idiomaDe(params));
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<ParamsIdioma> }) {
  return <Raiz idioma={await idiomaDe(params)}>{children}</Raiz>;
}
