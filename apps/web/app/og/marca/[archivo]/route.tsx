// Imagen para compartir cada página de marca: /og/marca/xiaomi.png
import { imagenOg } from "@/lib/og";
import { MARCAS, marcaPorSlug, resumenDe } from "@/lib/marcas";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return MARCAS.map((m) => ({ archivo: `${m.slug}.png` }));
}

export async function GET(_: Request, { params }: { params: Promise<{ archivo: string }> }) {
  const m = marcaPorSlug((await params).archivo.replace(/\.png$/, ""));
  if (!m) return new Response("No existe", { status: 404 });
  const r = resumenDe(m);
  return imagenOg({
    etiqueta: "Bloatware por marca",
    titulo: m.nombre,
    resaltado: `${r.seguro} apps fuera sin riesgo`,
    pie: `De ${r.total} apps propias que Poda conoce. Sin root y con vuelta atrás.`,
  });
}
