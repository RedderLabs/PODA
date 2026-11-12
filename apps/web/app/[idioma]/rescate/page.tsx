import { Rescate, metaRescate } from "@/paginas/Rescate";
import { idiomaDe, type ParamsIdioma } from "@/paginas/params";

export async function generateMetadata({ params }: { params: Promise<ParamsIdioma> }) {
  return metaRescate(await idiomaDe(params));
}

export default async function Pagina({ params }: { params: Promise<ParamsIdioma> }) {
  return <Rescate idioma={await idiomaDe(params)} />;
}
