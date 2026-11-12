import { Inicio } from "@/paginas/Inicio";
import { idiomaDe, type ParamsIdioma } from "@/paginas/params";

export default async function Pagina({ params }: { params: Promise<ParamsIdioma> }) {
  return <Inicio idioma={await idiomaDe(params)} />;
}
