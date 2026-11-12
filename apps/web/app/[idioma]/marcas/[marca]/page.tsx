import { metaMarca, PaginaMarca } from "@/paginas/Marcas";
import { MARCAS } from "@/lib/marcas";
import { idiomaDe, type ParamsIdioma } from "@/paginas/params";

type Params = ParamsIdioma & { marca: string };

export const dynamicParams = false;
export function generateStaticParams(): { marca: string }[] {
  return MARCAS.map((m) => ({ marca: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  return metaMarca(await idiomaDe(params), (await params).marca);
}

export default async function Pagina({ params }: { params: Promise<Params> }) {
  return <PaginaMarca idioma={await idiomaDe(params)} slug={(await params).marca} />;
}
