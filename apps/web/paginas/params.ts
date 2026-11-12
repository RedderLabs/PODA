// Lee el idioma de la dirección (/en/…). Solo se generan los idiomas conocidos, pero se comprueba igual.
import { notFound } from "next/navigation";
import { esIdioma, type Idioma } from "@/lib/i18n";

export type ParamsIdioma = { idioma: string };

export async function idiomaDe(params: Promise<ParamsIdioma>): Promise<Idioma> {
  const { idioma } = await params;
  if (!esIdioma(idioma)) notFound();
  return idioma;
}
