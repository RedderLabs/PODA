import { Estadisticas, metaEstadisticas } from "@/paginas/Estadisticas";
import { idiomaDe, type ParamsIdioma } from "@/paginas/params";

export async function generateMetadata({ params }: { params: Promise<ParamsIdioma> }) {
  return metaEstadisticas(await idiomaDe(params));
}

export default async function Pagina({ params }: { params: Promise<ParamsIdioma> }) {
  return <Estadisticas idioma={await idiomaDe(params)} />;
}
