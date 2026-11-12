// Imagen para compartir la portada en otro idioma: /en/og.png
import { ogPortada } from "@/lib/og";
import { esIdioma, IDIOMAS_CON_PREFIJO } from "@/lib/i18n";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return IDIOMAS_CON_PREFIJO.map((idioma) => ({ idioma }));
}

export async function GET(_: Request, { params }: { params: Promise<{ idioma: string }> }) {
  const { idioma } = await params;
  if (!esIdioma(idioma)) return new Response("No existe", { status: 404 });
  return ogPortada(idioma);
}
