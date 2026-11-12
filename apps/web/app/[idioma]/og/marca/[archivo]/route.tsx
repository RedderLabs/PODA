// Imagen para compartir cada página de marca en otro idioma: /en/og/marca/xiaomi.png
import { ogMarca } from "@/lib/og";
import { esIdioma, IDIOMAS_CON_PREFIJO } from "@/lib/i18n";
import { MARCAS } from "@/lib/marcas";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return IDIOMAS_CON_PREFIJO.flatMap((idioma) => MARCAS.map((m) => ({ idioma, archivo: `${m.slug}.png` })));
}

export async function GET(_: Request, { params }: { params: Promise<{ idioma: string; archivo: string }> }) {
  const { idioma, archivo } = await params;
  if (!esIdioma(idioma)) return new Response("No existe", { status: 404 });
  return ogMarca(idioma, archivo);
}
