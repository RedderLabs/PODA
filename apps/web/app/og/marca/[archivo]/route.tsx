// Imagen para compartir cada página de marca: /og/marca/xiaomi.png
import { ogMarca } from "@/lib/og";
import { MARCAS } from "@/lib/marcas";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return MARCAS.map((m) => ({ archivo: `${m.slug}.png` }));
}

export async function GET(_: Request, { params }: { params: Promise<{ archivo: string }> }) {
  return ogMarca("es", (await params).archivo);
}
