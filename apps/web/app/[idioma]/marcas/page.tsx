import { Marcas, metaMarcas } from "@/paginas/Marcas";
import { idiomaDe, type ParamsIdioma } from "@/paginas/params";

export async function generateMetadata({ params }: { params: Promise<ParamsIdioma> }) {
  return metaMarcas(await idiomaDe(params));
}

export default async function Pagina({ params }: { params: Promise<ParamsIdioma> }) {
  return <Marcas idioma={await idiomaDe(params)} />;
}
