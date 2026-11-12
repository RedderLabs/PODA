import { SinPc, metaSinPc } from "@/paginas/SinPc";
import { idiomaDe, type ParamsIdioma } from "@/paginas/params";

export async function generateMetadata({ params }: { params: Promise<ParamsIdioma> }) {
  return metaSinPc(await idiomaDe(params));
}

export default async function Pagina({ params }: { params: Promise<ParamsIdioma> }) {
  return <SinPc idioma={await idiomaDe(params)} />;
}
