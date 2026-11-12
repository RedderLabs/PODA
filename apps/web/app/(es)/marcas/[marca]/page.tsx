import { metaMarca, PaginaMarca } from "@/paginas/Marcas";
import { MARCAS } from "@/lib/marcas";

type Params = { marca: string };

export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return MARCAS.map((m) => ({ marca: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  return metaMarca("es", (await params).marca);
}

export default async function Pagina({ params }: { params: Promise<Params> }) {
  return <PaginaMarca idioma="es" slug={(await params).marca} />;
}
