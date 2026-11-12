import { PaginaConectar, metaConectar } from "@/paginas/PaginaConectar";
import { idiomaDe, type ParamsIdioma } from "@/paginas/params";

export async function generateMetadata({ params }: { params: Promise<ParamsIdioma> }) {
  return metaConectar(await idiomaDe(params));
}

export default async function Pagina({ params }: { params: Promise<ParamsIdioma> }) {
  return <PaginaConectar idioma={await idiomaDe(params)} />;
}
